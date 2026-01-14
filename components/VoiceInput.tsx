import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Loader2, Check, X, Sparkles, StopCircle } from 'lucide-react';
import { parseExpenseVoiceCommand } from '../services/geminiService';
import { AppState, ExpenseAnalysis } from '../types';

interface VoiceInputProps {
  onExpenseAdded: (expense: ExpenseAnalysis) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onExpenseAdded }) => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const processingRef = useRef(false);
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
          // If audio ends and we haven't processed anything (and not in processing state), reset.
          // We use a timeout to let any final processing triggers settle.
          setTimeout(() => {
              if (!processingRef.current) {
                  setState(AppState.IDLE);
              }
          }, 200);
      };
    } else {
      console.warn("Web Speech API not supported");
    }
  }, [processTranscript]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setState(AppState.LISTENING);
      processingRef.current = false;
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Start error:", e);
      }
    } else {
      // Demo fallback
      const demoText = "Gasté 200 pesos en gasolina";
      setTranscript(demoText);
      processTranscript(demoText);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    // Force process current transcript if available
    // We don't wait for 'onresult' isFinal because it might be skipped on manual stop
    if (transcript.trim()) {
        processTranscript(transcript);
    } else {
        cancelListening();
    }
  };

  const cancelListening = () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      setState(AppState.IDLE);
      setTranscript('');
      processingRef.current = false;
  };

  // Render Full Screen Overlay when active
  if (state !== AppState.IDLE) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 transition-all duration-300 animate-fade-in">
        
        {/* Close Button (Top Right) */}
        <button 
            onClick={cancelListening}
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
            {state === AppState.PROCESSING && "Procesando..."}
            {state === AppState.SUCCESS && "¡Guardado!"}
            {state === AppState.ERROR && "Error al procesar"}
        </h2>

        {/* Live Transcript Display */}
        <div className="max-w-md text-center min-h-[100px]">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {transcript || (state === AppState.LISTENING ? "..." : "")}
            </p>
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
      </div>
    );
  }

  // Idle Button (Bottom Center)
  return (
    <button
      onClick={startListening}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
    >
      <Mic size={28} className="group-hover:animate-wiggle" />
      <div className="absolute inset-0 rounded-full border border-white/10 dark:border-black/10 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500"></div>
    </button>
  );
};

export default VoiceInput;