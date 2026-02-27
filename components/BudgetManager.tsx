import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, DollarSign, Target, PieChart as PieChartIcon, Edit2, Check, TrendingDown, ArrowRight, ArrowLeft, Briefcase, Laptop, TrendingUp, Home, ShoppingBag, List, ShoppingCart, Car, Heart, Book, Film, PiggyBank, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Transaction, RecurringTransaction, SavingsMission } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BudgetManagerProps {
  onBack: () => void;
  transactions: Transaction[];
  recurringItems: RecurringTransaction[];
  onUpdateRecurring: (items: RecurringTransaction[]) => void;
  missions: SavingsMission[];
  onUpdateMission: (m: SavingsMission) => void;
}

type WizardStep = 'dashboard' | 'edit';
type TabType = 'income' | 'savings' | 'expenses';

const getIcon = (iconName: string, size = 20) => {
  switch (iconName) {
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Laptop': return <Laptop size={size} />;
    case 'TrendingUp': return <TrendingUp size={size} />;
    case 'Home': return <Home size={size} />;
    case 'ShoppingBag': return <ShoppingBag size={size} />;
    case 'List': return <List size={size} />;
    case 'ShoppingCart': return <ShoppingCart size={size} />;
    case 'Car': return <Car size={size} />;
    case 'Heart': return <Heart size={size} />;
    case 'Book': return <Book size={size} />;
    case 'Film': return <Film size={size} />;
    default: return <List size={size} />;
  }
};

const DEFAULT_INCOME_CATS = [
  { id: '1', name: 'Salario', icon: 'Briefcase', color: 'emerald' },
  { id: '2', name: 'Freelance', icon: 'Laptop', color: 'blue' },
  { id: '3', name: 'Inversiones', icon: 'TrendingUp', color: 'purple' },
  { id: '4', name: 'Alquileres', icon: 'Home', color: 'orange' },
  { id: '5', name: 'Ventas', icon: 'ShoppingBag', color: 'pink' },
  { id: '6', name: 'Otros ingresos', icon: 'List', color: 'gray' },
];

const DEFAULT_EXPENSE_CATS = [
  { id: 'e1', name: 'Vivienda', icon: 'Home', color: 'blue' },
  { id: 'e2', name: 'Alimentos', icon: 'ShoppingCart', color: 'emerald' },
  { id: 'e3', name: 'Transporte', icon: 'Car', color: 'orange' },
  { id: 'e4', name: 'Salud', icon: 'Heart', color: 'red' },
  { id: 'e5', name: 'Educación', icon: 'Book', color: 'indigo' },
  { id: 'e6', name: 'Entretenimiento', icon: 'Film', color: 'pink' },
  { id: 'e7', name: 'Ropa', icon: 'ShoppingBag', color: 'purple' },
  { id: 'e8', name: 'Otros gastos', icon: 'List', color: 'gray' },
];

