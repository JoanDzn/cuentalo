import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, TransactionType, RateData } from '../types';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Coffee, Home, Car, ShoppingCart, Zap, Briefcase, Gift, DollarSign, Moon, Sun, Edit2, Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Info, Globe, TrendingUp, Coins, User, Target, CreditCard, List, Calculator, Loader2 } from 'lucide-react';
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

const Dashboard: React.FC<DashboardProps> = ({ transactions, onEditTransaction, isDarkMode, toggleTheme, rates, onProfileClick, onSubscriptionsClick, onFixedIncomeClick, onMissionsClick, onSavingsClick, onCalculatorClick, loading = false, userId }) => {
    const [viewMode, setViewMode] = useState<'recent' | 'history'>('recent');
    const [prevViewMode, setPrevViewMode] = useState<'recent' | 'history'>('recent');
    const changeView = (mode: 'recent' | 'history') => { setPrevViewMode(viewMode); setViewMode(mode); };

    // Tab swipe — pointer events on root div, no setPointerCapture needed
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
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);
    const [showAllRates, setShowAllRates] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<TransactionType | 'all'>('expense');

    const [showSecondary, setShowSecondary] = useState(false);
    const [primaryCurrency] = useCurrencyPreference(userId);
    const isVES = primaryCurrency === 'VES';

    // Set mounted flag after initial render
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    // Sort transactions globally for consistent display (Newest First)
    // Use createdAt for precise time-based ordering, fallback to date field
    const getTransactionTimestamp = (t: Transaction) => {
        // Priority 1: Use createdAt if available (includes time)
        if (t.createdAt) {
            const ts = new Date(t.createdAt).getTime();
            if (!isNaN(ts)) return ts;
        }

        // Priority 2: Parse date field
        if (!t.date) return 0;
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) return d.getTime();

        // Priority 3: Try DD/MM/YYYY format
        const parts = t.date.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
        if (parts) {
            return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1])).getTime();
        }
        return 0;
    };

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            // Descending: Newest (Higher TS) first
            return getTransactionTimestamp(b) - getTransactionTimestamp(a);
        });
    }, [transactions]);

    // Current Month Balance Calculation
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthTransactions = sortedTransactions.filter(t => {
        // Ensure accurate filtering even with different date formats
        if (t.date.includes('T')) return t.date.startsWith(currentMonthKey);
        // Fallback for simple dates
        return t.date.startsWith(currentMonthKey);
    });

    // ── Balance helpers ──────────────────────────────────────────────────────
    // For VES users: sum originalAmounts in Bs directly → no fluctuation.
    // For USD users: sum amount (USD) as before.
    const vesAmount = (t: Transaction): number => {
        if (t.originalCurrency === 'VES' && t.originalAmount != null) return t.originalAmount;
        // USD transaction → convert to Bs at current BCV rate
        return t.amount * rates.bcv;
    };
    const usdAmount = (t: Transaction): number => t.amount;

    const getAmount = (t: Transaction) => isVES ? vesAmount(t) : usdAmount(t);

    // Current month sums in primary currency
    const totalIncome = currentMonthTransactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + getAmount(t);
        if (t.type === 'expense' && (t.category === 'Ahorro' || t.category === 'Savings')) return acc - getAmount(t);
        return acc;
    }, 0);

    const totalExpense = currentMonthTransactions.reduce((acc, t) => {
        if (t.type === 'expense' && t.category !== 'Ahorro' && t.category !== 'Savings') return acc + getAmount(t);
        return acc;
    }, 0);

    const balancePrimary = totalIncome - totalExpense; // in primary currency

    // Secondary display (the other currency)
    const balanceSecondary = isVES ? balancePrimary / rates.bcv : balancePrimary * rates.bcv;

    // Savings Balance in primary currency
    const totalSavingsBalance = sortedTransactions
        .filter(t => t.category === 'Ahorro' || t.category.toLowerCase().includes('ahorro'))
        .reduce((acc, curr) => acc + (curr.type === 'expense' ? getAmount(curr) : -getAmount(curr)), 0);

    // Monthly Grouping Calculation
    const monthlyData = useMemo(() => {
        const groups: Record<string, { income: number; expense: number; balance: number; transactions: Transaction[] }> = {};

        sortedTransactions.forEach(t => {
            // Create key YYYY-MM
            const monthKey = t.date.substring(0, 7);

            if (!groups[monthKey]) {
                groups[monthKey] = { income: 0, expense: 0, balance: 0, transactions: [] };
            }

            // Add transaction to the specific month list
            groups[monthKey].transactions.push(t);

            if (t.type === 'income') {
                groups[monthKey].income += t.amount;
            } else {
                // Expense
                if (t.category === 'Ahorro' || t.category === 'Savings') {
                    // Savings subtract from Income
                    groups[monthKey].income -= t.amount;
                } else {
                    // Regular expenses increase Expense
                    groups[monthKey].expense += t.amount;
                }
            }
            groups[monthKey].balance = groups[monthKey].income - groups[monthKey].expense;
        });

        // Sort descending (newest months first)
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [sortedTransactions]);

    const formatMonth = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const str = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Rango completo de meses: desde 12 meses antes del más antiguo con movimientos hasta el mes actual
    const allMonths = useMemo(() => {
        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        // Start point: current month
        const [ny, nm] = currentKey.split('-').map(Number);
        // End point: 12 months before the oldest transaction month (or 24 months back if no data)
        let ey = ny, em = nm;
        if (monthlyData.length > 0) {
            const oldest = monthlyData[monthlyData.length - 1][0];
            const [oy, om] = oldest.split('-').map(Number);
            // Go 12 months before oldest
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
        return keys; // newest-first
    }, [monthlyData]);

    const toggleMonthExpansion = (monthKey: string) => {
        setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
    };

    return (
        <>
            <div
                ref={swipeContainerRef}
                className="w-full max-w-2xl mx-auto h-full flex flex-col p-6 font-sans"
                onPointerDown={onRootPointerDown}
                onPointerUp={onRootPointerUp}
            >

                {/* Header - Centered Logo */}
                <div className="relative flex flex-col items-center justify-center mb-6 pt-4 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lowercase">cuentalo</h1>

                    {/* Absolute positioned buttons to keep logo perfectly centered */}
                    <div className="absolute top-4 right-0 flex items-center gap-2">
                        <button
                            id="profile-btn"
                            onClick={onProfileClick}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <User size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-200 dark:bg-[#1E1E1E] p-1 rounded-2xl mb-2 self-center w-full max-w-xs">
                    <button
                        onClick={() => changeView('recent')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl ${viewMode === 'recent' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Resumen
                    </button>
                    <button
                        id="history-tab"
                        onClick={() => changeView('history')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl ${viewMode === 'history' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Historial
                    </button>
                </div>

                <div className="flex-1 relative min-h-0 overflow-hidden">
                    <AnimatePresence initial={false} mode="wait">
                        {viewMode === 'recent' ? (
                            <motion.div
                                key="recent"
                                initial={{ opacity: 0, x: prevViewMode === 'history' ? -40 : 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                className="absolute inset-0"
                            >
                                <div className="flex-1 relative h-full">
                                    <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-b from-[#F5F5F5] to-transparent dark:from-[#121212] z-30" />
                                    <div className="h-full overflow-y-auto scrollable-list pt-6 pb-24">
                                        {/* Balance Card - Toggleable USD/VES */}
                                        <div key="recent-view" className="mb-2 text-center w-full">
                                            <div id="balance-card" className="flex flex-col items-center select-none w-full mx-auto">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                                        Balance Total
                                                    </p>
                                                    <button
                                                        onClick={() => setShowSecondary(s => !s)}
                                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-95"
                                                        aria-label="Cambiar moneda"
                                                    >
                                                        <ArrowLeftRight size={10} />
                                                    </button>
                                                </div>

                                                {/* Primary balance */}
                                                {!showSecondary ? (
                                                    <div className={`font-extrabold tracking-tighter w-full flex justify-center items-baseline gap-1 ${isVES
                                                        ? (Math.abs(balancePrimary) > 99999 ? 'text-3xl md:text-5xl' : 'text-5xl md:text-6xl')
                                                        : 'text-[4rem] leading-none md:text-7xl'
                                                        } ${balancePrimary >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                                        <span className="flex items-baseline">
                                                            {!isVES && '$'}
                                                            {balancePrimary.toLocaleString(isVES ? 'es-VE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        {isVES && <span className="text-2xl md:text-3xl font-bold">Bs</span>}
                                                    </div>
                                                ) : (
                                                    <div className={`font-extrabold tracking-tighter w-full flex justify-center items-baseline gap-1 ${!isVES
                                                        ? (Math.abs(balanceSecondary) > 99999 ? 'text-3xl md:text-5xl' : 'text-5xl md:text-6xl')
                                                        : 'text-[4rem] leading-none md:text-7xl'
                                                        } ${balanceSecondary >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                                        <span className="flex items-baseline">
                                                            {isVES && '$'}
                                                            {balanceSecondary.toLocaleString(isVES ? 'en-US' : 'es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        {!isVES && <span className="text-2xl md:text-3xl font-bold">Bs</span>}
                                                    </div>
                                                )}


                                            </div>


                                            {/* Simple Large Amount Display */}
                                            <div className="grid grid-cols-3 gap-2 my-3 w-full px-1 overflow-visible">
                                                <button
                                                    onClick={() => { setModalType('income'); setModalOpen(true); }}
                                                    className="flex items-center justify-center gap-1 bg-white dark:bg-[#1E1E1E] py-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] transition-all duration-500 hover:scale-105 hover:shadow-md cursor-pointer"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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
                                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
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
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                        <Coins size={18} />
                                                    </div>
                                                    <div className="text-base md:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                                                        ${sortedTransactions.filter(t => t.category === 'Ahorro' || t.category.toLowerCase().includes('ahorro')).reduce((acc, t) => acc + (t.type === 'expense' ? t.amount : -t.amount), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="w-full px-1 flex gap-2 mb-2">
                                                <div className="flex-1">
                                                    <RecurringCTA
                                                        onExpenseClick={onSubscriptionsClick}
                                                        onIncomeClick={onFixedIncomeClick}
                                                        onMissionsClick={onMissionsClick}
                                                        onSavingsClick={onSavingsClick}
                                                    />
                                                </div>
                                                <button
                                                    id="calculator-shortcut"
                                                    onClick={onCalculatorClick}
                                                    className="w-16 bg-white dark:bg-[#111] rounded-[24px] shadow-lg border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all active:scale-95 shrink-0"
                                                >
                                                    <Calculator size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Transactions Header - Clickable for Full Menu */}
                                        <div id="recent-transactions-section" className="mb-1 px-1">
                                            <button
                                                onClick={() => { setModalType('all'); setModalOpen(true); }}
                                                className="flex items-center gap-2 group"
                                            >
                                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Recientes</h2>
                                                <ChevronRight size={16} className="mt-1 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                            </button>
                                        </div>

                                        {/* Transactions List (Inline - Flow) */}
                                        <div className="pt-2 pb-8 px-2">
                                            {loading ? (
                                                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-70">
                                                    <div className="flex gap-1.5">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                                            className="w-2.5 h-2.5 bg-gray-900 dark:bg-white rounded-full"
                                                        />
                                                        <motion.div
                                                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                                            className="w-2.5 h-2.5 bg-gray-900 dark:bg-white rounded-full"
                                                        />
                                                        <motion.div
                                                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                                            className="w-2.5 h-2.5 bg-gray-900 dark:bg-white rounded-full"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wide">Cargando movimientos</p>
                                                </div>
                                            ) : sortedTransactions.length === 0 ? (
                                                <div className="text-center py-10 opacity-50">
                                                    <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-[#1E1E1E] rounded-full flex items-center justify-center text-gray-400 mb-4">
                                                        <DollarSign size={24} />
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400">Sin movimientos.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {sortedTransactions.map((t) => (
                                                        <div
                                                            key={t.id}
                                                            onClick={() => onEditTransaction(t)}
                                                            className="group bg-white dark:bg-[#1a1a1a] p-3 rounded-2xl shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 cursor-pointer flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative hover:z-10"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.category === 'Ahorro'
                                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                                    : t.type === 'income'
                                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                                        : 'bg-gray-50 dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-400'
                                                                    }`}>
                                                                    {React.cloneElement(getCategoryIcon(t.category) as React.ReactElement<any>, { size: 16 })}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                                    <div className="text-[10px] text-gray-400 capitalize">{t.category} • {formatDate(t.date)}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </div>
                                                                {t.originalAmount && t.originalCurrency === 'VES' && (
                                                                    <div className="text-[9px] text-gray-400 font-medium">
                                                                        {t.originalAmount.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs
                                                                        {t.rateType && <span className="ml-1 text-indigo-400 opacity-80 uppercase">• {getRateLabel(t.rateType)}</span>}
                                                                    </div>
                                                                )}
                                                                <div className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex justify-end items-center gap-1 mt-0.5">
                                                                    <Edit2 size={10} /> Editar
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-[#F5F5F5] dark:bg-[#121212]" style={{ maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, x: prevViewMode === 'recent' ? 40 : 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 40 }}
                                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                className="absolute inset-0 flex flex-col"
                            >
                                <div key="history-view" className="flex-1 flex flex-col h-full" style={{ minHeight: 0 }}>

                                    {(() => {
                                        const vi = Math.min(Math.max(selectedMonthIndex, 0), allMonths.length - 1);
                                        const mk = allMonths[vi];
                                        const monthEntry = monthlyData.find(([k]) => k === mk);
                                        const md = monthEntry ? monthEntry[1] : { income: 0, expense: 0, balance: 0, transactions: [] };
                                        const txs = [...md.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                        return (
                                            <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
                                                {/* Header fijo */}
                                                <div className="flex-shrink-0 space-y-3 pt-2 pb-3">
                                                    {/* Navegador de Mes */}
                                                    <div className="flex items-center justify-between bg-[#1C1C1E] rounded-[20px] py-3 px-4 border border-gray-800">
                                                        <button onClick={() => { if (vi < allMonths.length - 1) setSelectedMonthIndex(vi + 1); }} disabled={vi >= allMonths.length - 1} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#2A2A2C] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors">
                                                            <ChevronLeft size={18} />
                                                        </button>
                                                        <span className="text-white font-semibold text-base">{formatMonth(mk)}</span>
                                                        <button onClick={() => { if (vi > 0) setSelectedMonthIndex(vi - 1); }} disabled={vi <= 0} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#2A2A2C] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors">
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                    {/* Resumen del Mes */}
                                                    <div className="bg-[#1C1C1E] rounded-[20px] p-5 border border-gray-800">
                                                        {/* Fila superior: Ingresos + Gastos + Neto */}
                                                        <div className="grid grid-cols-3 gap-2 text-center">
                                                            <div>
                                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-medium">Ingresos</div>
                                                                <div className="text-emerald-400 font-bold text-base">+{md.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-medium">Gastos</div>
                                                                <div className="text-red-400 font-bold text-base">-{md.expense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                            </div>
                                                            <div className="bg-[#2A2A2C] rounded-xl py-2 px-1 border border-gray-700/50">
                                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-medium">Neto</div>
                                                                <div className={`font-bold text-base ${md.balance >= 0 ? 'text-white' : 'text-red-400'}`}>{md.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                            </div>
                                                        </div>
                                                        {/* Fila inferior: cantidad de movimientos */}
                                                        <div className="mt-3 pt-3 border-t border-gray-700/50 text-center">
                                                            <span className="text-xs text-gray-400 font-medium">{md.transactions.length} {md.transactions.length === 1 ? 'movimiento' : 'movimientos'} este mes</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Lista scrolleable */}
                                                <div className="relative flex-1 min-h-0 overflow-hidden">
                                                    <div className="absolute top-0 left-0 right-0 h-6 z-10 pointer-events-none bg-gradient-to-b from-[#121212] to-transparent" />
                                                    <div
                                                        className="h-full overflow-y-auto scrollable-list pb-36 pt-4 flex flex-col gap-3 pr-1"
                                                    >
                                                        {txs.length === 0 ? (
                                                            <div className="text-center py-16 text-gray-500 text-sm">No hay movimientos este mes.</div>
                                                        ) : txs.map((t) => (
                                                            <div key={t.id} onClick={() => onEditTransaction(t)} className="bg-white dark:bg-[#1a1a1a] p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2C] border border-transparent dark:border-white/5 shadow-sm flex-shrink-0">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.category === 'Ahorro' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-400'}`}>
                                                                        {getCategoryIcon(t.category)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-sm text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                                        <div className="text-[10px] text-gray-400">{formatDate(t.date)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                                    {t.originalAmount && t.originalCurrency === 'VES' && (
                                                                        <div className="text-[10px] text-gray-400 font-medium">
                                                                            {t.originalAmount.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs
                                                                            {t.rateType && <span className="ml-1 text-indigo-400 opacity-80 uppercase">• {getRateLabel(t.rateType)}</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none bg-gradient-to-t from-[#121212] to-transparent" />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* Transaction List Modal */}
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