import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ChevronRight, Delete, TrendingDown, TrendingUp } from 'lucide-react';
import { useExchangeRates } from '../services/exchangeRateService';

interface CurrencyConverterModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Optional: called when user taps "Registrar" with a pre-filled transaction */
    onAddTransaction?: (data: { amount: number; type: 'expense' | 'income'; description: string; currency: 'USD' | 'VES' | 'EUR' }) => void;
}

type RateType = 'bcv' | 'euro' | 'usdt';
type ActiveField = 'top' | 'bottom';

const RATE_CONFIG: Record<RateType, { topSymbol: string; topLabel: string; currency: 'USD' | 'VES' | 'EUR' }> = {
    bcv: { topSymbol: '$', topLabel: 'Dólar BCV', currency: 'USD' },
    euro: { topSymbol: '€', topLabel: 'Euro', currency: 'EUR' },
    usdt: { topSymbol: '$', topLabel: 'USDT', currency: 'USD' },
};

const RATE_ORDER: RateType[] = ['bcv', 'euro', 'usdt'];

const ACCENT: Record<RateType, {
    btn: string; btnText: string; btnShadow: string;
    border: string; symbol: string;
    delBg: string; delText: string;
    copyBg: string; copyText: string;
    menuActive: string; menuActiveBg: string;
    pill: string; registerBg: string; registerText: string;
}> = {
    bcv: {
        btn: 'bg-transparent border border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        btnText: 'text-indigo-600 dark:text-indigo-400',
        btnShadow: 'none',
        border: 'border-indigo-400/50',
        symbol: 'text-indigo-500',
        delBg: 'bg-transparent border border-indigo-500 dark:border-indigo-400',
        delText: 'text-indigo-600 dark:text-indigo-400',
        copyBg: 'bg-white dark:bg-[#1E1E1E]',
        copyText: 'text-indigo-500 dark:text-indigo-400',
        menuActive: 'text-indigo-600 dark:text-indigo-400',
        menuActiveBg: 'bg-indigo-50 dark:bg-indigo-900/30',
        pill: 'text-indigo-500 dark:text-indigo-400',
        registerBg: 'bg-transparent border border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        registerText: 'text-indigo-600 dark:text-indigo-400',
    },
    euro: {
        btn: 'bg-transparent border border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
        btnText: 'text-yellow-600 dark:text-yellow-400',
        btnShadow: 'none',
        border: 'border-yellow-400/50',
        symbol: 'text-yellow-500',
        delBg: 'bg-transparent border border-yellow-500 dark:border-yellow-400',
        delText: 'text-yellow-600 dark:text-yellow-400',
        copyBg: 'bg-white dark:bg-[#1E1E1E]',
        copyText: 'text-yellow-500 dark:text-yellow-400',
        menuActive: 'text-yellow-600 dark:text-yellow-400',
        menuActiveBg: 'bg-yellow-50 dark:bg-yellow-900/30',
        pill: 'text-yellow-500 dark:text-yellow-400',
        registerBg: 'bg-transparent border border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
        registerText: 'text-yellow-600 dark:text-yellow-400',
    },
    usdt: {
        btn: 'bg-transparent border border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        btnText: 'text-emerald-600 dark:text-emerald-400',
        btnShadow: 'none',
        border: 'border-emerald-400/50',
        symbol: 'text-emerald-500',
        delBg: 'bg-transparent border border-emerald-500 dark:border-emerald-400',
        delText: 'text-emerald-600 dark:text-emerald-400',
        copyBg: 'bg-white dark:bg-[#1E1E1E]',
        copyText: 'text-emerald-500 dark:text-emerald-400',
        menuActive: 'text-emerald-600 dark:text-emerald-400',
        menuActiveBg: 'bg-emerald-50 dark:bg-emerald-900/30',
        pill: 'text-emerald-500 dark:text-emerald-400',
        registerBg: 'bg-transparent border border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
        registerText: 'text-emerald-600 dark:text-emerald-400',
    },
};

const RATE_OPTIONS: { id: RateType; label: string }[] = [
    { id: 'bcv', label: 'Dólar BCV' },
    { id: 'euro', label: 'Euro' },
    { id: 'usdt', label: 'USDT' },
];