const BudgetManager: React.FC<BudgetManagerProps> = ({
  onBack,
  transactions,
  recurringItems,
  onUpdateRecurring,
}) => {
  const [step, setStep] = useState<WizardStep>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentPeriod = useMemo(() => `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`, [currentDate]);

  const effectiveItems = useMemo(() => {
    return recurringItems.filter(r => r.period === currentPeriod);
  }, [recurringItems, currentPeriod]);

  const hasSpecificBudgetForPeriod = useMemo(() => {
    return recurringItems.some(r => r.period === currentPeriod);
  }, [recurringItems, currentPeriod]);

  const [draftIncomes, setDraftIncomes] = useState<Record<string, number>>({});
  const [draftExpenses, setDraftExpenses] = useState<Record<string, number>>({});
  const [savingsTarget, setSavingsTarget] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<TabType>('income');

  useEffect(() => {
    const incObj: Record<string, number> = {};
    effectiveItems.filter(r => r.type === 'income').forEach(r => incObj[r.category || r.name] = r.amount);
    setDraftIncomes(incObj);

    const expObj: Record<string, number> = {};
    effectiveItems.filter(r => r.type === 'expense' && r.category !== 'Ahorro').forEach(r => expObj[r.category || r.name] = r.amount);
    setDraftExpenses(expObj);

    const initSavings = effectiveItems.find(r => r.type === 'expense' && r.category === 'Ahorro')?.amount || 0;
    setSavingsTarget(initSavings);
  }, [effectiveItems]);

  const totalIncome = Object.values(draftIncomes).reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = Object.values(draftExpenses).reduce((sum, amount) => sum + amount, 0);

  const handleSaveWizard = () => {
    const otherItems = recurringItems.filter(r => r.period !== currentPeriod);
    const newItems: RecurringTransaction[] = [];

    Object.entries(draftIncomes).forEach(([cat, amount]) => {
      if (amount > 0) newItems.push({ id: `inc-${Date.now()}-${cat}`, name: cat, category: cat, amount, type: 'income', day: 1, period: currentPeriod });
    });

    Object.entries(draftExpenses).forEach(([cat, amount]) => {
      if (amount > 0) newItems.push({ id: `exp-${Date.now()}-${cat}`, name: cat, category: cat, amount, type: 'expense', day: 1, period: currentPeriod });
    });

    if (savingsTarget > 0) {
      newItems.push({
        id: `ahorro-${Date.now()}`,
        name: 'Ahorro Mensual',
        category: 'Ahorro',
        amount: savingsTarget,
        type: 'expense',
        day: 1,
        period: currentPeriod
      });
    }

    onUpdateRecurring([...otherItems, ...newItems]);
    setStep('dashboard');
  };

  const handleClearBudget = () => {
    const otherItems = recurringItems.filter(r => r.period !== currentPeriod);
    onUpdateRecurring(otherItems);
    setDraftIncomes({});
    setDraftExpenses({});
    setSavingsTarget(0);
    setStep('dashboard');
  };

  const dashboardStats = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const thisMonthTx = transactions.filter(t => {
      const txDate = new Date(t.date || t.createdAt || '');
      return txDate >= monthStart && txDate <= monthEnd && t.type === 'expense';
    });

    const totalBudget = effectiveItems.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
    const currentIncomesTotal = effectiveItems.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
    const categories = effectiveItems.filter(r => r.type === 'expense' && r.category !== 'Ahorro').map(cat => {
      const spent = thisMonthTx.filter(t => t.category === cat.name || t.category === cat.category).reduce((acc, t) => acc + t.amount, 0);
      return {
        ...cat,
        spent,
        available: Math.max(0, cat.amount - spent),
        progress: cat.amount > 0 ? (spent / cat.amount) * 100 : 0
      };
    });

    const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
    const globalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return { totalBudget, totalSpent, globalProgress, categories, currentIncomesTotal };
  }, [currentDate, transactions, effectiveItems]);

  const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
  let monthLabel = monthFormatter.format(currentDate);
  monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1); // e.g. "Marzo 2026"

  const isEmpty = dashboardStats.totalBudget === 0 && dashboardStats.currentIncomesTotal === 0 && effectiveItems.length === 0;

  const copyPreviousMonth = () => {
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevPeriod = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevItems = recurringItems.filter(r => r.period === prevPeriod);

    if (prevItems.length > 0) {
      const cloned = prevItems.map(item => ({ ...item, id: `clnd-${Date.now()}-${Math.random()}`, period: currentPeriod }));
      const otherItems = recurringItems.filter(r => r.period !== currentPeriod);
      onUpdateRecurring([...otherItems, ...cloned]);
    }
  };

  const renderMonthBar = () => (
    <div className="w-full flex justify-between items-center bg-[#1E1E1E] rounded-full p-2 mb-8">
      <button
        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
        className="w-10 h-10 rounded-2xl bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[#333] transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="font-bold text-white text-base tracking-wide flex-1 text-center font-sans">
        {monthLabel}
      </span>
      <button
        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
        className="w-10 h-10 rounded-2xl bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[#333] transition-colors"
      >
        <ChevronLeft className="rotate-180" size={16} />
      </button>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-black font-sans overflow-hidden">

      {step === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="w-full p-6 pt-10 pb-4 flex justify-between items-center bg-black">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onBack()}
                className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white border border-white/5 hover:bg-[#333] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Presupuestos</h1>
            </div>

            {!isEmpty && (
              <button
                onClick={() => setStep('edit')}
                className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] hover:bg-[#ccff00]/20 transition-colors border border-[#ccff00]/30"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-24">
            {renderMonthBar()}

            {isEmpty ? (
              <div className="flex flex-col items-center justify-center mt-12 w-full">
                <div className="w-48 h-48 mb-8 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                    <PiggyBank size={120} strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-4 right-10 text-[#ccff00]">
                    <DollarSign size={40} className="drop-shadow-[0_0_10px_rgba(204,255,0,0.8)]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">Sin presupuestos</h2>
                <p className="text-gray-400 text-center mb-10 px-4 text-sm leading-relaxed">
                  Crea tu primer presupuesto para gestionar mejor tus finanzas
                </p>

                <button
                  onClick={() => setStep('edit')}
                  className="w-full py-4 bg-[#ccff00] text-black font-bold rounded-full mb-4 hover:bg-[#bdff00] active:scale-95 transition-all shadow-[0_4px_14px_0_rgba(204,255,0,0.39)]"
                >
                  Comenzar a planificar
                </button>

                <button
                  onClick={copyPreviousMonth}
                  className="w-full py-2 bg-transparent text-[#ccff00] font-medium text-sm active:opacity-70 transition-opacity"
                >
                  Copiar del mes anterior
                </button>
              </div>
            ) : (
              <div className="w-full flex-col flex">
                <div className="bg-[#111111] shadow-xl rounded-[32px] p-6 mb-8 flex flex-col items-center border border-white/5 relative">
                  <div className="w-48 h-48 relative mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ value: dashboardStats.totalSpent }, { value: Math.max(0, dashboardStats.totalBudget - dashboardStats.totalSpent) }]}
                          cx="50%" cy="50%"
                          innerRadius={70} outerRadius={90}
                          startAngle={90} endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#222" />
                          <Cell fill="#ccff00" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-black text-white">{dashboardStats.globalProgress.toFixed(0)}%</span>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">gastado</span>
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center border-t border-white/10 pt-6 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#ccff00]" />
                        <span className="text-xs text-gray-500 font-bold uppercase">Gastado</span>
                      </div>
                      <span className="font-bold text-white text-lg">${dashboardStats.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                        <span className="text-xs text-gray-500 font-bold uppercase">Restante</span>
                      </div>
                      <span className="font-bold text-white text-lg">${Math.max(0, dashboardStats.totalBudget - dashboardStats.totalSpent).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center mt-6 px-5 bg-black/50 py-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-medium text-gray-400">Presupuesto mensual</span>
                    <span className="font-bold text-white text-lg">${dashboardStats.totalBudget.toFixed(2)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Por categoría</h3>
                <div className="space-y-4">
                  {dashboardStats.categories.map((cat, i) => (
                    <div key={cat.id} className="bg-white dark:bg-[#2C2C2C] shadow-sm rounded-3xl overflow-hidden border border-gray-100 dark:border-[#333]">
                      <div className="p-5 flex justify-between items-center pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#1E1E1E] flex items-center justify-center border border-gray-100 dark:border-[#444]">
                            {getIcon(DEFAULT_EXPENSE_CATS.find(c => c.name === cat.name)?.icon || 'List', 18)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white mb-0.5">{cat.name}</span>
                            <span className="text-xs text-gray-500 font-medium">${cat.spent.toFixed(2)} de ${cat.amount.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#444] flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                          {Math.min(100, Math.floor(cat.progress))}%
                        </div>
                      </div>
                      <div className="px-5 pb-5 mt-1">
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden border border-gray-200 dark:border-[#444] shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${cat.progress >= 100 ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(100, cat.progress)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {step === 'edit' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col bg-black h-full overflow-hidden">
          <div className="w-full p-6 pb-4 flex justify-between items-center bg-black">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('dashboard')} className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white border border-white/5">
                <ChevronLeft size={20} />
              </button>
              <span className="text-white font-medium text-lg tracking-wide">Editar presupuesto</span>
            </div>
            {hasSpecificBudgetForPeriod && (
              <button onClick={handleClearBudget} className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="px-6 pb-6">
            <h1 className="text-3xl font-extrabold text-white mb-6 capitalize">{monthLabel}</h1>

            <div className="flex bg-[#121212] rounded-full p-1 border border-white/5 shadow-md">
              <button
                onClick={() => setActiveTab('income')}
                className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === 'income' ? 'bg-[#183625] text-emerald-400' : 'text-gray-500 hover:text-white'}`}
              >
                <ArrowDown size={14} className={activeTab === 'income' ? 'text-emerald-400' : ''} /> Ingresos
              </button>
              <button
                onClick={() => setActiveTab('savings')}
                className={`py-2.5 px-6 rounded-full flex items-center justify-center transition-all ${activeTab === 'savings' ? 'bg-[#112340] text-blue-400' : 'text-gray-500 hover:text-white'}`}
              >
                <PiggyBank size={18} className={activeTab === 'savings' ? 'text-blue-400' : ''} />
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === 'expenses' ? 'bg-[#3b1515] text-red-400' : 'text-gray-500 hover:text-white'}`}
              >
                <ArrowUp size={14} className={activeTab === 'expenses' ? 'text-red-400' : ''} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-32">
            {activeTab === 'income' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">Fuentes de ingreso</h3>
                  <button className="text-[#ccff00] text-sm font-medium">Gestionar</button>
                </div>

                {DEFAULT_INCOME_CATS.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 bg-[#111111] rounded-[24px] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#16271c] flex items-center justify-center text-emerald-500 border border-emerald-900/30">
                        {getIcon(cat.icon, 18)}
                      </div>
                      <span className="font-semibold text-white">{cat.name}</span>
                    </div>
                    <div className="flex items-center bg-black rounded-xl px-4 py-2 border border-white/5">
                      <span className="text-gray-400 mr-2">$</span>
                      <input
                        type="number"
                        value={draftIncomes[cat.name] || ''}
                        onChange={e => setDraftIncomes({ ...draftIncomes, [cat.name]: Number(e.target.value) })}
                        className="bg-transparent text-white font-bold w-20 outline-none text-right"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-6 py-4 border-t border-white/5">
                  <span className="text-gray-400 font-medium">Total de ingresos</span>
                  <span className="text-xl font-bold text-white">${totalIncome.toFixed(2)}</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'savings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">Metas de ahorro</h3>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#111111] rounded-[24px] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-[#112340] flex items-center justify-center text-blue-500 border border-blue-900/30">
                      <PiggyBank size={18} />
                    </div>
                    <span className="font-semibold text-white">Ahorro Mensual</span>
                  </div>
                  <div className="flex items-center bg-black rounded-xl px-4 py-2 border border-white/5">
                    <span className="text-gray-400 mr-2">$</span>
                    <input
                      type="number"
                      value={savingsTarget || ''}
                      onChange={e => setSavingsTarget(Number(e.target.value))}
                      className="bg-transparent text-white font-bold w-20 outline-none text-right"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="mt-6 flex bg-[#112340]/50 border border-[#112340] rounded-2xl p-4">
                  <p className="text-blue-300 text-sm">Este monto se reservará automáticamente de tus ingresos como una meta intocable a inicio de mes.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'expenses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">Límites de gastos</h3>
                  <button className="text-[#ccff00] text-sm font-medium">Gestionar</button>
                </div>

                {DEFAULT_EXPENSE_CATS.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 bg-[#111111] rounded-[24px] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#3b1515] flex items-center justify-center text-red-400 border border-red-900/30">
                        {getIcon(cat.icon, 18)}
                      </div>
                      <span className="font-semibold text-white">{cat.name}</span>
                    </div>
                    <div className="flex items-center bg-black rounded-xl px-4 py-2 border border-white/5">
                      <span className="text-gray-400 mr-2">$</span>
                      <input
                        type="number"
                        value={draftExpenses[cat.name] || ''}
                        onChange={e => setDraftExpenses({ ...draftExpenses, [cat.name]: Number(e.target.value) })}
                        className="bg-transparent text-white font-bold w-20 outline-none text-right"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-6 py-4 border-t border-white/5">
                  <span className="text-gray-400 font-medium">Total de gastos fijos</span>
                  <span className="text-xl font-bold text-white">${totalExpenses.toFixed(2)}</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="absolute bottom-6 left-0 right-0 px-6 z-20">
            <button onClick={handleSaveWizard} className="w-full py-4 bg-[#ccff00] hover:bg-[#bdff00] text-black rounded-full font-bold shadow-[0_4px_14px_0_rgba(204,255,0,0.39)] active:scale-[0.98] transition-all flex justify-center items-center">
              Guardar cambios
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BudgetManager;
