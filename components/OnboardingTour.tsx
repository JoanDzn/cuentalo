import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, User, Sparkles, DollarSign, Calendar, Zap, List, Moon, Mic } from 'lucide-react';

interface OnboardingTourProps {
    isActive: boolean;
    onComplete: () => void;
    userName?: string;
}

const STEPS = [
    {
        target: 'welcome-modal', // Special ID for the starting modal
        title: '¡Bienvenido a Cuentalo!',
        content: (name: string) => `Hola ${name}, descubre la forma más rápida de llevar tus finanzas. Vamos a hacer un recorrido.`,
        position: 'center',
        icon: <Sparkles size={32} />,
        color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
        target: 'balance-card',
        title: 'Tu Balance',
        content: () => 'Aquí ves tu dinero disponible del mes. Se actualiza con cada ingreso o gasto.',
        position: 'bottom',
        icon: <DollarSign size={32} />,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
        target: 'history-tab',
        title: 'Historial',
        content: () => 'Consulta tus movimientos de meses anteriores aquí.',
        position: 'bottom',
        icon: <Calendar size={32} />,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    },
    {
        target: 'recurring-carousel',
        title: 'Accesos Rápidos',
        content: () => 'Gestiona tus gastos fijos (Netflix, Alquiler) y tus metas de ahorro desde aquí.',
        position: 'top',
        icon: <Zap size={32} />,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
    },
    {
        target: 'recent-transactions-section',
        title: 'Tus Movimientos',
        content: () => 'Aquí aparecerá la lista de todo lo que has gastado o ingresado recientemente.',
        position: 'top',
        icon: <List size={32} />,
        color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
    },
    {
        target: 'profile-btn',
        title: 'Tu Perfil',
        content: () => 'Accede a tu cuenta, cambia entre modo claro/oscuro y gestiona tus preferencias.',
        position: 'bottom',
        icon: <User size={32} />,
        color: 'text-gray-500 bg-gray-100 dark:bg-gray-800'
    },
    {
        target: 'voice-input-btn',
        title: 'Habla o Escribe',
        content: () => 'Presiona para hablar o desliza el botón hacia la derecha para escribir tus gastos manualmente.',
        position: 'top',
        icon: <Mic size={32} />,
        color: 'text-red-500 bg-red-50 dark:bg-red-900/20'
    }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isActive, onComplete, userName = 'amigo' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const updateRect = () => {
            const step = STEPS[currentStep];
            if (step.target === 'welcome-modal') {
                setTargetRect(null); // No specific target rect needed for center modal
                return;
            }

            const el = document.getElementById(step.target);
            if (el) {
                const rect = el.getBoundingClientRect();
                // Add some padding
                const padding = 10;
                setTargetRect({
                    ...rect,
                    x: rect.x - padding,
                    y: rect.y - padding,
                    width: rect.width + (padding * 2),
                    height: rect.height + (padding * 2),
                    top: rect.top - padding,
                    right: rect.right + padding,
                    bottom: rect.bottom + padding,
                    left: rect.left - padding,
                } as DOMRect);
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        // Slight delay to allow DOM to settle
        const timer = setTimeout(updateRect, 300);

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
            clearTimeout(timer);
        };
    }, [isActive, currentStep]);

    if (!isActive) return null;

    const step = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">

            {/* SVG Mask for properties that have a target */}
            {targetRect && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-in-out">
                    <defs>
                        <mask id="overlay-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <rect
                                x={targetRect.x}
                                y={targetRect.y}
                                width={targetRect.width}
                                height={targetRect.height}
                                rx="20" // Rounded corners for the hole
                                fill="black"
                            />
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0,0,0,0.7)"
                        mask="url(#overlay-mask)"
                    />

                    {/* Animated Ring around target */}
                    <rect
                        x={targetRect.x - 2}
                        y={targetRect.y - 2}
                        width={targetRect.width + 4}
                        height={targetRect.height + 4}
                        rx="22"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="10 5"
                        className="animate-pulse opacity-50"
                    />
                </svg>
            )}

            {/* Backdrop for modal-only steps or if we need a full cover */}
            {!targetRect && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        {/* Centered Modal (No Target) */}
                        {!targetRect && (
                            <motion.div
                                key="center-modal"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-[#333] relative overflow-hidden"
                            >
                                <TourContent
                                    step={step}
                                    currentStep={currentStep}
                                    totalSteps={STEPS.length}
                                    onNext={handleNext}
                                    onSkip={handleSkip}
                                    userName={userName}
                                    isLastStep={isLastStep}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}


            {/* Floating Tooltip for Targeted Steps */}
            <AnimatePresence mode="wait">
                {targetRect && (
                    <motion.div
                        key="floating-tooltip"
                        initial={{ opacity: 0, y: 10, x: window.innerWidth < 768 ? 0 : "-50%" }}
                        animate={{ opacity: 1, y: 0, x: window.innerWidth < 768 ? 0 : "-50%" }}
                        exit={{ opacity: 0, y: -10, x: window.innerWidth < 768 ? 0 : "-50%" }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            ...(window.innerWidth < 768 ? {
                                // Mobile: Always center horizontally, position based on top/bottom availability
                                left: '5%',
                                right: '5%',
                                width: '90%',
                                top: step.position === 'bottom' ? targetRect.bottom + 20 : 'auto',
                                bottom: step.position === 'top' ? (window.innerHeight - targetRect.top) + 20 : 'auto',
                            } : {
                                // Desktop: Use precise coordinates
                                top: step.position === 'bottom' ? targetRect.bottom + 20 : Math.max(20, targetRect.top - 200),
                                left: targetRect.left + (targetRect.width / 2),
                                // Transform is handled by motion x prop
                                width: '380px'
                            })
                        }}
                        className="pointer-events-auto bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-[#333] relative overflow-hidden"
                    >
                        <TourContent
                            step={step}
                            currentStep={currentStep}
                            totalSteps={STEPS.length}
                            onNext={handleNext}
                            onSkip={handleSkip}
                            userName={userName}
                            isLastStep={isLastStep}
                        />

                        {/* Desktop Arrow (Hidden on mobile for simplicity) */}
                        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1E1E1E] rotate-45 border-l border-t border-gray-100 dark:border-[#333] -top-2" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Extracted Content Component for reuse
const TourContent = ({ step, currentStep, totalSteps, onNext, onSkip, userName, isLastStep }: any) => {
    // Alternating corners: Even steps (0, 2...) -> Top Left. Odd steps (1, 3...) -> Top Right.
    const isLeft = currentStep % 2 === 0;

    return (
        <>
            {/* Background Decor */}
            <div className={`absolute -top-10 ${isLeft ? '-left-10' : '-right-10'} w-32 h-32 rounded-full ${step.color.split(' ')[1]} opacity-20 blur-2xl`} />

            {/* Icon Absolutely Positioned */}
            <div className={`absolute top-0 ${isLeft ? 'left-0 rounded-br-2xl' : 'right-0 rounded-bl-2xl'} w-16 h-16 ${step.color} flex items-center justify-center`}>
                {step.icon}
            </div>

            <div className="text-center mt-3">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    {typeof step.content === 'function' ? step.content(userName) : step.content}
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {/* Progress Bars Centered */}
                <div className="flex justify-center gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                </div>

                {/* Buttons Row */}
                <div className="flex items-center justify-between mt-1">
                    <button
                        onClick={onSkip}
                        className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2 py-2"
                    >
                        Saltar
                    </button>
                    <button
                        onClick={onNext}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        {isLastStep ? '¡Empezar!' : 'Siguiente'}
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </>
    );
};
