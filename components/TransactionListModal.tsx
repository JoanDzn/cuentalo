import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Transaction, TransactionType, RateData } from '../types';
import { X, ArrowUpRight, ArrowDownRight, Coffee, Home, Car, ShoppingCart, Zap, Briefcase, Gift, DollarSign, List, Filter, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, ArrowRightLeft } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

interface TransactionListModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    type: TransactionType | 'all';
    title: string;
    onEditTransaction?: (t: Transaction) => void;
    rates: RateData;
}

// Helper to get icon (same as Dashboard)
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

const getRateLabel = (rateType: string | null | undefined): string => {
    if (!rateType) return 'Dolar';
    const labels: Record<string, string> = {
        bcv: 'Dolar',
        euro: 'Euro',
        usdt: 'USDT'
    };
    return labels[rateType] || 'Dolar';
};

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669', '#047857', '#065F46'];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white p-2 rounded-lg text-xs shadow-lg border border-gray-700 animate-fade-in">
                <p className="font-bold">{label || payload[0].name}</p>
                <p>
                    {currency === 'USD' ? '$' : 'Bs'}
                    {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {payload[0].payload.percent && (
                    <p className="opacity-70">
                        {(payload[0].payload.percent * 100).toFixed(1)}%
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const TransactionListModal: React.FC<TransactionListModalProps> = ({ isOpen, onClose, transactions, type, title, onEditTransaction, rates }) => {
    const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year'>('month');
    const [chartCurrency, setChartCurrency] = useState<'USD' | 'VES'>('USD');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Reset filters when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(null);
            setTimeFrame('month');
        }
    }, [isOpen]);

    // Use createdAt for precise time-based ordering, fallback to date field
    const getTransactionTimestamp = (t: Transaction) => {
        if ((t as any).createdAt) {
            const ts = new Date((t as any).createdAt).getTime();
            if (!isNaN(ts)) return ts;
        }
        if (!t.date) return 0;
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) return d.getTime();
        const parts = t.date.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
        if (parts) return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1])).getTime();
        return 0;
    };

    // Filter Logic - Always run hook
    const filteredData = useMemo(() => {
        const now = new Date();
        const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const today = startOfDay(now);

        const filtered = transactions.filter(t => {
            // Type Filter
            if (type !== 'all' && t.type !== type) return false;

            // Time Filter
            const ts = getTransactionTimestamp(t);
            if (ts === 0) return false;
            const txDate = new Date(ts);
            const txDay = startOfDay(txDate);

            if (timeFrame === 'week') {
                // Last 7 days inclusive
                const oneWeekAgo = new Date(today);
                oneWeekAgo.setDate(today.getDate() - 6); // 6 days ago + today = 7 days
                return txDay >= oneWeekAgo && txDay <= today;
            } else if (timeFrame === 'month') {
                return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            } else if (timeFrame === 'year') {
                return txDate.getFullYear() === now.getFullYear();
            }
            return true;
        });

        return filtered.sort((a, b) => getTransactionTimestamp(b) - getTransactionTimestamp(a));
    }, [transactions, type, timeFrame]);


    // Chart Data Generation - Always run hook
    const chartData = useMemo(() => {
        let total = 0;

        if (type === 'expense') {
            // Group by DATE for Temperature/Trend Graph
            const groups: Record<string, number> = {};

            // Generate all days for the period for smooth graph? 
            // For now, let's just map the transactions.

            filteredData.forEach(t => {
                // Convert to Selected Currency
                let amount = t.amount;
                if (chartCurrency === 'VES') {
                    amount = t.amount * rates.bcv;
                }

                // Format Date Key (DD/MM)
                let dateKey = '';
                const ts = getTransactionTimestamp(t);
                if (ts) {
                    const d = new Date(ts);
                    dateKey = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                } else {
                    dateKey = '??';
                }

                groups[dateKey] = (groups[dateKey] || 0) + amount;
                total += amount;
            });

            const data = Object.entries(groups).map(([name, value]) => ({
                name,
                value,
            }));

            // Reverse to show Oldest -> Newest (Left to Right)
            return data.reverse();

        } else {
            // Group by CATEGORY for Income Donut
            const groups: Record<string, number> = {};
            filteredData.forEach(t => {
                const category = t.category || 'Otros';
                // Convert to Selected Currency
                let amount = t.amount;
                if (chartCurrency === 'VES') {
                    amount = t.amount * rates.bcv; // Using BCV rate for simplicity/consistency
                }

                groups[category] = (groups[category] || 0) + amount;
                total += amount;
            });

            const data = Object.entries(groups).map(([name, value], index) => ({
                name,
                value,
                percent: total > 0 ? value / total : 0,
                fill: COLORS[index % COLORS.length]
            }));

            // Sort by value descending
            return data.sort((a, b) => b.value - a.value);
        }

    }, [filteredData, chartCurrency, rates, type]);


    // Final List to Display - Always run hook
    const listToDisplay = useMemo(() => {
        if (!selectedCategory || type === 'expense') return filteredData; // No category filter on Line Chart for now
        return filteredData.filter(t => (t.category || 'Otros') === selectedCategory);
    }, [filteredData, selectedCategory, type]);

    // Return null AFTER hooks if not open
    if (!isOpen) return null;

    const totalChartValue = chartData.reduce((a, b) => a + b.value, 0);

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#333] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : type === 'expense'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                            }`}>
                            {type === 'income' ? <ArrowUpRight size={24} /> : type === 'expense' ? <ArrowDownRight size={24} /> : <List size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedCategory ? `Filtrado: ${selectedCategory}` : `${filteredData.length} movimientos`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto scrollable-list">

                    {/* Filters & Controls (Scrollable) */}
                    <div className="px-6 pt-4 pb-2 flex items-center justify-between gap-2 shrink-0 sticky top-0 bg-white dark:bg-[#1E1E1E] z-20">
                        {/* Time Segmented Control */}
                        <div className="bg-gray-100 dark:bg-[#2C2C2C] p-1 rounded-xl flex items-center">
                            {(['week', 'month', 'year'] as const).map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeFrame(tf)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFrame === tf
                                        ? 'bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {tf === 'week' ? 'Semana' : tf === 'month' ? 'Mes' : 'Año'}
                                </button>
                            ))}
                        </div>

                        {/* Currency Toggle */}
                        <button
                            onClick={() => setChartCurrency(prev => prev === 'USD' ? 'VES' : 'USD')}
                            className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#2C2C2C] px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 active:scale-95 transition-transform"
                        >
                            <ArrowRightLeft size={12} />
                            {chartCurrency}
                        </button>
                    </div>

                    {/* Chart Area (Scrollable) */}
                    {(type === 'expense' || type === 'income') && chartData.length > 0 && (
                        <div className="w-full h-auto px-2 mt-0 mb-4 flex flex-col items-center relative z-10">

                            {/* Total Summary - Conditional Layout */}
                            {type === 'expense' && (
                                <div className="text-center mb-2 mt-4">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total {timeFrame === 'week' ? 'Semana' : timeFrame === 'month' ? 'Mes' : 'Año'}</p>
                                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                        {chartCurrency === 'USD' ? '$' : 'Bs'}
                                        {totalChartValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            )}

                            <div className={`w-full relative ${type === 'expense' ? 'h-40 sm:h-48 mb-0' : 'h-56 sm:h-64 mb-[-10px]'}`}>
                                {/* Center Text for Donut (Income) */}
                                {type === 'income' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold opacity-80">Total</p>
                                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                            {chartCurrency === 'USD' ? '$' : 'Bs'}
                                            {totalChartValue.toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                )}

                                <ResponsiveContainer width="100%" height="100%" className="animate-fade-in">
                                    {type === 'expense' ? (
                                        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <Tooltip content={<CustomTooltip currency={chartCurrency} />} isAnimationActive={false} cursor={false} />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#EF4444"
                                                strokeWidth={3}
                                                dot={{ r: 4, strokeWidth: 0, fill: '#EF4444' }}
                                                activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }}
                                                animationBegin={0}
                                                animationDuration={800}
                                            />
                                        </LineChart>
                                    ) : (
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                                onClick={(data) => setSelectedCategory(selectedCategory === data.name ? null : data.name)}
                                                cursor="pointer"
                                                animationBegin={0}
                                                animationDuration={800}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        stroke="none"
                                                        opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip currency={chartCurrency} />} isAnimationActive={false} cursor={false} />
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Empty Chart State */}
                    {(type === 'expense' || type === 'income') && chartData.length === 0 && (
                        <div className="w-full h-40 flex flex-col items-center justify-center text-gray-400 opacity-50 shrink-0">
                            <BarChart3 size={32} className="mb-2" />
                            <p className="text-xs">Sin datos para graficar</p>
                        </div>
                    )}

                    {/* List Header */}
                    <div className="px-6 py-2 border-b border-gray-100 dark:border-[#333] bg-gray-50/50 dark:bg-[#1E1E1E] flex justify-between items-center sticky top-[60px] z-20 backdrop-blur-md">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Movimientos</span>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold"
                            >
                                <Filter size={8} /> Limpiar filtro
                            </button>
                        )}
                    </div>

                    {/* Transaction List */}
                    <div className="px-6 pb-8 pt-4">
                        {listToDisplay.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-[#2C2C2C] rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <DollarSign size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No hay movimientos.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {listToDisplay.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => onEditTransaction && onEditTransaction(t)}
                                        className={`bg-gray-50 dark:bg-[#252525] p-3 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 ${onEditTransaction ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.type === 'income'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-gray-100 dark:bg-[#2C2C2C] text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {React.cloneElement(getCategoryIcon(t.category), { size: 18 })}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">{t.description}</div>
                                                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                                        <span className="capitalize">{t.category}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {(() => {
                                                                try {
                                                                    if (!t.date) return '';
                                                                    // Handle ISO string
                                                                    if (t.date.includes('T')) {
                                                                        const date = new Date(t.date);
                                                                        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                                    }
                                                                    // Handle YYYY-MM-DD
                                                                    const parts = t.date.split('-');
                                                                    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                                                    return t.date;
                                                                } catch (e) {
                                                                    return t.date;
                                                                }
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-bold ${t.type === 'income'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                {t.originalAmount && t.originalCurrency === 'VES' && (
                                                    <div className="text-[10px] text-gray-400 font-medium">
                                                        {t.originalAmount.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs
                                                        {t.rateType && <span className="ml-1 text-indigo-400 opacity-80 uppercase">• {getRateLabel(t.rateType)}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TransactionListModal;
