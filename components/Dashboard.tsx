import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, TransactionType, RateData } from '../types';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Coffee, Home, Car, ShoppingCart, Zap, Briefcase, Gift, DollarSign, Moon, Sun, Edit2, Calendar, ChevronDown, ChevronUp, ChevronRight, Info, Globe, TrendingUp, Coins, User, Target, CreditCard, List } from 'lucide-react';
import TransactionListModal from './TransactionListModal';


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
}

const RecurringCTA = ({ onExpenseClick, onIncomeClick, onMissionsClick, onSavingsClick }: { onExpenseClick: () => void, onIncomeClick: () => void, onMissionsClick: () => void, onSavingsClick: () => void }) => {
    const [page, setPage] = useState(0);

    const slides = [
        {
            title: 'Gastos Fijos',
            msg: '¡Evita sorpresas!',
            icon: <CreditCard size={20} className="text-white" />,
            color: 'bg-pink-500',
            action: onExpenseClick
        },
        {
            title: 'Ingresos Fijos',
            msg: 'Crece tu patrimonio',
            icon: <TrendingUp size={20} className="text-white" />,
            color: 'bg-emerald-500',
            action: onIncomeClick
        },
        {
            title: 'Ahorros',
            msg: 'Págate a ti primero',
            icon: <Coins size={20} className="text-white" />,
            color: 'bg-indigo-500',
            action: onSavingsClick
        },
        {
            title: 'Metas',
            msg: '¡Haz realidad tus sueños!',
            icon: <Target size={20} className="text-white" />,
            color: 'bg-blue-500',
            action: onMissionsClick
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPage(prev => (prev + 1) % 4); // Cycle through 4 slides
        }, 6000);
        return () => clearInterval(interval);
    }, [page]);

    const current = slides[page];

    return (
        <div id="recurring-carousel" className="w-[92%] mx-auto mb-2">
            <div
                className="bg-white dark:bg-[#111] rounded-[24px] px-4 pt-3 pb-4 md:py-5 relative shadow-lg cursor-pointer active:scale-95 transition-transform border border-gray-100 dark:border-white/5"
            >
                {/* Click Zones */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-[40%] h-full" onClick={() => current.action()} />
                    <div className="w-[20%] h-full" onClick={() => setPage(prev => (prev + 1) % 4)} />
                    <div className="w-[40%] h-full" onClick={() => current.action()} />
                </div>

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
                                className={`h-1 rounded-full transition-all duration-300 ${page === i ? 'bg-gray-900 dark:bg-white w-4' : 'bg-gray-200 dark:bg-gray-700 w-1'}`}
                            />
                        ))}
                    </div>

                    <div className="p-1">
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

