import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, DollarSign, Target, PieChart as PieChartIcon, Edit2, Check, X, TrendingDown, ArrowRight, ArrowLeft, Briefcase, Laptop, TrendingUp, Home, ShoppingBag, List, ShoppingCart, Car, Heart, Book, Film, PiggyBank, ArrowDown, ArrowUp, Trash2, Sparkles } from 'lucide-react';
import { Transaction, RecurringTransaction, SavingsMission } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BudgetManagerProps {
  onBack: () => void;
  transactions: Transaction[];
  recurringItems: RecurringTransaction[];
  onUpdateRecurring: (items: RecurringTransaction[]) => void;
  missions: SavingsMission[];
  onUpdateMission: (m: SavingsMission) => void;
  onAddTransaction?: (categoryName: string, amount: number) => void;
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
];

const DEFAULT_EXPENSE_CATS = [
  { id: 'e1', name: 'Vivienda', icon: 'Home', color: 'blue' },
  { id: 'e2', name: 'Alimentos', icon: 'ShoppingCart', color: 'emerald' },
  { id: 'e3', name: 'Transporte', icon: 'Car', color: 'orange' },
];

const BudgetManager: React.FC<BudgetManagerProps> = ({
  onBack,
  transactions,
  recurringItems,
  onUpdateRecurring,
  missions,
  onUpdateMission,
  onAddTransaction,
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
  const [savingsPercent, setSavingsPercent] = useState<number>(0);
  const [isPercentMode, setIsPercentMode] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [newIncomeName, setNewIncomeName] = useState('');
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [showExpenseInput, setShowExpenseInput] = useState(false);

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
    // Robust filtering based on period string (YYYY-MM)
    const thisMonthTx = transactions.filter(t => {
      const dateStr = t.date || (t.createdAt ? t.createdAt.split('T')[0] : '');
      return dateStr.startsWith(currentPeriod) && t.type === 'expense';
    });

    const carryOverBalance = transactions
      .filter(t => {
        const dateStr = t.date || (t.createdAt ? t.createdAt.split('T')[0] : '');
        return dateStr < currentPeriod;
      })
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

    const currentIncomesTotal = effectiveItems.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
    const totalBudget = Math.max(0, carryOverBalance + currentIncomesTotal);

    // Total spent this month (all expenses in this period)
    const totalSpent = thisMonthTx.reduce((acc, t) => acc + t.amount, 0);

    const categories = effectiveItems.filter(r => r.type === 'expense' && r.category !== 'Ahorro').map(cat => {
      // Find spent amount for this specific category
      const spentInCategory = thisMonthTx.filter(t =>
        (t.category === cat.name || t.category === cat.category)
      ).reduce((acc, t) => acc + t.amount, 0);

      return {
        ...cat,
        spent: spentInCategory,
        available: Math.max(0, cat.amount - spentInCategory),
        progress: cat.amount > 0 ? (spentInCategory / cat.amount) * 100 : 0
      };
    });

    const globalProgress = totalBudget > 0 ? (Math.max(0, totalBudget - totalSpent) / totalBudget) * 100 : 0;

    return { totalBudget, totalSpent, globalProgress, categories, currentIncomesTotal };
  }, [currentPeriod, transactions, effectiveItems]);

  const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
  let monthLabel = monthFormatter.format(currentDate);
  monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1); // e.g. "Marzo 2026"

  const isEmpty = effectiveItems.length === 0;

  const hasPreviousBudget = useMemo(() => {
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevPeriod = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    return recurringItems.some(r => r.period === prevPeriod);
  }, [recurringItems, currentDate]);

  const copyPreviousMonth = () => {
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevPeriod = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevItems = recurringItems.filter(r => r.period === prevPeriod);

    if (prevItems.length > 0) {
      // De-duplicate items by name+type to prevent "cloning" same expense multiple times
      const uniquePrevItems: Record<string, RecurringTransaction> = {};
      prevItems.forEach(item => {
        const key = `${item.type}-${item.name.toLowerCase()}`;
        if (!uniquePrevItems[key]) {
          uniquePrevItems[key] = item;
        }
      });

      const cloned = Object.values(uniquePrevItems).map(item => ({
        ...item,
        id: `clnd-${Date.now()}-${Math.random()}`,
        period: currentPeriod
      }));

      const otherItems = recurringItems.filter(r => r.period !== currentPeriod);
      onUpdateRecurring([...otherItems, ...cloned]);
    }
  };

  const renderMonthBar = () => (
    <div className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] rounded-2xl py-3 px-4 mb-8 border border-gray-100 dark:border-[#333] shadow-sm">
      <button
        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
        className="p-2 text-gray-600 dark:text-white hover:opacity-75 transition-opacity disabled:opacity-30"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="font-bold text-gray-900 dark:text-white text-base tracking-wide flex-1 text-center font-sans">
        {monthLabel}
      </span>
      <button
        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
        className="p-2 text-gray-600 dark:text-white hover:opacity-75 transition-opacity disabled:opacity-30"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col font-sans relative overflow-hidden">
      <div className="w-full max-w-2xl mx-auto h-full flex flex-col pt-4 relative bg-[#121212]">

        {step === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="w-full p-6 pb-4 flex justify-between items-center bg-[#121212]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onBack()}
                  className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white border border-[#333]/30 hover:bg-[#252525] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Presupuestos</h1>
              </div>

              {!isEmpty && (
                <button
                  onClick={() => { setStep('edit'); setActiveTab('income'); }}
                  className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/30"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24">
              {renderMonthBar()}

              {isEmpty ? (
                <div className="flex flex-col items-center justify-center mt-20 w-full">
                  <div className="w-56 h-56 mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-500/50 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                      <Target size={200} strokeWidth={0.8} />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2 text-center">Sin presupuestos</h2>
                  <p className="text-gray-400 text-center mb-10 px-4 text-sm leading-relaxed">
                    Crea tu primer presupuesto para gestionar mejor tus finanzas
                  </p>

                  <button
                    onClick={() => { setStep('edit'); setActiveTab('income'); }}
                    className="w-fit px-12 py-3 mx-auto bg-indigo-600 text-white font-bold rounded-full mb-4 hover:bg-indigo-700 active:scale-95 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]"
                  >
                    Comenzar a planificar
                  </button>

                  {hasPreviousBudget && (
                    <button
                      onClick={copyPreviousMonth}
                      className="w-full py-2 bg-transparent text-indigo-400 font-medium text-sm active:opacity-70 transition-opacity"
                    >
                      Copiar del mes anterior
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full flex-col flex">
                  <div className="bg-[#111111] rounded-[32px] p-6 mb-8 flex flex-col items-center border border-[#333]/30 relative">
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
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={800}
                          >
                            <Cell fill="#222" />
                            <Cell fill="#6366f1" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black text-white">{dashboardStats.globalProgress.toFixed(0)}%</span>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">restante</span>
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-center border-t border-white/10 pt-6 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
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

                    <div className="w-full flex justify-between items-center mt-6 px-5 bg-black/50 py-4 rounded-2xl border border-[#333]/30">
                      <span className="text-sm font-medium text-gray-400">Ingresos Totales (Presupuesto)</span>
                      <span className="font-bold text-white text-lg">${dashboardStats.totalBudget.toFixed(2)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-4 text-white">Por categoría</h3>
                  <div className="space-y-3">
                    {dashboardStats.categories.map((cat, i) => (
                      <div key={cat.id} className="bg-[#111111] rounded-[24px] overflow-hidden border border-[#333]/30">
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#1E1E1E] flex items-center justify-center text-gray-400 border border-[#333]/30">
                              {getIcon(DEFAULT_EXPENSE_CATS.find(c => c.name === cat.name)?.icon || 'List', 18)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white mb-0.5">{cat.name}</span>
                              <span className="text-xs text-gray-500 font-medium">${cat.amount.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {cat.progress < 100 && onAddTransaction && (
                              <button
                                onClick={() => onAddTransaction(cat.name, Math.max(0, cat.amount - cat.spent))}
                                className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-90"
                                title="Marcar como pagado"
                              >
                                <Check size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="px-4 pb-4">
                          <div className="w-full h-2 bg-[#1E1E1E] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-600"
                              style={{ width: `${Math.min(100, cat.progress)}%`, backgroundColor: cat.progress >= 100 ? '#10b981' : '#6366f1' }}
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
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col bg-[#121212] h-full overflow-hidden">
            <div className="w-full p-6 pb-4 flex justify-between items-center bg-[#121212]">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep('dashboard')} className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white border border-[#333]/30">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-white font-medium text-lg tracking-wide">Planificar presupuesto</span>
              </div>
            </div>

            <div className="px-6 pb-6">
              <h1 className="text-3xl font-extrabold text-white mb-2 capitalize">{monthLabel}</h1>
              <p className="text-gray-400 text-sm mb-6">Completa este cuestionario para organizar tus finanzas</p>

              <div className="flex bg-[#1E1E1E] rounded-full p-1 border border-neutral-800/40 shadow-md">
                <button
                  onClick={() => setActiveTab('income')}
                  className={`flex-1 py-2 rounded-full flex items-center justify-center gap-2 text-xs font-semibold transition-all ${activeTab === 'income' ? 'bg-[#252525] text-white' : 'text-gray-500'}`}
                >
                  1. Ingresos
                </button>
                <button
                  onClick={() => totalIncome > 0 && setActiveTab('savings')}
                  className={`flex-1 py-2 rounded-full flex items-center justify-center gap-2 text-xs font-semibold transition-all ${activeTab === 'savings' ? 'bg-[#252525] text-white' : 'text-gray-500'} ${totalIncome === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  2. Ahorros
                </button>
                <button
                  onClick={() => totalIncome > 0 && setActiveTab('expenses')}
                  className={`flex-1 py-2 rounded-full flex items-center justify-center gap-2 text-xs font-semibold transition-all ${activeTab === 'expenses' ? 'bg-[#252525] text-white' : 'text-gray-500'} ${totalIncome === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  3. Gastos
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32">
              {activeTab === 'income' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">¿Cuáles son tus ingresos?</h3>
                    <p className="text-gray-500 text-sm">Define cuánto dinero esperas recibir este mes</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Combine defaults with any custom from draftIncomes */}
                    {Array.from(new Set([...DEFAULT_INCOME_CATS.map(c => c.name), ...Object.keys(draftIncomes)])).map(catName => {
                      const cat = DEFAULT_INCOME_CATS.find(c => c.name === catName);
                      return (
                        <div key={catName} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-[24px] border border-neutral-800/40">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#252525] flex items-center justify-center text-indigo-400 border border-neutral-800/40">
                              {cat ? getIcon(cat.icon, 18) : <Plus size={18} />}
                            </div>
                            <span className="font-semibold text-white">{catName}</span>
                          </div>
                          <div className="flex items-center bg-[#121212] rounded-xl px-4 py-2 border border-neutral-800/40">
                            <span className="text-gray-500 mr-2">$</span>
                            <input
                              type="number"
                              value={draftIncomes[catName] || ''}
                              onChange={e => setDraftIncomes({ ...draftIncomes, [catName]: Number(e.target.value) })}
                              className="bg-transparent text-white font-bold w-20 outline-none text-right"
                              placeholder="0.00"
                            />
                            {/* Option to remove custom ones */}
                            {!DEFAULT_INCOME_CATS.find(c => c.name === catName) && (
                              <button
                                onClick={() => {
                                  const newIncomes = { ...draftIncomes };
                                  delete newIncomes[catName];
                                  setDraftIncomes(newIncomes);
                                }}
                                className="ml-2 text-red-400/50 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {showIncomeInput ? (
                      <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-[24px] border border-indigo-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex-1 mr-3">
                          <input
                            autoFocus
                            type="text"
                            value={newIncomeName}
                            onChange={e => setNewIncomeName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && newIncomeName) {
                                setDraftIncomes({ ...draftIncomes, [newIncomeName]: 0 });
                                setNewIncomeName('');
                                setShowIncomeInput(false);
                              } else if (e.key === 'Escape') {
                                setShowIncomeInput(false);
                              }
                            }}
                            placeholder="Nombre de la categoría..."
                            className="bg-transparent text-white font-bold w-full outline-none placeholder:text-gray-600"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (newIncomeName) setDraftIncomes({ ...draftIncomes, [newIncomeName]: 0 });
                              setNewIncomeName('');
                              setShowIncomeInput(false);
                            }}
                            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setNewIncomeName('');
                              setShowIncomeInput(false);
                            }}
                            className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-gray-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowIncomeInput(true)}
                        className="flex items-center justify-center gap-2 p-4 bg-indigo-500/10 border border-dashed border-indigo-500/30 rounded-[24px] text-indigo-400 font-bold hover:bg-indigo-500/20 transition-all text-sm mb-4"
                      >
                        <Plus size={18} /> Agregar otra fuente de ingreso
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => totalIncome > 0 && setActiveTab('savings')}
                    disabled={totalIncome === 0}
                    className={`mt-4 w-full py-4 text-white font-bold rounded-full transition-all flex justify-center items-center gap-2 ${totalIncome > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
                  >
                    {totalIncome > 0 ? 'Siguiente: Ahorros' : 'Define tus ingresos para continuar'} <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {activeTab === 'savings' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">¿Cuánto quieres ahorrar?</h3>
                    <p className="text-gray-500 text-sm">Define tu meta de ahorro mensual intocable</p>
                  </div>

                  <div className="flex flex-col gap-3 p-4 bg-[#1E1E1E] rounded-[24px] border border-neutral-800/40">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 relative group/icon">
                          <div className="absolute inset-0 bg-indigo-400/20 rounded-[12px] blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                          <Target size={20} className="relative" />
                        </div>
                        <span className="font-semibold text-white">Meta de Ahorro</span>
                      </div>
                      <div className="flex bg-[#121212] rounded-full p-1 border border-neutral-800/40">
                        <button
                          onClick={() => setIsPercentMode(false)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${!isPercentMode ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
                        >
                          $
                        </button>
                        <button
                          onClick={() => setIsPercentMode(true)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${isPercentMode ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
                        >
                          %
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 font-medium">
                        {isPercentMode
                          ? `Calculado: $${((savingsPercent / 100) * totalIncome).toFixed(2)}`
                          : (totalIncome > 0
                            ? `${((savingsTarget / totalIncome) * 100).toFixed(1)}% de tus ingresos`
                            : '0% de tus ingresos')}
                      </div>
                      <div className="flex items-center bg-[#121212] rounded-xl px-4 py-2 border border-neutral-800/40">
                        <span className="text-gray-500 mr-2">{isPercentMode ? '%' : '$'}</span>
                        <input
                          type="number"
                          value={isPercentMode ? (savingsPercent || '') : (savingsTarget || '')}
                          onChange={e => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            const safeIncome = totalIncome || 0;

                            if (isPercentMode) {
                              const cappedPercent = Math.min(100, val);
                              setSavingsPercent(cappedPercent);
                              setSavingsTarget(safeIncome > 0 ? Number(((cappedPercent / 100) * safeIncome).toFixed(2)) : 0);
                            } else {
                              const cappedTarget = safeIncome > 0 ? Math.min(safeIncome, val) : val;
                              setSavingsTarget(cappedTarget);
                              setSavingsPercent(safeIncome > 0 ? Number(((cappedTarget / safeIncome) * 100).toFixed(1)) : 0);
                            }
                          }}
                          className="bg-transparent text-white font-bold w-20 outline-none text-right"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <p className="text-indigo-300 text-xs leading-relaxed">
                      💡 {isPercentMode
                        ? (savingsPercent > 0
                          ? `Ahorrar el ${savingsPercent}% es una excelente meta para construir tu futuro.`
                          : `Define qué porcentaje de tus ingresos deseas destinar al ahorro intocable.`)
                        : (savingsTarget > 0
                          ? `Reservar $${savingsTarget} te ayudará a estar preparado para cualquier imprevisto.`
                          : `Este monto se reservará automáticamente de tus ingresos libres.`)}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setActiveTab('income')}
                      className="flex-1 py-4 bg-[#1E1E1E] text-white font-bold rounded-full border border-neutral-800/40 hover:bg-[#252525] transition-all"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => setActiveTab('expenses')}
                      className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all"
                    >
                      Siguiente: Gastos
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'expenses' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">¿Cuáles son tus gastos?</h3>
                    <p className="text-gray-500 text-sm">Establece límites para tus categorías de gastos fijos</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Combine defaults with any custom from draftExpenses */}
                    {Array.from(new Set([...DEFAULT_EXPENSE_CATS.map(c => c.name), ...Object.keys(draftExpenses)])).map(catName => {
                      const cat = DEFAULT_EXPENSE_CATS.find(c => c.name === catName);
                      return (
                        <div key={catName} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-[24px] border border-neutral-800/40">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#252525] flex items-center justify-center text-indigo-400 border border-neutral-800/40">
                              {cat ? getIcon(cat.icon, 18) : <Plus size={18} />}
                            </div>
                            <span className="font-semibold text-white">{catName}</span>
                          </div>
                          <div className="flex items-center bg-[#121212] rounded-xl px-4 py-2 border border-neutral-800/40">
                            <span className="text-gray-500 mr-2">$</span>
                            <input
                              type="number"
                              value={draftExpenses[catName] || ''}
                              onChange={e => setDraftExpenses({ ...draftExpenses, [catName]: Number(e.target.value) })}
                              className="bg-transparent text-white font-bold w-20 outline-none text-right"
                              placeholder="0.00"
                            />
                            {/* Option to remove custom ones */}
                            {!DEFAULT_EXPENSE_CATS.find(c => c.name === catName) && (
                              <button
                                onClick={() => {
                                  const newExpenses = { ...draftExpenses };
                                  delete newExpenses[catName];
                                  setDraftExpenses(newExpenses);
                                }}
                                className="ml-2 text-red-400/50 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {showExpenseInput ? (
                      <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-[24px] border border-indigo-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex-1 mr-3">
                          <input
                            autoFocus
                            type="text"
                            value={newExpenseName}
                            onChange={e => setNewExpenseName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && newExpenseName) {
                                setDraftExpenses({ ...draftExpenses, [newExpenseName]: 0 });
                                setNewExpenseName('');
                                setShowExpenseInput(false);
                              } else if (e.key === 'Escape') {
                                setShowExpenseInput(false);
                              }
                            }}
                            placeholder="Nombre del gasto..."
                            className="bg-transparent text-white font-bold w-full outline-none placeholder:text-gray-600"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (newExpenseName) setDraftExpenses({ ...draftExpenses, [newExpenseName]: 0 });
                              setNewExpenseName('');
                              setShowExpenseInput(false);
                            }}
                            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setNewExpenseName('');
                              setShowExpenseInput(false);
                            }}
                            className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-gray-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowExpenseInput(true)}
                        className="flex items-center justify-center gap-2 p-4 bg-indigo-500/10 border border-dashed border-indigo-500/30 rounded-[24px] text-indigo-400 font-bold hover:bg-indigo-500/20 transition-all text-sm mb-4"
                      >
                        <Plus size={18} /> Agregar otro gasto
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="absolute bottom-6 left-0 right-0 px-6 z-20 flex gap-3">
              {activeTab === 'expenses' && (
                <>
                  <button
                    onClick={() => setActiveTab('savings')}
                    className="flex-1 py-4 bg-[#1A1A1A] text-white font-bold rounded-full border border-neutral-800/40 hover:bg-[#252525] transition-all"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleSaveWizard}
                    disabled={totalIncome === 0 || totalExpenses === 0}
                    className={`flex-[2] py-4 text-white font-bold rounded-full shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] active:scale-[0.98] transition-all flex justify-center items-center gap-2 ${totalIncome > 0 && totalExpenses > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}
                  >
                    {totalExpenses > 0 ? 'Finalizar Presupuesto' : 'Define tus gastos para finalizar'} <Check size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
