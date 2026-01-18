import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Loader2, Check, X, Sparkles, StopCircle, Keyboard, Send } from 'lucide-react';
import { parseExpenseVoiceCommand } from '../services/geminiService';
import { AppState, ExpenseAnalysis } from '../types';

interface VoiceInputProps {
  onExpenseAdded: (expense: ExpenseAnalysis) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onExpenseAdded }) => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');

  const recognitionRef = useRef<any>(null);
  const processingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onExpenseAddedRef = useRef(onExpenseAdded);

  // Keep callback ref fresh to avoid stale closures if parent updates prop
  useEffect(() => {
    onExpenseAddedRef.current = onExpenseAdded;
  }, [onExpenseAdded]);

  const processTranscript = useCallback(async (text: string) => {
    if (!text || !text.trim() || processingRef.current) return;

    processingRef.current = true;
    setState(AppState.PROCESSING);

    try {
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
      }, 2000);
    } catch (e) {
      console.error(e);
      setState(AppState.ERROR);
      setTimeout(() => {
        setState(AppState.IDLE);
        processingRef.current = false;
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        processingRef.current = false;
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interimTranscript += event.results[i][0].transcript;
        }
        setTranscript(interimTranscript);

        if (event.results[0].isFinal) {
          processTranscript(event.results[0][0].transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error", event);
        if (event.error !== 'no-speech') {
          setState(AppState.ERROR);
          setTimeout(() => setState(AppState.IDLE), 2000);
        }
      };

      recognitionRef.current.onend = () => {
        // Increased pause tolerance: only stop if we are not processing and been in LISTENING state
        setTimeout(() => {
          if (!processingRef.current && state === AppState.LISTENING) {
            setState(AppState.IDLE);
          }
        }, 1500); // Wait longer before resetting idle state
      };
    }
  }, [processTranscript, state]);

  // Focus input when moving to TYPING state
  useEffect(() => {
    if (state === AppState.TYPING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setState(AppState.LISTENING);
      processingRef.current = false;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start error:", e);
      }
    } else {
      // Demo fallback
      const demoText = "Gasté 200 pesos en gasolina";
      setTranscript(demoText);
      processTranscript(demoText);
    }
  };

  const startTyping = () => {
    setState(AppState.TYPING);
    setInputText('');
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (transcript.trim()) {
      processTranscript(transcript);
    } else {
      cancelAction();
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      processTranscript(inputText);
    }
  };

  const cancelAction = () => {
    if (recognitionRef.current) recognitionRef.current.abort();
    setState(AppState.IDLE);
    setTranscript('');
    setInputText('');
    processingRef.current = false;
  };

  // Render Full Screen Overlay when active
  if (state !== AppState.IDLE) {
    return (
      <div
        key="voice-overlay"
        className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in"
      >

        {/* Close Button (Top Right) */}
        <button
          onClick={cancelAction}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Dynamic Status Icon/Animation */}
        <div className="relative mb-8">
          {state === AppState.LISTENING && (
            <>
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-[-12px] bg-red-500 rounded-full animate-pulse opacity-10"></div>
              <div className="w-24 h-24 bg-gradient-to-tr from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30">
                <Mic size={40} className="text-white animate-pulse" />
              </div>
            </>
          )}
          {state === AppState.TYPING && (
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Keyboard size={40} className="text-white" />
            </div>
          )}
          {state === AppState.PROCESSING && (
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/30 animate-bounce">
              <Sparkles size={40} className="text-white" />
            </div>
          )}
          {state === AppState.SUCCESS && (
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 scale-110 transition-transform">
              <Check size={48} className="text-white" />
            </div>
          )}
          {state === AppState.ERROR && (
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
              <X size={48} className="text-white" />
            </div>
          )}
        </div>

        {/* Text Status */}
        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-widest text-center">
          {state === AppState.LISTENING && "Escuchando..."}
          {state === AppState.TYPING && "Escribe tu comando..."}
          {state === AppState.PROCESSING && "Procesando..."}
          {state === AppState.SUCCESS && "¡Guardado!"}
          {state === AppState.ERROR && "Error al procesar"}
        </h2>

        {/* Interaction Area */}
        <div className="w-full max-w-md text-center min-h-[100px] flex flex-col items-center">
          {state === AppState.TYPING ? (
            <form onSubmit={handleTextSubmit} className="w-full relative group">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ej: Gasté 2500bs en una hamburguesa..."
                className="w-full bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-800 focus:border-indigo-500 dark:focus:border-indigo-400 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight py-4 px-2 outline-none transition-all text-center"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="mt-8 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold shadow-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 mx-auto"
              >
                <Send size={20} />
                Enviar
              </button>
            </form>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {transcript || (state === AppState.LISTENING ? "..." : "")}
            </p>
          )}
        </div>

        {/* Action Button for Listening State */}
        {state === AppState.LISTENING && (
          <button
            onClick={stopListening}
            className="mt-12 flex items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white font-semibold hover:scale-105 transition-transform"
          >
            <StopCircle size={20} />
            Detener
          </button>
        )}

        {/* Toggle between Voice and Text */}
        {(state === AppState.LISTENING || state === AppState.TYPING) && (
          <button
            onClick={state === AppState.LISTENING ? startTyping : startListening}
            className="mt-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-medium text-sm flex items-center gap-2"
          >
            {state === AppState.LISTENING ? (
              <><Keyboard size={16} /> Cambiar a teclado</>
            ) : (
              <><Mic size={16} /> Cambiar a voz</>
            )}
          </button>
        )}
      </div>
    );
  }

  // Idle Button (Bottom Center)
  return (
    <div key="mic-idle" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
      {/* Mic Button Only */}
      <button
        onClick={startListening}
        className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      >
        <Mic size={28} className="group-hover:animate-wiggle" />
        <div className="absolute inset-0 rounded-full border border-white/10 dark:border-black/10 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500"></div>
      </button>
    </div>
  );
};

export default VoiceInput;