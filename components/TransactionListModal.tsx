import React from 'react';
import { Transaction, TransactionType } from '../types';
import { X, ArrowUpRight, ArrowDownRight, Coffee, Home, Car, ShoppingCart, Zap, Briefcase, Gift, DollarSign, List } from 'lucide-react';

interface TransactionListModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    type: TransactionType | 'all';
    title: string;
    onEditTransaction?: (t: Transaction) => void;
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

const TransactionListModal: React.FC<TransactionListModalProps> = ({ isOpen, onClose, transactions, type, title, onEditTransaction }) => {
    if (!isOpen) return null;

    // Filter by type and sort by date (most recent first)
    const filteredTransactions = transactions
        .filter(t => type === 'all' || t.type === type)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#333]">
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">{filteredTransactions.length} movimientos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto p-6 scrollable-list">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                            <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-[#2C2C2C] rounded-full flex items-center justify-center text-gray-400 mb-4">
                                <DollarSign size={24} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">No hay movimientos de este tipo.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map((t) => (
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
                                                    <span>{t.date}</span>
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
        </div >
    );
};

export default TransactionListModal;
