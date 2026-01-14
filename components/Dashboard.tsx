import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownRight, Coffee, Home, Car, ShoppingCart, Zap, Briefcase, Gift, DollarSign, Moon, Sun, Edit2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardProps {
    transactions: Transaction[];
    onEditTransaction: (t: Transaction) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    bcvRate: number;
}

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
    return <DollarSign size={18} />;
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, onEditTransaction, isDarkMode, toggleTheme, bcvRate }) => {
    const [viewMode, setViewMode] = useState<'recent' | 'history'>('recent');
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

    // Overall Balance Calculation
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balanceUSD = totalIncome - totalExpense;

    // Monthly Grouping Calculation
    const monthlyData = useMemo(() => {
        const groups: Record<string, { income: number; expense: number; balance: number; transactions: Transaction[] }> = {};

        transactions.forEach(t => {
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
                groups[monthKey].expense += t.amount;
            }
            groups[monthKey].balance = groups[monthKey].income - groups[monthKey].expense;
        });

        // Sort descending (newest months first)
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [transactions]);

    const formatMonth = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const toggleMonthExpansion = (monthKey: string) => {
        setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
    };

    return (
        <div className="w-full max-w-2xl mx-auto h-full flex flex-col p-6 transition-colors duration-500 font-sans">

            {/* Header - Centered Logo */}
            <div className="relative flex flex-col items-center justify-center mb-6 pt-4 animate-fade-in text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lowercase">cuentalo</h1>

                {/* Absolute positioned theme toggle to keep logo perfectly centered */}
                <div className="absolute top-4 right-0">
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-200 dark:bg-[#1E1E1E] p-1 rounded-2xl mb-8 self-center w-full max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <button
                    onClick={() => setViewMode('recent')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-500 ${viewMode === 'recent' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Resumen
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-500 ${viewMode === 'history' ? 'bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Historial
                </button>
            </div>

            {viewMode === 'recent' ? (
                <>
                    {/* Balance Card - Static USD */}
                    <div className="mb-10 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="inline-flex flex-col items-center select-none">
                            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                                Balance Total
                            </p>

                            <div className={`text-6xl font-extrabold tracking-tight mb-2 ${balanceUSD >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                ${balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Rate Display Moved Here */}
                        <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-2 mb-6">
                            Tasa BCV: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</span>
                        </div>

                        <div className="flex justify-center gap-4 mt-2">
                            <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-5 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] transition-all duration-500 hover:scale-105">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <ArrowUpRight size={16} />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Ingresos</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-5 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] transition-all duration-500 hover:scale-105">
                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                    <ArrowDownRight size={16} />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Gastos</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">${totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="flex-1 relative min-h-0">
                        <div className="h-full overflow-y-auto pr-2 pb-24 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <div className="sticky top-0 z-10">
                                <div className="bg-[#F5F5F5] dark:bg-[#121212] pt-2 pb-2 transition-colors duration-500 flex justify-between items-center relative z-20">
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Recientes</h2>
                                </div>
                                <div className="h-6 w-full pointer-events-none bg-[#F5F5F5] dark:bg-[#121212] transition-colors duration-500 ease-in-out" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }} />
                            </div>

                            {transactions.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-[#1E1E1E] rounded-full flex items-center justify-center text-gray-400 mb-4">
                                        <DollarSign size={24} />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">Sin movimientos.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => onEditTransaction(t)}
                                            className="group bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 cursor-pointer transition-all duration-500 flex items-center justify-between hover:translate-x-1"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${t.type === 'income'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-gray-50 dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {getCategoryIcon(t.category)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                    <div className="text-xs text-gray-400 capitalize">{t.category} • {t.date}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                {t.originalAmount && t.originalCurrency === 'VES' && (
                                                    <div className="text-[10px] text-gray-400 font-medium">
                                                        {t.originalAmount.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs
                                                    </div>
                                                )}
                                                <div className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs flex justify-end items-center gap-1 mt-1">
                                                    <Edit2 size={10} /> Editar
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-2 z-10 h-24 pointer-events-none bg-[#F5F5F5] dark:bg-[#121212] transition-colors duration-500 ease-in-out" style={{ maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />
                    </div>
                </>
            ) : (
                <div className="flex-1 relative min-h-0">
                    <div className="h-full overflow-y-auto pr-2 pb-24 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="sticky top-0 z-10 mb-6">
                            <div className="bg-[#F5F5F5] dark:bg-[#121212] pt-2 pb-2 transition-colors duration-500 relative z-20">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Balance Mensual</h2>
                            </div>
                            <div className="h-6 w-full pointer-events-none bg-[#F5F5F5] dark:bg-[#121212] transition-colors duration-500 ease-in-out" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }} />
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
                                                        <h3 className="font-bold text-gray-900 dark:text-white capitalize text-lg">{formatMonth(monthKey)}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-xs font-mono text-gray-400">{data.transactions.length} Movimientos</div>
                                                        <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <ChevronDown size={16} className="text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Ingresos</div>
                                                        <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                            +${data.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Gastos</div>
                                                        <div className="text-red-500 font-bold text-sm">
                                                            -${data.expense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-[#2C2C2C] rounded-lg py-1">
                                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Neto</div>
                                                        <div className={`font-bold text-sm ${data.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                                            ${data.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded List */}
                                            {isExpanded && (
                                                <div className="bg-gray-50/50 dark:bg-black/20 p-4 border-t border-gray-100 dark:border-[#333] animate-fade-in">
                                                    <div className="space-y-3">
                                                        {data.transactions.map((t) => (
                                                            <div
                                                                key={t.id}
                                                                onClick={(e) => { e.stopPropagation(); onEditTransaction(t); }}
                                                                className="bg-white dark:bg-[#252525] p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-all duration-500"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${t.type === 'income'
                                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                                        : 'bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-400'
                                                                        }`}>
                                                                        {getCategoryIcon(t.category)}
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        <div className="font-medium text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                                        <div className="text-[10px] text-gray-400">{t.date}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                                                                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                                    </div>
                                                                    {t.originalAmount && t.originalCurrency === 'VES' && (
                                                                        <div className="text-[10px] text-gray-400 font-medium">
                                                                            {t.originalAmount.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-2 z-10 h-24 pointer-events-none bg-[#F5F5F5] dark:bg-[#121212] transition-colors duration-500 ease-in-out" style={{ maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />
                </div >
            )}

        </div >
    );
};

export default Dashboard;