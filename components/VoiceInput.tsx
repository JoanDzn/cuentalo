import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Loader2, Check, X, Sparkles, StopCircle, Keyboard, Send, Target } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { parseExpenseVoiceCommand } from '../services/geminiService';
import { AppState, ExpenseAnalysis } from '../types';

interface VoiceInputProps {
  onExpenseAdded: (expense: ExpenseAnalysis) => void;
  onMissionsClick?: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onExpenseAdded, onMissionsClick }) => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');

  // Animation values for swipe interaction
  const x = useMotionValue(0);
  const micOpacity = useTransform(x, [0, 40], [1, 0]);
  const keyboardOpacity = useTransform(x, [20, 60], [0, 1]);
  const bgScale = useTransform(x, [0, 60], [1, 1.1]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onExpenseAddedRef = useRef(onExpenseAdded);

  useEffect(() => {
    onExpenseAddedRef.current = onExpenseAdded;
  }, [onExpenseAdded]);

  // Robust Text Processing
  const processValues = useCallback(async (text: string) => {
    if (!text || !text.trim() || processingRef.current) return;

    processingRef.current = true;
    setState(AppState.PROCESSING);

    try {
      // Optimistic Update / Feedback
      const result = await parseExpenseVoiceCommand(text);
      if (onExpenseAddedRef.current) {
        onExpenseAddedRef.current(result);
      }
      setState(AppState.SUCCESS);
      setTimeout(() => {
        setState(AppState.IDLE);
        setTranscript('');
        setInputText('');
        processingRef.current = false;
      }, 2000); // Show success for 2s
    } catch (e) {
      console.error(e);
      setState(AppState.ERROR);
      setTimeout(() => {
        setState(AppState.IDLE);
        processingRef.current = false;
      }, 2000);
    }
  }, []);

  // initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Mobile friendly
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES'; // Force Spanish

      recognitionRef.current.onstart = () => {
        processingRef.current = false;
        setTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interimTranscript += event.results[i][0].transcript;
        }
        setTranscript(interimTranscript);

        if (event.results[0].isFinal) {
          processValues(event.results[0][0].transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error", event);
        if (event.error === 'no-speech' || event.error === 'aborted') {
          // Ignore silent errors or manual aborts
          return;
        }
        // Fallback or restart logic could go here
        setState(AppState.ERROR);
        setTimeout(() => setState(AppState.IDLE), 2000);
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if we think it stopped prematurely? No, better to let user click again.
        if (state === AppState.LISTENING && !processingRef.current) {
          // Check if we got result?
          setTimeout(() => {
            if (state === AppState.LISTENING) setState(AppState.IDLE);
          }, 1000);
        }
      };
    }
  }, [processValues, state]);

  // Fallback: MediaRecorder Logic (For browsers without SpeechRecognition)
  const startRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // TODO: Send this blob to backend -> Gemini for transcription
        // For now, mockup or alert user
        console.log("Recorded Audio Blob:", audioBlob);
        // Simulate processing
        setState(AppState.PROCESSING);
        setTimeout(() => {
          setState(AppState.ERROR); // Placeholder until backend endpoint exists
          alert("Modo Grabación (Backup) activado. Implementar endpoint de audio -> texto.");
        }, 1500);
      };

      mediaRecorder.start();
      setState(AppState.LISTENING);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("No se pudo acceder al micrófono.");
      setState(AppState.IDLE);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        // Stop any previous instance just in case
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort errors on start
      }

      // Small delay to allow abort to process if needed
      setTimeout(() => {
        try {
          setTranscript('');
          setState(AppState.LISTENING);
          processingRef.current = false;
          recognitionRef.current.start();
        } catch (e) {
          console.error("Start error:", e);
          setState(AppState.ERROR);
          setTimeout(() => setState(AppState.IDLE), 2000);
        }
      }, 100);
    } else {
      // Use MediaRecorder Fallback
      startRecordingFallback();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // ... (Rest of UI remains similar but optimized)

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      processValues(inputText);
    }
  };

  const cancelAction = () => {
    if (recognitionRef.current) recognitionRef.current.abort();
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setState(AppState.IDLE);
    setTranscript('');
    setInputText('');
    processingRef.current = false;
  };

  // Focus input
  useEffect(() => {
    if (state === AppState.TYPING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  return (
    <AnimatePresence>
      {state !== AppState.IDLE && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={cancelAction}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={24} />
          </motion.button>

          {/* Status Visuals */}
          <div className="relative mb-8">
            <AnimatePresence mode="wait">
              {state === AppState.LISTENING && (
                <motion.div
                  key="listening"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-red-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1.1, 1] }}
                    className="w-24 h-24 bg-gradient-to-tr from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-red-500/30 shadow-2xl relative z-10"
                  >
                    <Mic size={40} className="text-white" />
                  </motion.div>
                </motion.div>
              )}
              {state === AppState.PROCESSING && (
                <motion.div
                  key="processing"
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 size={60} className="text-blue-500 animate-spin" />
                </motion.div>
              )}
              {state === AppState.SUCCESS && (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-emerald-500/30 shadow-2xl"
                >
                  <Check size={48} className="text-white" />
                </motion.div>
              )}
              {state === AppState.ERROR && (
                <motion.div
                  key="error"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center"
                >
                  <X size={48} className="text-white" />
                </motion.div>
              )}
              {state === AppState.TYPING && (
                <motion.div
                  key="typing"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-indigo-600/30 shadow-2xl"
                >
                  <Keyboard size={40} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.h2
            key="status-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-widest text-center"
          >
            {state === AppState.LISTENING ? "Te escucho..." :
              state === AppState.PROCESSING ? "Procesando..." :
                state === AppState.SUCCESS ? "¡Listo!" :
                  state === AppState.ERROR ? "Error" : "Escribe"}
          </motion.h2>

          {/* Dynamic Content Area */}
          <div className="w-full max-w-md text-center min-h-[100px] flex flex-col items-center justify-center">
            {state === AppState.TYPING ? (
              <form onSubmit={handleTextSubmit} className="w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Gasté $20 en comida..."
                  className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 text-3xl font-bold text-center py-2 focus:border-blue-500 outline-none dark:text-white"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg"
                >
                  Enviar
                </motion.button>
              </form>
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight break-words px-4">
                {transcript || (state === AppState.LISTENING ? "..." : "")}
              </p>
            )}
          </div>

          {/* Controls */}
          {state === AppState.LISTENING && (
            <div className="mt-12 flex flex-col gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={stopListening}
                className="px-8 py-4 bg-gray-200 dark:bg-gray-800 rounded-full font-semibold"
              >
                Detener
              </motion.button>
              <button onClick={() => setState(AppState.TYPING)} className="text-sm text-gray-500 flex items-center gap-2 justify-center">
                <Keyboard size={16} /> Usar teclado
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Floating Action Bubble (Bottom) */}
      {state === AppState.IDLE && (
        <div className="fixed bottom-6 left-0 right-0 z-40 pointer-events-none flex justify-center items-end pb-2">

          {/* Visual Hint Track (Optional, fading in when dragging starts) */}
          <motion.div
            style={{ opacity: x.get() > 5 ? 1 : 0 }} // Simple visibility toggle or use transform if preferred
            className="absolute bottom-4 left-1/2 ml-8 flex items-center gap-2 text-gray-400 dark:text-gray-500 transition-opacity"
          >
            <Keyboard size={16} />
            <span className="text-xs font-medium">Desliza</span>
          </motion.div>

          <motion.div
            id="voice-input-btn"
            drag
            dragDirectionLock
            dragConstraints={{ left: 0, right: 100, top: -200, bottom: 0 }}
            dragElastic={0.1}
            dragSnapToOrigin
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1.5 }}
            style={{ x, scale: bgScale }}
            onTap={() => {
              if (state === AppState.IDLE) startListening();
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) {
                // Swipe Right -> Keyboard
                setState(AppState.TYPING);
                setInputText('');
              } else if (Math.abs(info.offset.y) > 20 || Math.abs(info.offset.x) > 20) {
                // Significant drag (up or small side) -> Start Listening
                if (state === AppState.IDLE) startListening();
              }
              // If it was a tap (little movement), onTap handles it.
            }}
            // onClick removed as onDragEnd handles both tap and drag-release now
            className="pointer-events-auto cursor-grab active:cursor-grabbing w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center z-50 touch-none"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <motion.div style={{ opacity: micOpacity, position: 'absolute' }}>
                <Mic size={28} />
              </motion.div>
              <motion.div style={{ opacity: keyboardOpacity, position: 'absolute' }}>
                <Keyboard size={28} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VoiceInput;