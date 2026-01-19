import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CreditCard, TrendingUp, Calendar, Check } from 'lucide-react';
import { RecurringTransaction, TransactionType } from '../types';

interface SubscriptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    recurringItems: RecurringTransaction[];
    onUpdate: (items: RecurringTransaction[]) => void;
    initialTab?: TransactionType;
}

const PREDEFINED_SERVICES = [
    { name: 'Netflix', defaultAmount: 15.99 },
    { name: 'Spotify', defaultAmount: 9.99 },
    { name: 'HBO Max', defaultAmount: 14.99 },
];

const PREDEFINED_INCOMES = [
    { name: 'Salario', defaultAmount: 1200 },
    { name: 'Intereses', defaultAmount: 50 },
    { name: 'Pagos', defaultAmount: 200 },
];

const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({ isOpen, onClose, recurringItems = [], onUpdate, initialTab = 'expense' }) => {
    const [activeTab, setActiveTab] = useState<TransactionType>(initialTab);
    const [isAdding, setIsAdding] = useState(false);

    // Reset tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setIsAdding(false);
        }
    }, [isOpen, initialTab]);

    // Form State
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDay, setNewDay] = useState<string>('1');

    const handlePredefinedClick = (service: { name: string; defaultAmount: number }) => {
        setNewName(service.name);
        setNewAmount(service.defaultAmount.toString());
        setIsAdding(true);
    };

    const handleAdd = () => {
        if (!newName || !newAmount || !newDay) return;

        const day = parseInt(newDay);
        if (day < 1 || day > 31) return;

        // Ensure we create a valid ID
        const newItem: RecurringTransaction = {
            id: Date.now().toString(),
            name: newName,
            amount: parseFloat(newAmount),
            day: day,
            type: activeTab
        };

        onUpdate([...recurringItems, newItem]);

        setNewName('');
        setNewAmount('');
        setNewDay('1');
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        onUpdate(recurringItems.filter(item => item.id !== id));
    };

    const filteredItems = recurringItems.filter(item => item.type === activeTab && item.category !== 'Ahorro');
    const totalAmount = filteredItems.reduce((acc, curr) => acc + curr.amount, 0);

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
                            {/* Header & Tabs */}
                            <div className="p-6 pb-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {activeTab === 'expense' ? <CreditCard className="text-indigo-500" /> : <TrendingUp className="text-emerald-500" />}
                                        {activeTab === 'expense' ? 'Gastos Fijos' : 'Ingresos Fijos'}
                                    </h2>
                                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="flex bg-gray-100 dark:bg-[#2C2C2C] p-1 rounded-xl mb-6">
                                    <button
                                        onClick={() => { setActiveTab('expense'); setIsAdding(false); }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'expense'
                                            ? 'bg-white dark:bg-[#1E1E1E] shadow-sm text-gray-900 dark:text-white'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                            }`}
                                    >
                                        Gastos
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('income'); setIsAdding(false); }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'income'
                                            ? 'bg-white dark:bg-[#1E1E1E] shadow-sm text-gray-900 dark:text-white'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                            }`}
                                    >
                                        Ingresos
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollable-list">
                                {activeTab === 'expense' && !isAdding && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Servicios Comunes</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {PREDEFINED_SERVICES.map(service => (
                                                <button
                                                    key={service.name}
                                                    onClick={() => handlePredefinedClick(service)}
                                                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl bg-gray-50 dark:bg-[#2C2C2C] border border-gray-100 dark:border-white/5 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <Plus size={16} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center">{service.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'income' && !isAdding && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ingresos Comunes</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {PREDEFINED_INCOMES.map(service => (
                                                <button
                                                    key={service.name}
                                                    onClick={() => handlePredefinedClick(service)}
                                                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl bg-gray-50 dark:bg-[#2C2C2C] border border-gray-100 dark:border-white/5 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                        <Plus size={16} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center">{service.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {filteredItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${item.type === 'expense'
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                    }`}>
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <Calendar size={10} />
                                                        Día {item.day} de cada mes
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {item.type === 'income' ? '+' : ''}${item.amount.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredItems.length === 0 && !isAdding && (
                                        <div className="text-center py-10 opacity-50">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No tienes {activeTab === 'expense' ? 'gastos' : 'ingresos'} fijos programados.</p>
                                        </div>
                                    )}

                                    {isAdding ? (
                                        <div className="p-4 bg-white dark:bg-[#1E1E1E] rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/30 animate-fade-in shadow-lg">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Ej. Alquiler"
                                                        className="w-full bg-gray-50 dark:bg-[#2C2C2C] rounded-lg px-3 py-2 text-sm font-semibold outline-none border border-transparent focus:border-indigo-500 text-gray-900 dark:text-white placeholder:text-gray-400 mt-1"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Monto ($)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-full bg-gray-50 dark:bg-[#2C2C2C] rounded-lg px-3 py-2 text-sm font-semibold outline-none border border-transparent focus:border-indigo-500 text-gray-900 dark:text-white mt-1"
                                                            value={newAmount}
                                                            onChange={(e) => setNewAmount(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-1/3">
                                                        <label className="text-xs font-bold text-gray-400 uppercase">Día (1-31)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="31"
                                                            className="w-full bg-gray-50 dark:bg-[#2C2C2C] rounded-lg px-3 py-2 text-sm font-semibold outline-none border border-transparent focus:border-indigo-500 text-gray-900 dark:text-white mt-1"
                                                            value={newDay}
                                                            onChange={(e) => setNewDay(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={handleAdd}
                                                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        onClick={() => setIsAdding(false)}
                                                        className="px-4 py-2 bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#444] transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setIsAdding(true); setNewName(''); setNewAmount(''); setNewDay('1'); }}
                                            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#333] text-gray-400 dark:text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2 font-semibold text-sm group"
                                        >
                                            <Plus size={18} className="group-hover:scale-110 transition-transform" />
                                            Agregar {activeTab === 'expense' ? 'Gasto' : 'Ingreso'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Footer Summary */}
                            <div className="p-6 pt-4 border-t border-gray-100 dark:border-[#333] bg-gray-50/50 dark:bg-[#1E1E1E]">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Mensual ({activeTab === 'expense' ? 'Gastos' : 'Ingresos'})</span>
                                    <span className={`text-xl font-extrabold ${activeTab === 'expense' ? 'text-gray-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        ${totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionsModal;
