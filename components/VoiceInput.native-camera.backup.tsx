// BACKUP: VoiceInput con cámara nativa iOS (panel de confirmación + input[type=file capture=environment])
// Para restaurar: copiar este contenido a VoiceInput.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Loader2, Check, X, Keyboard, Camera, Sparkles, FileText, Edit2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { parseExpenseVoiceCommand, analyzeReceiptImage } from '../services/geminiService';
import { AppState, ExpenseAnalysis } from '../types';

interface VoiceInputProps {
    onExpenseAdded: (expense: ExpenseAnalysis) => void;
    onMissionsClick?: () => void;
    onRequestEdit?: (expense: ExpenseAnalysis) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onExpenseAdded, onRequestEdit }) => {
    const [state, setState] = useState<AppState | 'VALIDATING'>('IDLE' as any);
    const [transcript, setTranscript] = useState('');
    const [inputText, setInputText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [analyzedData, setAnalyzedData] = useState<ExpenseAnalysis | null>(null);
    const [showCameraConfirm, setShowCameraConfirm] = useState(false);

    const isDragging = useRef(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // X-axis icon opacity (left=camera, right=keyboard)
    const leftOpacity = useTransform(x, [-70, -20], [1, 0]);
    const rightOpacity = useTransform(x, [20, 70], [0, 1]);
    // Y-axis: dragging up shows mic
    const upOpacity = useTransform(y, [-70, -20], [1, 0]);
    // Center mic visible only when not dragging much
    const centerOpacity = useTransform(x, [-25, 0, 25], [0, 1, 0]);
    // Scale up slightly when dragging up
    const btnScale = useTransform(y, [-80, 0], [1.25, 1]);
    // Red glow when dragging up
    const bgColor = useTransform(y, [-80, -30, 0], ['#ef4444', '#f97316', '#000000']);
    // Hint opacities — appear when dragging in their direction
    const upHintOpacity = useTransform(y, [-10, -50], [0, 1]);
    const leftHintOpacity = useTransform(x, [-10, -60], [0, 1]);
    const rightHintOpacity = useTransform(x, [10, 60], [0, 1]);

    const recognitionRef = useRef<any>(null);
    const processingRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initializeRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return null;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';
        recognition.onstart = () => { processingRef.current = false; setTranscript(''); setErrorMessage(''); };
        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) interim += event.results[i][0].transcript;
            setTranscript(interim);
            if (event.results[event.results.length - 1].isFinal) processValues(event.results[event.results.length - 1][0].transcript, 'voice');
        };
        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'aborted') return;
            setErrorMessage("No te entendí bien");
            setState('ERROR' as any);
            setTimeout(() => resetState(), 2000);
        };
        recognition.onend = () => {
            setTimeout(() => { if (!processingRef.current && state === 'LISTENING') setState('IDLE' as any); }, 500);
        };
        return recognition;
    };

    const startListening = () => {
        if (processingRef.current) return;
        const recognition = initializeRecognition();
        if (recognition) {
            recognitionRef.current = recognition;
            setState('LISTENING' as any);
            try { recognition.start(); } catch (e) { setState('ERROR' as any); }
        } else {
            alert("Navegador no soporta voz");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.abort();
        }
        resetState();
    };

    const processValues = async (text: string, source: 'voice' | 'text') => {
        processingRef.current = true;
        setState('PROCESSING' as any);
        try {
            const result = await parseExpenseVoiceCommand(text);
            onExpenseAdded(result);
            setState('SUCCESS' as any);
            setTimeout(() => resetState(), 1500);
        } catch (e: any) {
            setErrorMessage(e.message);
            setState('ERROR' as any);
            setTimeout(() => resetState(), 6000);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setState('PROCESSING' as any);

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64 = reader.result as string;
                const result = await analyzeReceiptImage(base64);
                onExpenseAdded(result);
                setState('SUCCESS' as any);
                setTimeout(resetState, 1500);
            } catch (e: any) {
                setErrorMessage(e.message || "No pude leer el recibo");
                setState('ERROR' as any);
                setTimeout(() => resetState(), 6000);
            }
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const resetState = () => {
        setState('IDLE' as any);
        setTranscript('');
        setInputText('');
        setErrorMessage('');
        setAnalyzedData(null);
        processingRef.current = false;
    };

    return (
        <>
            <AnimatePresence>
                {state !== 'IDLE' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 pointer-events-auto select-none"
                    >
                        <button onClick={resetState} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <X size={24} />
                        </button>

                        {state === 'VALIDATING' && analyzedData ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
                                    <Sparkles className="absolute top-2 right-2 text-white/20" size={48} />
                                    <h3 className="font-bold text-lg opacity-90 uppercase tracking-widest">Confirmar</h3>
                                    <div className="text-4xl font-bold mt-2">
                                        {analyzedData.currency === 'VES' ? 'Bs' : '$'} {analyzedData.amount}
                                    </div>
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${analyzedData.type === 'income' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/20 text-white'}`}>
                                        {analyzedData.type === 'income' ? 'INGRESO' : 'GASTO'}
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                            <FileText size={24} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Concepto</p>
                                            <p className="font-medium text-gray-900 dark:text-white text-lg leading-tight">
                                                {analyzedData.description || "Sin descripción"}
                                            </p>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                                                {analyzedData.category}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <button
                                            onClick={() => {
                                                if (onRequestEdit) onRequestEdit(analyzedData);
                                                resetState();
                                            }}
                                            className="py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            <Edit2 size={18} /> Editar
                                        </button>
                                        <button
                                            onClick={() => {
                                                onExpenseAdded(analyzedData);
                                                setState('SUCCESS' as any);
                                                setTimeout(resetState, 1500);
                                            }}
                                            className="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition"
                                        >
                                            <Check size={18} /> Guardar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="relative mb-8 h-32 w-32 flex items-center justify-center">
                                    {state === 'LISTENING' && (
                                        <div className="relative">
                                            <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                                            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl text-white">
                                                <Mic size={40} />
                                            </div>
                                        </div>
                                    )}
                                    {state === 'PROCESSING' && (
                                        <div className="relative">
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full" />
                                            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-xl z-10">
                                                <Sparkles className="text-blue-500 animate-pulse" size={40} />
                                            </div>
                                        </div>
                                    )}
                                    {state === 'SUCCESS' && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl text-white">
                                            <Check size={48} />
                                        </motion.div>
                                    )}
                                    {state === 'ERROR' && (
                                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-xl text-white">
                                            <X size={48} />
                                        </div>
                                    )}
                                    {(state === 'TYPING' as any) && (
                                        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl text-white">
                                            <Keyboard size={40} />
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200 mb-2">
                                    {state === 'LISTENING' ? "Te escucho..." :
                                        state === 'PROCESSING' ? "Analizando..." :
                                            state === 'SUCCESS' ? "¡Listo!" :
                                                state === 'ERROR' ? "Error" : "Escribe"}
                                </h2>

                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs h-6">
                                    {errorMessage || transcript || "..."}
                                </p>

                                {(state === 'TYPING' as any) && (
                                    <form onSubmit={(e) => { e.preventDefault(); if (inputText.trim()) processValues(inputText, 'text'); }} className="mt-8 w-full max-w-xs">
                                        <input autoFocus type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Ej: Pizza $15" className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 text-2xl font-bold text-center py-2 focus:border-indigo-500 outline-none dark:text-white" />
                                        <button type="submit" className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Guardar</button>
                                    </form>
                                )}

                                {state === 'LISTENING' && (
                                    <div className="mt-8 flex gap-4">
                                        <button onClick={stopListening} className="px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-full font-bold text-sm">Pausar</button>
                                        <button
                                            onClick={() => {
                                                if (recognitionRef.current) {
                                                    recognitionRef.current.onend = null;
                                                    recognitionRef.current.abort();
                                                }
                                                setState('TYPING' as any);
                                            }}
                                            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-full font-bold text-sm"
                                        >
                                            Teclado
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Confirmation Panel */}
            <AnimatePresence>
                {showCameraConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl flex flex-col items-center justify-end pb-28 p-6 pointer-events-auto"
                        onClick={() => setShowCameraConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                            className="flex flex-col items-center gap-4 text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Escanear recibo</h2>
                                <p className="text-gray-300 text-sm">La IA extraerá los datos automáticamente.</p>
                            </div>

                            <label
                                htmlFor="camera-confirm-input"
                                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform touch-manipulation"
                            >
                                <Camera size={32} />
                            </label>
                            <input
                                id="camera-confirm-input"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="sr-only"
                                onChange={(e) => {
                                    setShowCameraConfirm(false);
                                    handleImageUpload(e);
                                }}
                            />

                            <button
                                onClick={() => setShowCameraConfirm(false)}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {state === 'IDLE' && (
                <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center items-end pointer-events-none pb-2">
                    <div className="relative flex flex-col items-center pointer-events-auto">
                        <motion.div
                            drag
                            dragConstraints={{ left: -100, right: 100, top: -150, bottom: 50 }}
                            dragElastic={0.15}
                            dragMomentum={false}
                            dragSnapToOrigin
                            style={{ x, y, scale: btnScale }}
                            onDragStart={() => isDragging.current = true}
                            onDragEnd={(_, info) => {
                                const ox = info.offset.x;
                                const oy = info.offset.y;
                                if (oy < -40) startListening();
                                else if (ox > 40) setState('TYPING' as any);
                                else if (ox < -40) setShowCameraConfirm(true);
                                setTimeout(() => { isDragging.current = false; }, 100);
                            }}
                            onClick={() => {
                                if (!isDragging.current) startListening();
                            }}
                            id="voice-input-btn"
                            className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-50"
                        >
                            <div className="relative w-full h-full flex items-center justify-center">
                                <motion.div style={{ opacity: centerOpacity, position: 'absolute' }}><Mic size={28} /></motion.div>
                                <motion.div style={{ opacity: rightOpacity, position: 'absolute' }}><Keyboard size={28} /></motion.div>
                                <motion.div style={{ opacity: leftOpacity, position: 'absolute' }}><Camera size={28} /></motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceInput;
