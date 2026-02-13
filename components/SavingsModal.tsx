import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PiggyBank, Calendar, Coins, TrendingUp, ArrowDown, ArrowUp, Minus, Plus } from 'lucide-react';
import { Transaction } from '../types';

interface SavingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
};

const SavingsModal: React.FC<SavingsModalProps> = ({ isOpen, onClose, transactions, onAddTransaction }) => {
    const [transactionMode, setTransactionMode] = useState<'deposit' | 'withdraw' | null>(null);
    const [amount, setAmount] = useState('');

    // Filter only savings (case insensitive check just in case)
    const savingsTransactions = transactions.filter(t =>
        t.category === 'Ahorro' || t.category.toLowerCase().includes('ahorro')
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Net Savings: Expense (In) - Income (Out/Withdrawal)
    const totalSavings = savingsTransactions.reduce((acc, curr) => {
        return acc + (curr.type === 'expense' ? curr.amount : -curr.amount);
    }, 0);

    const handleTransaction = () => {
        if (!amount || parseFloat(amount) <= 0) return;

        const isDeposit = transactionMode === 'deposit';

        onAddTransaction({
            amount: parseFloat(amount),
            description: isDeposit ? 'Ahorro manual' : 'Retiro de ahorros',
            category: 'Ahorro',
            type: isDeposit ? 'expense' : 'income',
        });

        setTransactionMode(null);
        setAmount('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-[#333] pointer-events-auto flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-6 pb-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <PiggyBank className="text-indigo-500" />
                                        Mis Ahorros
                                    </h2>
                                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollable-list">

                                {/* Total Savings Card */}
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] p-6 text-white shadow-lg mb-8 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-indigo-100 font-medium text-sm uppercase tracking-wider">Total Ahorrado</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setTransactionMode('withdraw')}
                                                    className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/10"
                                                >
                                                    <Minus size={12} />
                                                    Retirar
                                                </button>
                                                <button
                                                    onClick={() => setTransactionMode('deposit')}
                                                    className="bg-white text-indigo-600 hover:bg-indigo-50 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transition-all flex items-center gap-1.5 border border-transparent"
                                                >
                                                    <Plus size={12} />
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-extrabold tracking-tight">
                                            ${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h3>
                                        <p className="text-indigo-200 text-xs mt-2">
                                            {savingsTransactions.length} movimientos registrados
                                        </p>
                                    </div>
                                    {/* Decor */}
                                    <Coins className="absolute -bottom-4 -right-4 text-white opacity-20 w-32 h-32 rotate-12" />
                                </div>

                                {/* Transaction Form Section (Deposit or Withdraw) */}
                                <AnimatePresence>
                                    {transactionMode && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-white dark:bg-[#252525] p-5 rounded-3xl border border-gray-100 dark:border-[#333] shadow-lg relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-4">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${transactionMode === 'deposit' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                        {transactionMode === 'deposit' ? 'Agregar Ahorros' : 'Retirar Fondos'}
                                                    </p>
                                                    <button
                                                        onClick={() => { setTransactionMode(null); setAmount(''); }}
                                                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#333] text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#444] transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                <div className="relative mb-4">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                                                    <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#444] rounded-2xl pl-8 pr-4 py-4 text-2xl font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-300"
                                                        autoFocus
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleTransaction}
                                                    disabled={!amount}
                                                    className={`w-full py-4 text-white rounded-2xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 ${transactionMode === 'deposit'
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                                                        : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                                        }`}
                                                >
                                                    {transactionMode === 'deposit' ? 'Confirmar Depósito' : 'Confirmar Retiro'}
                                                    {transactionMode === 'deposit' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Recent Savings List */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-gray-400" />
                                        Movimientos Recientes
                                    </h3>

                                    {savingsTransactions.length === 0 ? (
                                        <div className="text-center py-10 opacity-50 bg-gray-50 dark:bg-[#2C2C2C] rounded-[24px]">
                                            <PiggyBank size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Aún no tienes ahorros registrados.</p>
                                            <p className="text-xs text-gray-400 mt-1">Usa el micrófono y di "Guardé 10 dólares"</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {savingsTransactions.map((t) => (
                                                <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'expense'
                                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                            }`}>
                                                            {t.type === 'expense' ? <Coins size={20} /> : <Minus size={20} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white text-sm capitalize">{t.description || 'Ahorro'}</div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                                <Calendar size={10} />
                                                                {formatDate(t.date)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`font-bold ${t.type === 'expense' ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'}`}>
                                                        {t.type === 'expense' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SavingsModal;
