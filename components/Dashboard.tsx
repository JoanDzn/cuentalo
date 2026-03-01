import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, TransactionType, RateData } from '../types';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Coffee, Home, Car, ShoppingCart, Zap, Briefcase, Gift, DollarSign, Moon, Sun, Edit2, Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Info, Globe, TrendingUp, Coins, User, Target, CreditCard, List, Calculator, Loader2, Plus, LayoutGrid, X, PiggyBank } from 'lucide-react';
import TransactionListModal from './TransactionListModal';
import { useCurrencyPreference } from '../hooks/useCurrencyPreference';


interface DashboardProps {
    transactions: Transaction[];
    onEditTransaction: (t: Transaction) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    rates: RateData;
    onProfileClick: () => void;
    onSubscriptionsClick: () => void;
    onFixedIncomeClick: () => void;
    onMissionsClick: () => void;
    onSavingsClick: () => void;
    onCalculatorClick: () => void;
    onRatesClick: () => void;
    loading?: boolean;
    userId?: string;
}

const RecurringCTA = ({ onExpenseClick, onIncomeClick, onMissionsClick, onSavingsClick }: { onExpenseClick: () => void, onIncomeClick: () => void, onMissionsClick: () => void, onSavingsClick: () => void }) => {
    const [page, setPage] = useState(0);

    const slides = [
        { title: 'Gastos Fijos', msg: '¡Evita sorpresas!', icon: <CreditCard size={20} className="text-white" />, color: 'bg-pink-500', action: onExpenseClick },
        { title: 'Ingresos Fijos', msg: 'Crece tu patrimonio', icon: <TrendingUp size={20} className="text-white" />, color: 'bg-emerald-500', action: onIncomeClick },
        { title: 'Ahorros', msg: 'Págate a ti primero', icon: <Coins size={20} className="text-white" />, color: 'bg-indigo-500', action: onSavingsClick },
        { title: 'Presupuesto', msg: 'Planifica tu mes', icon: <Target size={20} className="text-white" />, color: 'bg-blue-500', action: onMissionsClick }
    ];

    useEffect(() => {
        const interval = setInterval(() => setPage(prev => (prev + 1) % 4), 6000);
        return () => clearInterval(interval);
    }, [page]);

    const swipeStartX = useRef<number | null>(null);
    const swipeMoved = useRef(false);

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        swipeStartX.current = e.touches[0].clientX;
        swipeMoved.current = false;
        e.stopPropagation(); // prevent parent from swiping
    };
    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (swipeStartX.current === null) return;
        if (Math.abs(e.touches[0].clientX - swipeStartX.current) > 10) swipeMoved.current = true;
    };
    const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (swipeStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - swipeStartX.current;
        if (Math.abs(diff) > 40) {
            if (diff < 0) setPage(prev => (prev + 1) % slides.length);
            else setPage(prev => (prev - 1 + slides.length) % slides.length);
        }
        swipeStartX.current = null;
    };

    const current = slides[page];

    return (
        <div id="recurring-carousel" className="w-full">
            <div
                className="bg-white dark:bg-[#111] rounded-[24px] pl-4 pr-2 pt-3 pb-4 md:py-5 relative shadow-lg cursor-pointer active:scale-95 transition-transform border border-gray-100 dark:border-white/5"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => { if (!swipeMoved.current) current.action(); }}
            >

                <div className="flex items-center justify-between relative z-20 pointer-events-none">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${current.color} flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-white/5`}>
                            {React.cloneElement(current.icon as React.ReactElement<any>, { size: 16 })}
                        </div>
                        <div className="text-left flex flex-col justify-center h-8">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{current.title}</h3>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{current.msg}</p>
                        </div>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 flex gap-1 pointer-events-auto">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setPage(i); }}
                                className={`h-1 rounded-full transition-all duration-300 ${page === i ? 'bg-gray-900 dark:bg-white w-4 opacity-80' : 'bg-gray-200 dark:bg-gray-700 w-1'}`}
                            />
                        ))}
                    </div>

                    <div className="pr-1">
                        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};


// Helper to get icon
const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('comida') || lower.includes('food') || lower.includes('coffee') || lower.includes('café') || lower.includes('mercado')) return <Coffee size={18} />;
    if (lower.includes('hogar') || lower.includes('house') || lower.includes('rent')) return <Home size={18} />;
    if (lower.includes('transporte') || lower.includes('transport') || lower.includes('uber') || lower.includes('taxi')) return <Car size={18} />;
    if (lower.includes('shopping') || lower.includes('compra')) return <ShoppingCart size={18} />;
    if (lower.includes('utilities') || lower.includes('servicios') || lower.includes('luz')) return <Zap size={18} />;
    if (lower.includes('salary') || lower.includes('salario') || lower.includes('pago')) return <Briefcase size={18} />;
    if (lower.includes('gift') || lower.includes('regalo')) return <Gift size={18} />;
    if (lower.includes('ahorro') || lower.includes('saving')) return <Coins size={18} />;
    return <DollarSign size={18} />;
};

// Helper to get rate label
const getRateLabel = (rateType: string | null | undefined): string => {
    if (!rateType) return 'Dolar';
    const labels: Record<string, string> = {
        bcv: 'Dolar',
        euro: 'Euro',
        usdt: 'USDT'
    };
    return labels[rateType] || 'Dolar';
};

// Helper to format date consistent with user timezone expectation (stripping time)
const formatDate = (dateStep: string) => {
    if (!dateStep) return '';
    // Handle both ISO strings (T separator) and simple dates
    const cleanDate = dateStep.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
};

export const QuickMenu = ({ onBudget, onIncome, onExpense, onSavings, onRates }: { onBudget: () => void, onIncome: () => void, onExpense: () => void, onSavings: () => void, onRates: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const items = [
        { icon: <Target size={18} />, action: onBudget, color: 'text-white', bg: 'bg-blue-600' },
        { icon: <TrendingUp size={18} />, action: onIncome, color: 'text-white', bg: 'bg-emerald-600' },
        { icon: <CreditCard size={18} />, action: onExpense, color: 'text-white', bg: 'bg-rose-600' },
        { icon: <PiggyBank size={18} />, action: onSavings, color: 'text-white', bg: 'bg-indigo-600' },
        { icon: <Globe size={18} />, action: onRates, color: 'text-white', bg: 'bg-amber-500' },
    ];

    return (
        <div className="fixed bottom-8 left-0 right-0 z-[45] flex justify-center pointer-events-none w-full px-6">
            <div className="w-full max-w-2xl relative flex justify-end">
                <div className="flex flex-col items-center gap-1.5 pointer-events-auto mr-0 md:mr-2">
                    {/* Click outside overlay */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 z-[-1] bg-black/0"
                            />
                        )}
                    </AnimatePresence>

                    {/* Icons Stack */}
                    <div className="flex flex-col gap-1.5 mb-1">
                        <AnimatePresence>
                            {isOpen && items.map((item, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: 10, transition: { delay: i * 0.02 } }}
                                    transition={{
                                        delay: (items.length - 1 - i) * 0.03,
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25
                                    }}
                                    onClick={() => { item.action(); setIsOpen(false); }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${item.bg} ${item.color} transition-colors`}
                                >
                                    {item.icon}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Main Trigger Button */}
                    <motion.button
                        initial={false}
                        animate={{
                            rotate: isOpen ? 180 : 0,
                            scale: isOpen ? 0.9 : 1
                        }}
                        whileTap={{ scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-12 h-12 bg-white/70 dark:bg-[#222222]/85 backdrop-blur-[24px] border border-gray-200/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-gray-800 dark:text-white rounded-full flex items-center justify-center z-50 pointer-events-auto transition-colors"
                    >
                        <ChevronUp size={24} strokeWidth={3} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, onEditTransaction, isDarkMode, toggleTheme, rates, onProfileClick, onSubscriptionsClick, onFixedIncomeClick, onMissionsClick, onSavingsClick, onCalculatorClick, onRatesClick, loading = false, userId }) => {
    const [viewMode, setViewMode] = useState<'recent' | 'history'>('recent');
    const [prevViewMode, setPrevViewMode] = useState<'recent' | 'history'>('recent');
    const changeView = (mode: 'recent' | 'history') => { setPrevViewMode(viewMode); setViewMode(mode); };

    // Tab swipe
    const tabSwipeStart = useRef<{ x: number; y: number } | null>(null);
    const swipeContainerRef = useRef<HTMLDivElement>(null);
    const onRootPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.buttons !== 1) return;
        tabSwipeStart.current = { x: e.clientX, y: e.clientY };
    };
    const onRootPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!tabSwipeStart.current) return;
        const dx = e.clientX - tabSwipeStart.current.x;
        const dy = e.clientY - tabSwipeStart.current.y;
        tabSwipeStart.current = null;
        if (Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 2) return;
        if (dx < 0 && viewModeRef.current === 'recent') { setPrevViewMode('recent'); setViewMode('history'); }
        else if (dx > 0 && viewModeRef.current === 'history') { setPrevViewMode('history'); setViewMode('recent'); }
    };
    const viewModeRef = useRef(viewMode);
    useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<TransactionType | 'all'>('expense');

    const [showSecondary, setShowSecondary] = useState(false);
    const [primaryCurrency] = useCurrencyPreference(userId);
    const isVES = primaryCurrency === 'VES';

    // Sort transactions globally
    const getTransactionTimestamp = (t: Transaction) => {
        if (t.createdAt) {
            const ts = new Date(t.createdAt).getTime();
            if (!isNaN(ts)) return ts;
        }
        if (!t.date) return 0;
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) return d.getTime();
        return 0;
    };

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => getTransactionTimestamp(b) - getTransactionTimestamp(a));
    }, [transactions]);

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthTransactions = sortedTransactions.filter(t => t.date.startsWith(currentMonthKey));

    // Balance helpers
    const vesAmount = (t: Transaction) => {
        if (t.originalCurrency === 'VES' && t.originalAmount != null) return t.originalAmount;
        if (t.rateValue && t.rateValue > 0) return t.amount * t.rateValue;
        return t.amount * rates.bcv;
    };
    const usdAmount = (t: Transaction) => t.amount;

    const calcBalance = (amountFn: (t: Transaction) => number) => {
        const income = sortedTransactions.reduce((acc, t) => {
            if (t.type === 'income') return acc + amountFn(t);
            if (t.type === 'expense' && (t.category === 'Ahorro' || t.category === 'Savings')) return acc - amountFn(t);
            return acc;
        }, 0);
        const expense = sortedTransactions.reduce((acc, t) => {
            if (t.type === 'expense' && t.category !== 'Ahorro' && t.category !== 'Savings') return acc + amountFn(t);
            return acc;
        }, 0);
        return income - expense;
    };

    const balanceUSD = calcBalance(usdAmount);
    const balanceVES = calcBalance(vesAmount);

    const balancePrimary = isVES ? balanceVES : balanceUSD;
    const balanceSecondary = isVES ? balanceUSD : balanceVES;

    const monthlyData = useMemo(() => {
        const groups: Record<string, { income: number; expense: number; balance: number; transactions: Transaction[] }> = {};
        sortedTransactions.forEach(t => {
            const monthKey = t.date.substring(0, 7);
            if (!groups[monthKey]) groups[monthKey] = { income: 0, expense: 0, balance: 0, transactions: [] };
            groups[monthKey].transactions.push(t);
            if (t.type === 'income') groups[monthKey].income += t.amount;
            else if (t.category === 'Ahorro' || t.category === 'Savings') groups[monthKey].income -= t.amount;
            else groups[monthKey].expense += t.amount;
            groups[monthKey].balance = groups[monthKey].income - groups[monthKey].expense;
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [sortedTransactions]);

    const allMonths = useMemo(() => {
        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [ny, nm] = currentKey.split('-').map(Number);
        let ey = ny, em = nm;
        if (monthlyData.length > 0) {
            const oldest = monthlyData[monthlyData.length - 1][0];
            const [oy, om] = oldest.split('-').map(Number);
            em = om - 12; ey = oy;
            while (em <= 0) { em += 12; ey--; }
        } else {
            em = nm - 24; ey = ny;
            while (em <= 0) { em += 12; ey--; }
        }
        const keys: string[] = [];
        let y = ny, m = nm;
        while (y > ey || (y === ey && m >= em)) {
            keys.push(`${y}-${String(m).padStart(2, '0')}`);
            m--;
            if (m === 0) { m = 12; y--; }
        }
        return keys;
    }, [monthlyData]);

    const formatMonth = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const str = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <>
            <div
                ref={swipeContainerRef}
                className="w-full max-w-2xl mx-auto h-full flex flex-col p-6 font-sans relative"
                onPointerDown={onRootPointerDown}
                onPointerUp={onRootPointerUp}
            >
                <div className="relative flex flex-col items-center justify-center mb-6 pt-4 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lowercase">cuentalo</h1>
                    <div className="absolute top-4 right-0 flex items-center gap-2">
                        <button id="profile-btn" onClick={onProfileClick} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                            <User size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex bg-gray-200 dark:bg-[#1E1E1E] p-1 rounded-2xl mb-2 self-center w-full max-w-xs transition-colors">
                    <button onClick={() => changeView('recent')} className={`flex-1 py-2 text-sm font-semibold rounded-xl ${viewMode === 'recent' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>Resumen</button>
                    <button id="history-tab" onClick={() => changeView('history')} className={`flex-1 py-2 text-sm font-semibold rounded-xl ${viewMode === 'history' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>Historial</button>
                </div>

                <div className="flex-1 relative min-h-0 overflow-hidden">
                    <AnimatePresence initial={false} mode="wait">
                        {viewMode === 'recent' ? (
                            <motion.div key="recent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                                {/* Fades for Recent */}
                                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#F5F5F5] dark:from-[#121212] to-transparent pointer-events-none z-10" />
                                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#F5F5F5] dark:from-[#121212] to-transparent pointer-events-none z-10" />

                                <div className="h-full overflow-y-auto scrollable-list pt-6 pb-28 relative z-0">
                                    <div id="balance-card" className="mb-3 text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Balance Total</p>
                                            <button onClick={() => setShowSecondary(s => !s)} className="p-1 text-gray-400">
                                                <ArrowLeftRight size={10} />
                                            </button>
                                        </div>
                                        {/* Primary balance */}
                                        {!showSecondary ? (
                                            <div className={`font-extrabold tracking-tighter w-full flex justify-center items-baseline gap-1 ${isVES
                                                ? (Math.abs(balancePrimary) > 9999 ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl')
                                                : 'text-[4.2rem] leading-none md:text-7xl'
                                                } ${balancePrimary >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                                <span className="flex items-baseline">
                                                    {!isVES && '$'}
                                                    {balancePrimary.toLocaleString(isVES ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                {isVES && <span className="text-3xl md:text-4xl font-bold">Bs</span>}
                                            </div>
                                        ) : (
                                            <div className={`font-extrabold tracking-tighter w-full flex justify-center items-baseline gap-1 ${!isVES
                                                ? (Math.abs(balanceSecondary) > 9999 ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl')
                                                : 'text-[4.2rem] leading-none md:text-7xl'
                                                } ${balanceSecondary >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                                <span className="flex items-baseline">
                                                    {isVES && '$'}
                                                    {balanceSecondary.toLocaleString(isVES ? 'en-US' : 'es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                {!isVES && <span className="text-3xl md:text-4xl font-bold">Bs</span>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 my-3 w-full px-1 overflow-visible">
                                        <button
                                            onClick={() => { setModalType('income'); setModalOpen(true); }}
                                            className="flex items-center justify-center gap-1 bg-white dark:bg-[#1E1E1E] py-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <ArrowUpRight size={18} />
                                            </div>
                                            <div className="text-base md:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                                                ${currentMonthTransactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : (t.type === 'expense' && (t.category === 'Ahorro' || t.category === 'Savings')) ? acc - t.amount : acc, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => { setModalType('expense'); setModalOpen(true); }}
                                            className="flex items-center justify-center gap-1 bg-white dark:bg-[#1E1E1E] py-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                                <ArrowDownRight size={18} />
                                            </div>
                                            <div className="text-base md:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                                                ${currentMonthTransactions.reduce((acc, t) => t.type === 'expense' && t.category !== 'Ahorro' && t.category !== 'Savings' ? acc + t.amount : acc, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                        </button>

                                        <button
                                            onClick={onSavingsClick}
                                            className="flex items-center justify-center gap-1 bg-white dark:bg-[#1E1E1E] py-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <Coins size={18} />
                                            </div>
                                            <div className="text-base md:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                                                ${sortedTransactions.filter(t => t.category === 'Ahorro' || t.category.toLowerCase().includes('ahorro')).reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                        </button>
                                    </div>
                                    <div className="w-full px-1 flex gap-2 mb-2">
                                        <div className="flex-1">
                                            <RecurringCTA onExpenseClick={onSubscriptionsClick} onIncomeClick={onFixedIncomeClick} onMissionsClick={onMissionsClick} onSavingsClick={onSavingsClick} />
                                        </div>
                                        <button id="calculator-shortcut" onClick={onCalculatorClick} className="w-16 bg-white dark:bg-[#111] rounded-[24px] shadow-lg border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-all"><Calculator size={24} /></button>
                                    </div>

                                    <div id="recent-transactions-section" className="mb-2 px-1 flex items-center justify-between">
                                        <button onClick={() => { setModalType('all'); setModalOpen(true); }} className="flex items-center gap-2 group">
                                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Recientes</h2>
                                            <ChevronRight size={16} className="text-gray-400 mt-[3px]" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 px-1">
                                        {loading ? (
                                            <div className="flex flex-col justify-center items-center gap-3 py-16">
                                                <div className="flex gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-white animate-pulse" />
                                                    <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Cargando movimientos...</p>
                                            </div>
                                        ) : sortedTransactions.length === 0 ? (
                                            <p className="text-center py-10 text-gray-400">Sin movimientos.</p>
                                        ) : (
                                            sortedTransactions.slice(0, 10).map(t => (
                                                <div key={t.id} onClick={() => onEditTransaction(t)} className="bg-white dark:bg-[#1a1a1a] p-3 rounded-2xl shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer flex items-center justify-between transition-all duration-500">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.category === 'Ahorro'
                                                            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                                            : t.type === 'income'
                                                                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {React.cloneElement(getCategoryIcon(t.category) as React.ReactElement<any>, { size: 16 })}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                            <div className="text-[10px] text-gray-400 capitalize">{t.category} • {formatDate(t.date)}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                                                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col pt-6 pb-2">
                                <div className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] rounded-2xl py-3 px-4 mb-4 border border-gray-100 dark:border-[#333] shadow-sm relative z-10">
                                    <button onClick={() => selectedMonthIndex < allMonths.length - 1 && setSelectedMonthIndex(selectedMonthIndex + 1)} disabled={selectedMonthIndex >= allMonths.length - 1} className="p-2 disabled:opacity-30"><ChevronLeft size={20} /></button>
                                    <span className="font-bold text-gray-900 dark:text-white">{formatMonth(allMonths[selectedMonthIndex])}</span>
                                    <button onClick={() => selectedMonthIndex > 0 && setSelectedMonthIndex(selectedMonthIndex - 1)} disabled={selectedMonthIndex <= 0} className="p-2 disabled:opacity-30"><ChevronRight size={20} /></button>
                                </div>

                                {(() => {
                                    const mk = allMonths[selectedMonthIndex];
                                    const md = monthlyData.find(([k]) => k === mk)?.[1] || { transactions: [] };

                                    const monthIncome = md.transactions.map(t => t.type === 'income' ? Number(t.amount) : 0).reduce((a, b) => a + b, 0);
                                    const monthExpense = md.transactions.map(t => t.type === 'expense' ? Number(t.amount) : 0).reduce((a, b) => a + b, 0);
                                    const monthNet = monthIncome - monthExpense;

                                    return (
                                        <>
                                            <div className="flex bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 mb-4 justify-between items-center shadow-sm border border-gray-100 dark:border-[#333] relative z-10">
                                                <div className="flex flex-col items-center w-1/4">
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Movs.</span>
                                                    <span className="text-gray-900 dark:text-gray-300 font-bold text-sm truncate tracking-tight">{md.transactions.length}</span>
                                                </div>
                                                <div className="w-px h-8 bg-gray-100 dark:bg-[#333]" />
                                                <div className="flex flex-col items-center w-1/4">
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Ingresos</span>
                                                    <span className="text-emerald-500 font-bold text-sm truncate tracking-tight">+${monthIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="w-px h-8 bg-gray-100 dark:bg-[#333]" />
                                                <div className="flex flex-col items-center w-1/4">
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Gastos</span>
                                                    <span className="text-red-500 font-bold text-sm truncate tracking-tight">-${monthExpense.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="w-px h-8 bg-gray-100 dark:bg-[#333]" />
                                                <div className="flex flex-col items-center w-1/4">
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Neto</span>
                                                    <span className={`font-bold text-sm truncate tracking-tight ${monthNet >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                                        {monthNet < 0 ? '-' : ''}${Math.abs(monthNet).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 relative min-h-0 -mx-4 px-4">
                                                {/* Fades for History */}
                                                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#F5F5F5] dark:from-[#121212] to-transparent pointer-events-none z-10" />
                                                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#F5F5F5] dark:from-[#121212] to-transparent pointer-events-none z-10" />

                                                <div className="h-full overflow-y-auto scrollable-list space-y-3 pt-2 pb-28 relative z-0">
                                                    {md.transactions.length === 0 ? (
                                                        <p className="text-center py-20 text-gray-500">No hay movimientos.</p>
                                                    ) : md.transactions.sort((a, b) => getTransactionTimestamp(b) - getTransactionTimestamp(a)).map(t => (
                                                        <div key={t.id} onClick={() => onEditTransaction(t)} className="bg-white dark:bg-[#1a1a1a] p-3 rounded-2xl flex items-center justify-between cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-500">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.category === 'Ahorro'
                                                                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                                                    : t.type === 'income'
                                                                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                                                    }`}>
                                                                    {React.cloneElement(getCategoryIcon(t.category) as React.ReactElement<any>, { size: 16 })}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-sm text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                                    <div className="text-[10px] text-gray-400">{formatDate(t.date)}</div>
                                                                </div>
                                                            </div>
                                                            <div className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <TransactionListModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                transactions={sortedTransactions}
                type={modalType}
                title={modalType === 'income' ? 'Ingresos' : modalType === 'expense' ? 'Gastos' : 'Movimientos'}
                onEditTransaction={onEditTransaction}
                rates={rates}
            />
        </>
    );
};

export default Dashboard;