import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ChevronDown, Delete, ArrowRightLeft, Check } from 'lucide-react';
import { useExchangeRates } from '../services/exchangeRateService';
import { RateData } from '../types';

interface CurrencyConverterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Currency = 'USD' | 'VES' | 'EUR';
type RateType = 'bcv' | 'euro' | 'usdt';

const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ isOpen, onClose }) => {
    const { rates, loading } = useExchangeRates();
    const [amount, setAmount] = useState('0');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [selectedRate, setSelectedRate] = useState<RateType>('bcv');
    const [result, setResult] = useState<number>(0);
    const [activeMenu, setActiveMenu] = useState<'currency' | 'rate' | null>(null);
    const [copied, setCopied] = useState(false);
    const deleteTimer = useRef<NodeJS.Timeout | null>(null);

    // Auto-select rate when currency changes
    useEffect(() => {
        if (currency === 'EUR') {
            setSelectedRate('euro');
        } else if (selectedRate === 'euro' && currency !== 'VES') {
            setSelectedRate('bcv');
        }
    }, [currency]);

    // Calculate result
    useEffect(() => {
        if (!rates) return;
        const val = parseFloat(amount || '0');
        if (isNaN(val)) {
            setResult(0);
            return;
        }

        const rate = rates[selectedRate];

        if (currency === 'USD') {
            setResult(val * rate);
        } else if (currency === 'EUR') {
            setResult(val * rate);
        } else {
            setResult(val / rate);
        }
    }, [amount, currency, selectedRate, rates]);

    const handleCreateNumber = (num: string) => {
        if (amount === '0' && num !== '.') {
            setAmount(num);
        } else if (amount.includes('.') && num === '.') {
            return;
        } else {
            if (amount.replace('.', '').length >= 12) return;
            setAmount(amount + num);
        }
    };

    const handleDelete = () => {
        if (amount.length === 1) {
            setAmount('0');
        } else {
            setAmount(amount.slice(0, -1));
        }
    };

    const startDelete = () => {
        handleDelete();
        deleteTimer.current = setTimeout(() => {
            setAmount('0');
        }, 600);
    };

    const clearDeleteTimer = () => {
        if (deleteTimer.current) {
            clearTimeout(deleteTimer.current);
            deleteTimer.current = null;
        }
    };

    const formatCurrency = (val: number, curr: Currency) => {
        return new Intl.NumberFormat('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    const getTargetCurrency = (): Currency => {
        if (currency === 'VES') {
            return selectedRate === 'euro' ? 'EUR' : 'USD';
        }
        return 'VES';
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatCurrency(result, getTargetCurrency()));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSwap = () => {
        setCurrency(prev => {
            if (prev === 'VES') {
                return selectedRate === 'euro' ? 'EUR' : 'USD';
            }
            return 'VES';
        });
    };

    // Custom Keypad Button
    const Key = ({ value, label, onClick, special = false, ...props }: any) => (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            {...props}
            className={`h-14 sm:h-16 rounded-2xl text-xl sm:text-2xl font-medium flex items-center justify-center select-none
        ${special
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-gray-50 text-gray-900 dark:bg-[#2C2C2C] dark:text-white hover:bg-gray-100 dark:hover:bg-[#333]'
                } transition-colors`}
        >
            {label || value}
        </motion.button>
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center pointer-events-auto"
                onClick={onClose}
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
                        if (info.offset.y > 100 || info.velocity.y > 500) {
                            onClose();
                        }
                    }}
                    className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col pointer-events-auto min-h-[500px] max-h-[95vh]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Drag Handle */}
                    <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none shrink-0">
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-5 pb-2 flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-bold dark:text-white">Calculadora</h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-[#2C2C2C] rounded-full text-gray-500 dark:text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col flex-1 px-5 pb-5 pt-2">

                        {/* Top Controls Row */}
                        <div className="flex justify-between items-center w-full mb-1 relative z-50">
                            {/* Left: Currency */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'currency' ? null : 'currency')}
                                    className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2C2C2C] px-3 py-2 rounded-lg active:scale-95 transition-transform"
                                >
                                    <span>{currency}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'currency' ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {activeMenu === 'currency' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute top-full mt-2 left-0 w-32 bg-white dark:bg-[#333] rounded-xl shadow-xl border border-gray-100 dark:border-[#444] overflow-hidden p-1"
                                        >
                                            {(['USD', 'VES', 'EUR'] as Currency[]).map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => {
                                                        setCurrency(c);
                                                        setActiveMenu(null);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${currency === c
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#444]'
                                                        }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Swap Button */}
                            <button
                                onClick={handleSwap}
                                className="p-2 text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors active:scale-90 transform"
                            >
                                <ArrowRightLeft size={16} />
                            </button>

                            {/* Right: Rate */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'rate' ? null : 'rate')}
                                    className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2C2C2C] px-3 py-2 rounded-lg active:scale-95 transition-transform"
                                >
                                    <span className="uppercase">{selectedRate === 'usdt' ? 'USDT' : selectedRate}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'rate' ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {activeMenu === 'rate' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute top-full mt-2 right-0 w-32 bg-white dark:bg-[#333] rounded-xl shadow-xl border border-gray-100 dark:border-[#444] overflow-hidden p-1"
                                        >
                                            {[
                                                { id: 'bcv', label: 'BCV' },
                                                { id: 'usdt', label: 'USDT' },
                                                { id: 'euro', label: 'EURO' }
                                            ].map((rateOption) => (
                                                <button
                                                    key={rateOption.id}
                                                    onClick={() => {
                                                        setSelectedRate(rateOption.id as RateType);
                                                        setActiveMenu(null);
                                                    }}
                                                    disabled={
                                                        (currency === 'EUR' && rateOption.id !== 'euro') ||
                                                        (currency === 'USD' && rateOption.id === 'euro')
                                                    }
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all uppercase flex justify-between items-center ${selectedRate === rateOption.id
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#444]'
                                                        } ${(currency === 'EUR' && rateOption.id !== 'euro') || (currency === 'USD' && rateOption.id === 'euro') ? 'opacity-30' : ''}`}
                                                >
                                                    <span>{rateOption.label}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Display Area - Centered */}
                        <div className="flex-1 flex flex-col items-center justify-center py-0">
                            {/* Input (Small) */}
                            <div className="text-gray-400 dark:text-gray-500 font-medium text-lg mb-0">
                                {amount} {currency}
                            </div>

                            {/* Result (Big) */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-6xl sm:text-7xl font-bold text-gray-900 dark:text-white tracking-tight text-center break-all line-clamp-1">
                                    {formatCurrency(result, getTargetCurrency())}
                                </span>
                                <div className="flex flex-col items-start leading-none gap-1 shrink-0">
                                    <span className="text-xl text-gray-400 dark:text-gray-500 font-medium">
                                        {currency === 'VES' && selectedRate === 'usdt' ? 'USDT' : (getTargetCurrency() === 'VES' ? 'Bs' : getTargetCurrency())}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className={`p-1.5 rounded-lg active:scale-95 transition-all flex items-center justify-center relative ${copied
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-gray-100 dark:bg-[#2C2C2C] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                            }`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {copied ? (
                                                <motion.div
                                                    key="check"
                                                    initial={{ scale: 0, rotate: -45 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    exit={{ scale: 0, rotate: 45 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Check size={16} />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="copy"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Copy size={16} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>

                            {/* Rate Info Pill */}
                            <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-10">
                                Tasa: {rates ? rates[selectedRate].toFixed(2) : '...'} • {selectedRate === 'usdt' ? 'USDT' : selectedRate.toUpperCase()}
                            </div>
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-3 mt-auto shrink-0">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <Key key={num} value={num} onClick={() => handleCreateNumber(num.toString())} />
                            ))}
                            <Key value="." label="." onClick={() => handleCreateNumber('.')} />
                            <Key value="0" label="0" onClick={() => handleCreateNumber('0')} />
                            <Key
                                value="del"
                                label={<Delete size={24} />}
                                special
                                onPointerDown={startDelete}
                                onPointerUp={clearDeleteTimer}
                                onPointerLeave={clearDeleteTimer}
                            />
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CurrencyConverterModal;