const Dashboard: React.FC<DashboardProps> = ({ transactions, onEditTransaction, isDarkMode, toggleTheme, rates, onProfileClick, onSubscriptionsClick, onFixedIncomeClick, onMissionsClick, onSavingsClick }) => {
    const [viewMode, setViewMode] = useState<'recent' | 'history'>('recent');
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [showAllRates, setShowAllRates] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<TransactionType | 'all'>('expense');
    const [showVES, setShowVES] = useState(false);

    // Set mounted flag after initial render
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    // Sort transactions globally for consistent display (Newest First)
    // Use createdAt for precise time-based ordering, fallback to date field
    const getTransactionTimestamp = (t: Transaction) => {
        // Priority 1: Use createdAt if available (includes time)
        if ((t as any).createdAt) {
            const ts = new Date((t as any).createdAt).getTime();
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

    // Logic: Savings (Expense) are subtracted from Income to show "Net Disposable Income".
    // They are NOT added to Total Expense.
    const totalIncome = currentMonthTransactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + t.amount;
        if (t.type === 'expense' && (t.category === 'Ahorro' || t.category === 'Savings')) return acc - t.amount;
        return acc;
    }, 0);

    const totalExpense = currentMonthTransactions.reduce((acc, t) => {
        if (t.type === 'expense' && t.category !== 'Ahorro' && t.category !== 'Savings') return acc + t.amount;
        return acc;
    }, 0);

    const balanceUSD = totalIncome - totalExpense;

    // Savings Balance Calculation (Total Accumulated)
    const totalSavingsBalance = sortedTransactions
        .filter(t => t.category === 'Ahorro' || t.category.toLowerCase().includes('ahorro'))
        .reduce((acc, curr) => acc + (curr.type === 'expense' ? curr.amount : -curr.amount), 0);

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
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const toggleMonthExpansion = (monthKey: string) => {
        setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
    };

    return (
        <>
            <div className="w-full max-w-2xl mx-auto h-full flex flex-col p-6 font-sans">

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
                        onClick={() => setViewMode('recent')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl ${viewMode === 'recent' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Resumen
                    </button>
                    <button
                        id="history-tab"
                        onClick={() => setViewMode('history')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl ${viewMode === 'history' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Historial
                    </button>
                </div>

                {viewMode === 'recent' ? (
                    <div className="flex-1 relative min-h-0">
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
                                            onClick={() => setShowVES(!showVES)}
                                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-95"
                                            aria-label="Cambiar moneda"
                                        >
                                            <ArrowLeftRight size={10} />
                                        </button>
                                    </div>

                                    <div className={`font-extrabold tracking-tighter w-full flex justify-center items-baseline gap-1 ${showVES ? ((balanceUSD * rates.bcv) > 99999 ? 'text-3xl md:text-5xl' : 'text-5xl md:text-6xl') : 'text-[4rem] leading-none md:text-7xl'} ${balanceUSD >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                        <span className="flex items-baseline">
                                            {!showVES && '$'}
                                            {(showVES ? balanceUSD * rates.bcv : balanceUSD).toLocaleString(showVES ? 'es-VE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        {showVES && <span className="text-2xl md:text-3xl font-bold">Bs</span>}
                                    </div>
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
                                            ${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                                            ${totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                                            ${totalSavingsBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </button>
                                </div>

                                <RecurringCTA
                                    onExpenseClick={onSubscriptionsClick}
                                    onIncomeClick={onFixedIncomeClick}
                                    onMissionsClick={onMissionsClick}
                                    onSavingsClick={onSavingsClick}
                                />
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
                                {sortedTransactions.length === 0 ? (
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
                ) : (
                    <div key="history-view" className="flex-1 relative min-h-0">
                        <div className="h-full overflow-y-auto pr-2 pb-36 scrollable-list">
                            <div className="sticky top-0 z-10 mb-6">
                                <div className="bg-[#F5F5F5] dark:bg-[#121212] pt-2 pb-2 relative z-20">
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Balance Mensual</h2>
                                </div>
                                <div className="h-6 w-full pointer-events-none bg-[#F5F5F5] dark:bg-[#121212]" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }} />
                            </div>

                            {monthlyData.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">No hay historial disponible.</div>
                            ) : (
                                <div className="space-y-4">
                                    {monthlyData.map(([monthKey, data]) => {
                                        const isExpanded = expandedMonth === monthKey;
                                        return (
                                            <div key={monthKey} className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all overflow-hidden group">

                                                {/* Header Card - Clickable to Expand */}
                                                <div
                                                    onClick={() => toggleMonthExpansion(monthKey)}
                                                    className="p-5 cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-[#333] pb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                                <Calendar size={18} />
                                                            </div>
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{formatMonth(monthKey).charAt(0).toUpperCase() + formatMonth(monthKey).slice(1)}</h3>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] font-mono text-gray-400">{data.transactions.length} Movimientos</div>
                                                            <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                                                <ChevronDown size={16} className="text-gray-400" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-1 md:gap-2 text-center">
                                                        <div>
                                                            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mb-1">Ingresos</div>
                                                            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs md:text-sm">
                                                                +${data.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mb-1">Gastos</div>
                                                            <div className="text-red-500 font-bold text-xs md:text-sm">
                                                                -${data.expense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-[#2C2C2C] rounded-lg py-1">
                                                            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Neto</div>
                                                            <div className={`font-bold text-xs md:text-sm ${data.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                                                ${data.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded List */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                            className="bg-gray-50/50 dark:bg-black/20 p-4 border-t border-gray-100 dark:border-[#333] overflow-hidden"
                                                        >
                                                            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollable-list">
                                                                {data.transactions.map((t) => (
                                                                    <div
                                                                        key={t.id}
                                                                        onClick={(e) => { e.stopPropagation(); onEditTransaction(t); }}
                                                                        className="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2C] border border-transparent dark:border-white/5 shadow-sm"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.category === 'Ahorro'
                                                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                                                : t.type === 'income'
                                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                                                    : 'bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-400'
                                                                                }`}>
                                                                                {getCategoryIcon(t.category)}
                                                                            </div>
                                                                            <div className="text-sm">
                                                                                <div className="font-semibold text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                                                <div className="text-[10px] text-gray-400">{formatDate(t.date)}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                                            </div>
                                                                            {t.originalAmount && t.originalCurrency === 'VES' && (
                                                                                <div className="text-[10px] text-gray-400 font-medium">
                                                                                    {t.originalAmount.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs
                                                                                    {t.rateType && <span className="ml-1 text-indigo-400 opacity-80 uppercase">• {getRateLabel(t.rateType)}</span>}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div >
                )}

            </div>

            {/* Transaction List Modal */}
            <TransactionListModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                transactions={sortedTransactions}
                type={modalType}
                title={modalType === 'income' ? 'Ingresos' : modalType === 'expense' ? 'Gastos' : 'Movimientos'}
                onEditTransaction={onEditTransaction}
            />
        </>
    );
};

export default Dashboard;