const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ isOpen, onClose, onAddTransaction }) => {
    const { rates, loading } = useExchangeRates();

    const [selectedRate, setSelectedRate] = useState<RateType>('bcv');
    const [showRateMenu, setShowRateMenu] = useState(false);

    const [topValue, setTopValue] = useState('1');
    const [bottomValue, setBottomValue] = useState('');
    const [activeField, setActiveField] = useState<ActiveField>('top');
    const [isFirstInput, setIsFirstInput] = useState(true);

    const [copiedTop, setCopiedTop] = useState(false);
    const [copiedBottom, setCopiedBottom] = useState(false);
    const [showRegisterOptions, setShowRegisterOptions] = useState(false);

    const deleteTimer = useRef<NodeJS.Timeout | null>(null);
    const rateMenuRef = useRef<HTMLDivElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);
    // Swipe state for rate pill
    const swipeStartX = useRef<number | null>(null);
    const swipeMoved = useRef(false);

    const config = RATE_CONFIG[selectedRate];
    const accent = ACCENT[selectedRate];
    const rateValue = rates ? rates[selectedRate] : null;

    // Recalculate on change
    useEffect(() => {
        if (!rates) return;
        const rate = rates[selectedRate];
        if (!rate) return;

        if (activeField === 'top') {
            const num = parseFloat(topValue.replace(',', '.')) || 0;
            setBottomValue(formatNumber(num * rate));
        } else {
            const num = parseFloat(bottomValue.replace(',', '.')) || 0;
            setTopValue(formatNumber(num / rate));
        }
    }, [topValue, bottomValue, selectedRate, rates, activeField]);

    // Close dropdown when clicking outside (excluding the pill itself to avoid toggle conflict)
    useEffect(() => {
        if (!showRateMenu) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const insideMenu = rateMenuRef.current?.contains(target);
            const insidePill = pillRef.current?.contains(target);
            if (!insideMenu && !insidePill) setShowRateMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showRateMenu]);

    const cycleRate = (dir: 1 | -1) => {
        setSelectedRate(prev => {
            const idx = RATE_ORDER.indexOf(prev);
            const next = (idx + dir + RATE_ORDER.length) % RATE_ORDER.length;
            return RATE_ORDER[next];
        });
        setActiveField('top');
    };

    // Robust swipe handler utilizing Pointer Capture to avoid conflicts
    const onSwipeStart = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        swipeStartX.current = e.clientY;
        swipeMoved.current = false;
    };
    const onSwipeMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (swipeStartX.current === null) return;
        const diff = e.clientY - swipeStartX.current;
        // Threshold of 28px for a swipe
        if (Math.abs(diff) > 28) {
            swipeMoved.current = true;
            cycleRate(diff < 0 ? 1 : -1);
            swipeStartX.current = null; // consume
        }
    };
    const onSwipeEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
        swipeStartX.current = null;
        // Keep flag briefly true to prevent immediate click
        setTimeout(() => { swipeMoved.current = false; }, 100);
    };
    function formatNumber(n: number): string {
        if (isNaN(n) || !isFinite(n)) return '0';
        return parseFloat(n.toFixed(2)).toString().replace('.', ',');
    }

    function formatDisplay(val: string): string {
        if (!val || val === '0') return '0,00';
        const num = parseFloat(val.replace(',', '.'));
        if (isNaN(num)) return '0,00';
        return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    }

    const handleKey = useCallback((key: string) => {
        const setter = activeField === 'top' ? setTopValue : setBottomValue;

        setter(prev => {
            let nextVal = prev;
            if (key === 'DEL') {
                const n = prev.slice(0, -1);
                nextVal = n === '' ? '0' : n;
            } else if (key === 'CLEAR') {
                nextVal = '0';
            } else if ((isFirstInput || prev === '0') && key !== ',') {
                nextVal = key;
            } else {
                if (key === ',' && prev.includes(',')) return prev;
                if (prev.replace(',', '').replace(/\D/g, '').length >= 12) return prev;
                nextVal = prev + key;
            }
            return nextVal;
        });

        if (isFirstInput) {
            setIsFirstInput(false);
        }
    }, [activeField, isFirstInput]);

    const startDelete = () => {
        handleKey('DEL');
        deleteTimer.current = setTimeout(() => handleKey('CLEAR'), 600);
    };
    const stopDelete = () => {
        if (deleteTimer.current) { clearTimeout(deleteTimer.current); deleteTimer.current = null; }
    };

    const copyTop = () => {
        navigator.clipboard.writeText(formatDisplay(topValue));
        setCopiedTop(true);
        setTimeout(() => setCopiedTop(false), 2000);
    };
    const copyBottom = () => {
        navigator.clipboard.writeText(formatDisplay(bottomValue));
        setCopiedBottom(true);
        setTimeout(() => setCopiedBottom(false), 2000);
    };

    // Amount in top currency (USD/EUR) for registration
    const getAmountForRegister = (): number => {
        const num = parseFloat(topValue.replace(',', '.')) || 0;
        return num;
    };

    const handleRegister = (type: 'expense' | 'income') => {
        const amount = getAmountForRegister();
        if (!amount || amount <= 0) return;
        onAddTransaction?.({
            amount,
            type,
            description: `Conversión ${config.topLabel}`,
            currency: config.currency,
        });
        setShowRegisterOptions(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center"
                onClick={() => { setShowRegisterOptions(false); onClose(); }}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={0.05}
                    dragSnapToOrigin
                    onDragEnd={(_, info) => {
                        if (info.offset.y > 100 || info.velocity.y > 500) onClose();
                    }}
                    className="w-full sm:max-w-sm bg-white dark:bg-[#1E1E1E] rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col pointer-events-auto"
                    onClick={e => e.stopPropagation()}
                    style={{ touchAction: 'none' }}
                >
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-1 touch-none shrink-0">
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-5 pb-3 pt-1 flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-bold dark:text-white">Calculadora</h2>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-100 dark:bg-[#2C2C2C] rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* ── Top section ── */}
                    <div className="flex flex-col px-5 gap-3 flex-1">

                        {/* Rate Selector – outer is w-full so percentages are reliable */}
                        <div className="relative w-full">

                            {/* Pill: w-1/2 mx-auto centers it perfectly as a block element */}
                            <div ref={pillRef} className="w-1/2 mx-auto">
                                <motion.button
                                    layout
                                    key={selectedRate}
                                    style={{ boxShadow: accent.btnShadow, transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }}
                                    className={`w-full flex items-center justify-center ${accent.btn} ${accent.btnText} font-bold text-sm py-3 rounded-2xl select-none`}
                                    onClick={(e) => {
                                        if (!swipeMoved.current) setShowRateMenu(v => !v);
                                    }}
                                    onPointerDown={onSwipeStart}
                                    onPointerMove={onSwipeMove}
                                    onPointerUp={onSwipeEnd}
                                    onPointerCancel={onSwipeEnd}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={selectedRate}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18 }}
                                            className="pointer-events-none"
                                        >
                                            {config.topLabel}
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.button>
                            </div>

                            {/* Dots: pill goes from 25% to 75%, so dots at left-[75%] + small gap */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-[75%] ml-2 flex flex-col gap-1 items-center">
                                {RATE_ORDER.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => { setSelectedRate(r); setActiveField('top'); setShowRateMenu(false); }}
                                        className={`w-1.5 rounded-full transition-all duration-300 ${selectedRate === r
                                            ? 'h-4 bg-gray-900 dark:bg-white'
                                            : 'h-1.5 bg-gray-300 dark:bg-gray-600 opacity-60'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Dropdown: left-1/2 on a w-full container = exact center of modal content */}
                            <AnimatePresence>
                                {showRateMenu && (
                                    <motion.div
                                        ref={rateMenuRef}
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full mt-2 left-[25%] right-[25%] bg-white dark:bg-[#2C2C2C] border border-gray-100 dark:border-[#444] rounded-2xl overflow-hidden z-50 shadow-xl"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {RATE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setSelectedRate(opt.id); setActiveField('top'); setShowRateMenu(false); }}
                                                className={`w-full text-center px-3 py-2.5 text-sm font-semibold transition-colors ${selectedRate === opt.id
                                                    ? `${ACCENT[opt.id].menuActive} ${ACCENT[opt.id].menuActiveBg}`
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3a3a3a]'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Exchange Fields */}
                        <div className="rounded-2xl bg-gray-50 dark:bg-[#2a2a2a] overflow-hidden">
                            {/* Top Field */}
                            <button
                                onClick={() => { setActiveField('top'); setIsFirstInput(true); }}
                                className="w-full flex items-center px-4 py-5 border-b border-gray-200 dark:border-[#3a3a3a] transition-all duration-300"
                            >
                                <span className={`text-xl font-bold w-8 text-left shrink-0 transition-colors duration-300 ${activeField === 'top' ? accent.symbol : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {config.topSymbol}
                                </span>
                                <span className={`flex-1 text-right text-2xl font-bold tracking-tight transition-colors duration-300 ${activeField === 'top' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {formatDisplay(topValue)}
                                </span>
                                <button
                                    onClick={e => { e.stopPropagation(); copyTop(); }}
                                    className={`ml-3 p-2 rounded-xl transition-all duration-300 shrink-0 shadow-sm ${copiedTop ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : `${accent.copyBg} ${accent.copyText}`
                                        }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {copiedTop
                                            ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}><Check size={15} /></motion.div>
                                            : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}><Copy size={15} /></motion.div>
                                        }
                                    </AnimatePresence>
                                </button>
                            </button>

                            {/* Bottom Field */}
                            <button
                                onClick={() => { setActiveField('bottom'); setIsFirstInput(true); }}
                                className="w-full flex items-center px-4 py-5"
                            >
                                <span className={`text-xl font-bold w-8 text-left shrink-0 transition-colors duration-300 ${activeField === 'bottom' ? accent.symbol : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    Bs
                                </span>
                                <span className={`flex-1 text-right text-2xl font-bold tracking-tight transition-colors duration-300 ${activeField === 'bottom' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {formatDisplay(bottomValue)}
                                </span>
                                <button
                                    onClick={e => { e.stopPropagation(); copyBottom(); }}
                                    className={`ml-3 p-2 rounded-xl transition-all duration-300 shrink-0 shadow-sm ${copiedBottom ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : `${accent.copyBg} ${accent.copyText}`
                                        }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {copiedBottom
                                            ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}><Check size={15} /></motion.div>
                                            : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}><Copy size={15} /></motion.div>
                                        }
                                    </AnimatePresence>
                                </button>
                            </button>
                        </div>

                        {/* Rate Info */}
                        <div className="flex items-center gap-1.5 px-1">
                            <span className={`text-sm transition-colors duration-300 ${accent.pill}`}>↑</span>
                            <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                                Tasa {config.topLabel}:{' '}
                                <span className={`font-bold transition-colors duration-300 ${accent.pill}`}>
                                    {rateValue ? `${rateValue.toFixed(2)} Bs` : loading ? 'Cargando...' : 'Sin datos'}
                                </span>
                            </span>
                        </div>

                    </div>

                    {/* ── Bottom: Register + Keypad ── */}
                    <div className="px-5 pb-6 pt-2 flex flex-col gap-2.5 mt-auto shrink-0">

                        {/* Register Button */}
                        <div className="relative">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowRegisterOptions(v => !v)}
                                style={{ transition: 'background-color 0.3s ease, box-shadow 0.3s ease', boxShadow: accent.btnShadow }}
                                className={`w-full py-3.5 rounded-2xl font-bold text-sm ${accent.registerBg} ${accent.registerText} flex items-center justify-center gap-2`}
                            >
                                <span>Registrar transacción</span>
                                <motion.div animate={{ rotate: showRegisterOptions ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronRight size={16} className="rotate-90" />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {showRegisterOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-[#2C2C2C] border border-gray-100 dark:border-[#444] rounded-2xl overflow-hidden shadow-xl z-10"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => handleRegister('expense')}
                                            className="w-full flex items-center gap-2 px-3 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <TrendingDown size={14} />
                                            <span>Gasto</span>
                                            <span className="ml-auto text-gray-400 font-normal">{formatDisplay(topValue)} {config.topSymbol}</span>
                                        </button>
                                        <div className="h-px bg-gray-100 dark:bg-[#444]" />
                                        <button
                                            onClick={() => handleRegister('income')}
                                            className="w-full flex items-center gap-2 px-3 py-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                        >
                                            <TrendingUp size={14} />
                                            <span>Ingreso</span>
                                            <span className="ml-auto text-gray-400 font-normal">{formatDisplay(topValue)} {config.topSymbol}</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'DEL'].map(key => (
                                <motion.button
                                    key={key}
                                    whileTap={{ scale: 0.88 }}
                                    onPointerDown={key === 'DEL' ? startDelete : undefined}
                                    onPointerUp={key === 'DEL' ? stopDelete : undefined}
                                    onPointerLeave={key === 'DEL' ? stopDelete : undefined}
                                    onClick={key !== 'DEL' ? () => handleKey(key) : undefined}
                                    className={`h-14 rounded-2xl flex items-center justify-center text-xl font-semibold select-none transition-all duration-300 ${key === 'DEL'
                                        ? `${accent.delBg} ${accent.delText}`
                                        : 'bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#333]'
                                        }`}
                                >
                                    {key === 'DEL' ? <Delete size={22} /> : key}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CurrencyConverterModal;
