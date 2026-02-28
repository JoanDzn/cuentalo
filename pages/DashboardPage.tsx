import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '../components/Dashboard';
import VoiceInput from '../components/VoiceInput';
import EditModal from '../components/EditModal';
import ProfileDrawer from '../components/ProfileDrawer';
import BudgetManager from '../components/BudgetManager';
import SubscriptionsModal from '../components/SubscriptionsModal';
import SavingsModal from '../components/SavingsModal';
import { Transaction, ExpenseAnalysis, RateData, RecurringTransaction, SavingsMission } from '../types';
import { getAllRates } from '../services/exchangeRateService';
import { authService, User } from '../services/authService';
import { dbService } from '../services/dbService';
import { OnboardingTour } from '../components/OnboardingTour';
import { normalizeToUSD } from '../utils/financeUtils';
import CurrencyConverterModal from '../components/CurrencyConverterModal';
import { setCurrencyPreference, getCurrencyPreference } from '../hooks/useCurrencyPreference';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { BalanceSetupModal } from '../components/BalanceSetupModal';
import { Globe, DollarSign, Euro, Coins, X, TrendingUp } from 'lucide-react';

// Tasas por defecto (Fallback)
const DEFAULT_RATES: RateData = {
  bcv: 341.74,
  euro: 395.0,
  usdt: 500.0
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Cuentalo | Dashboard";
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [missions, setMissions] = useState<SavingsMission[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const [showRates, setShowRates] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [subscriptionModalTab, setSubscriptionModalTab] = useState<'expense' | 'income'>('expense');
  const [user, setUser] = useState<User | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('cuentalo_theme');
    return savedTheme === 'dark';
  });
  const [rates, setRates] = useState<RateData>(DEFAULT_RATES);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [showTour, setShowTour] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showBalanceSetup, setShowBalanceSetup] = useState(false);

  // Check Onboarding Status
  useEffect(() => {
    if (user) {
      const hasCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
      if (!hasCompleted) {
        // Small delay to let animations settle
        setTimeout(() => setShowTour(true), 1500);
      }
    }
  }, [user]);

  const handleTourComplete = () => {
    setShowTour(false);
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      // Show currency picker if user hasn't chosen yet
      const hasCurrency = getCurrencyPreference(user.id);
      // getCurrencyPreference defaults to 'USD', but we need to know if they explicitly set it.
      // We detect by checking if the key actually exists:
      const hasExplicitCurrency = localStorage.getItem(`cuentalo_currency_${user.id}`);
      if (!hasExplicitCurrency) {
        setTimeout(() => setShowCurrencyPicker(true), 400);
      }
    }
  };

  const handleCurrencyPickerSelect = (currency: 'USD' | 'VES') => {
    if (user) {
      setCurrencyPreference(currency, user.id);

      // After currency, ask for balance
      const hasBalanceSetup = localStorage.getItem(`balance_setup_completed_${user.id}`);
      if (!hasBalanceSetup) {
        setTimeout(() => setShowBalanceSetup(true), 400);
      }
    }
    setShowCurrencyPicker(false);
  };

  const handleBalanceSetupComplete = async (balances: { usd: number, ves: number }) => {
    if (!user) return;

    // Create initial balance transactions
    if (balances.usd > 0) {
      handleNewTransaction({
        amount: balances.usd,
        type: 'income',
        description: 'Saldo Inicial (USD)',
        category: 'Ingreso Inicial',
        currency: 'USD',
        rate_type: null,
        date: new Date().toISOString().split('T')[0],
        is_invalid: false,
      } as any);
    }

    if (balances.ves > 0) {
      handleNewTransaction({
        amount: balances.ves,
        type: 'income',
        description: 'Saldo Inicial (VES)',
        category: 'Ingreso Inicial',
        currency: 'VES',
        rate_type: 'bcv',
        date: new Date().toISOString().split('T')[0],
        is_invalid: false,
      } as any);
    }

    localStorage.setItem(`balance_setup_completed_${user.id}`, 'true');
    setShowBalanceSetup(false);
  };

  // Fetch user and data
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/auth');
      } else {
        try {
          // Refresh user profile (role check)
          if (!currentUser.role) {
            const freshUser = await authService.refreshUser();
            if (freshUser) setUser(freshUser);
          }

          // Load Fresh Data from API
          const userData = await dbService.getUserData(currentUser.id);
          setTransactions(userData.transactions);
          setRecurringTransactions(userData.recurringTransactions || []);
          setMissions(userData.savingsMissions || []);
          if (userData.settings && userData.settings.theme) {
            setIsDarkMode(userData.settings.theme === 'dark');
          }
        } catch (e) {
          console.error("Error loading user data:", e);
        } finally {
          setDataLoading(false);
        }
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Removed auto-generation logic as per user feedback - users want explicit control via voice or UI

  // --- Mission Logic Engine ---
  useEffect(() => {
    if (!user || transactions.length === 0 && missions.length === 0) return;

    // 1. Calculate Real Metrics
    const txCount = transactions.length;

    // Calculate Total Savings (Deposits - Withdrawals)
    const savingsTx = transactions.filter(t => t.category === 'Ahorro' || t.category.toLowerCase().includes('ahorro'));
    const totalSaved = savingsTx.reduce((acc, curr) => {
      return acc + (curr.type === 'expense' ? curr.amount : -curr.amount);
    }, 0);

    // Calculate Consistency (Number of separate savings deposits)
    const savingsCount = savingsTx.filter(t => t.type === 'expense').length;

    // 2. Define Target State (The 3 Missions)
    const targetMissions: SavingsMission[] = [
      {
        id: 'habit_10_tx', // Static ID for client-side matching. Backend will likely assign _id but we check title/id.
        title: 'Hábito de Registro',
        description: 'Registra 10 transacciones nuevas',
        icon: 'calendar',
        targetProgress: 10,
        currentProgress: txCount,
        status: txCount >= 10 ? 'completed' : 'active',
        tip: 'Registrar cada gasto te hace 20% más consciente de tus finanzas.',
        type: 'habit'
      },
      {
        id: 'emergency_fund_1000',
        title: 'Fondo de Emergencia',
        description: 'Ahorra $1,000 para imprevistos',
        icon: 'piggybank',
        targetProgress: 1000,
        currentProgress: Math.max(0, totalSaved),
        status: totalSaved >= 1000 ? 'completed' : 'active',
        tip: 'Un fondo de emergencia evita que te endeudes ante imprevistos.',
        type: 'amount'
      },
      {
        id: 'consistency_5',
        title: 'Constancia de Ahorro',
        description: 'Realiza 5 aportes a tus ahorros',
        icon: 'target',
        targetProgress: 5,
        currentProgress: savingsCount,
        status: savingsCount >= 5 ? 'completed' : 'active',
        tip: 'La constancia vence a la intensidad. Ahorra poco pero seguido.',
        type: 'days'
      }
    ];

    // 3. Diff and Update
    let hasChanges = false;
    const updatedMissions = [...missions];

    targetMissions.forEach(target => {
      const existingIndex = updatedMissions.findIndex(m => m.title === target.title);

      if (existingIndex !== -1) {
        const existing = updatedMissions[existingIndex];
        // ONLY update if there is a REAL change in progress or status
        if (
          existing.currentProgress !== target.currentProgress ||
          existing.status !== target.status
        ) {
          const updated = {
            ...existing,
            currentProgress: target.currentProgress,
            status: target.status,
            tip: target.tip
          };
          updatedMissions[existingIndex] = updated;
          hasChanges = true;
          // Sync to DB ONLY on change
          if (user) dbService.updateMission(user.id, updated).catch(console.error);
        }
      } else {
        // Add new
        updatedMissions.push(target);
        hasChanges = true;
        if (user) dbService.addMission(user.id, target).catch(console.error);
      }
    });

    if (hasChanges) {
      setMissions(updatedMissions);
    }

  }, [transactions, user, missions.length]); // Dependency on missions.length to trigger initial hydration, but careful with loops.

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const freshRates = await getAllRates();
        setRates(freshRates);
      } catch (error) {
        console.error("Error fetching rates:", error);
      } finally {
        setIsLoadingRate(false);
      }
    };
    fetchRates();
  }, []);

  // Theme Handling & Persistence
  useEffect(() => {
    if (user) {
      dbService.updateUserSettings(user.id, {
        theme: isDarkMode ? 'dark' : 'light',
      });
    }

    localStorage.setItem('cuentalo_theme', isDarkMode ? 'dark' : 'light');

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, user]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // CRUD Operations
  const handleNewTransaction = async (analysis: ExpenseAnalysis) => {
    const currentDate = new Date().toISOString().split('T')[0];
    if (analysis.is_invalid) {
      console.warn("Invalid command detected, ignoring:", analysis);
      throw new Error("Comando no reconocido como transacción financiera");
    }

    const { finalAmount: normalizedAmount, rateValue } = normalizeToUSD(
      analysis.amount,
      analysis.currency,
      analysis.rate_type || null,
      rates
    );

    let finalAmount = normalizedAmount;
    let originalAmount = analysis.amount;
    let originalCurrency = analysis.currency;
    let rateType = analysis.rate_type || null;

    // Sanity Check: Ensure amount is positive for Zod validation
    if (!finalAmount || finalAmount <= 0) {
      finalAmount = 0.01; // Minimum valid amount
    }

    // Ensure date is strictly YYYY-MM-DD
    let finalDate = (analysis.date || currentDate).split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(finalDate)) {
      finalDate = currentDate;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: (analysis.description || "Transacción").trim().substring(0, 100),
      amount: Number(finalAmount.toFixed(2)),
      category: analysis.category || "General",
      date: finalDate,
      type: analysis.type,
      originalAmount: originalCurrency === 'VES' ? originalAmount : (rateType && rateType !== 'bcv' ? originalAmount : undefined),
      originalCurrency: originalCurrency,
      rateType: rateType || undefined,
      rateValue: rateValue,
      createdAt: new Date().toISOString()
    };

    console.log("Saving Transaction:", newTransaction);

    // Optimistic Update: Add to state immediately
    setTransactions(prev => [newTransaction, ...prev]);

    // Persist to DB asynchronously WITHOUT awaiting (Background process)
    if (user) {
      dbService.addUserTransaction(user.id, newTransaction)
        .then(savedTx => {
          // Update the optimistic transaction with the real database ID
          setTransactions(prev => prev.map(t => t.id === newTransaction.id ? savedTx : t));
        })
        .catch(error => {
          console.error("Failed to save transaction in background:", error);
          // UX DECISION: We keep the optimistic transaction in the list so the user doesn't see it "disappear"
          // In a real production app, we would mark it as 'unsynced' and retry later.
          // alert("Problema de conexión. La transacción se guardó localmente y se sincronizará luego.");
        });
    }

    // Return immediately to let UI (VoiceInput) proceed to SUCCESS state
    return;
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    setIsEditing(false);
    setCurrentTransaction(null);

    if (user) {
      try {
        await dbService.updateUserTransaction(user.id, updated.id, updated);
      } catch (error) {
        console.error("Failed to update transaction remotely:", error);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setIsEditing(false);
    setCurrentTransaction(null);

    if (user) {
      try {
        await dbService.deleteUserTransaction(user.id, id);
      } catch (error) {
        console.error("Failed to delete transaction remotely:", error);
      }
    }
  };

  const handleUpdateMission = async (updatedMission: SavingsMission) => {
    setMissions(prev => {
      const exists = prev.find(m => m.id === updatedMission.id);
      if (exists) {
        return prev.map(m => m.id === updatedMission.id ? updatedMission : m);
      } else {
        return [...prev, updatedMission];
      }
    });

    if (user) {
      try {
        await dbService.updateMission(user.id, updatedMission);
      } catch (e) {
        try {
          await dbService.addMission(user.id, updatedMission);
        } catch (e2) {
          console.error("Failed to sync mission", e2);
        }
      }
    }
  };

  const openEditModal = (t: Transaction) => {
    setCurrentTransaction(t);
    setIsEditing(true);
  };

  const handleSavingsTransaction = (t: any) => {
    const newT: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      rateValue: undefined,
      rateType: undefined,
      originalCurrency: 'USD',
      originalAmount: t.amount,
      amount: t.amount,
      description: t.description,
      category: t.category,
      type: t.type,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newT, ...prev]);
    if (user) dbService.addUserTransaction(user.id, newT);
  };

  const handleMarkAsPaid = async (categoryName: string, amount: number) => {
    // If we mark as paid, we assume they paid the full budget or the remaining amount.
    // For now, let's add a transaction for the specified amount.
    await handleNewTransaction({
      amount: amount,
      type: 'expense',
      category: categoryName,
      description: `Pago de ${categoryName}`,
      currency: 'USD',
      rate_type: null,
      date: new Date().toISOString().split('T')[0],
      is_invalid: false,
    } as any);
  };

  const handleVoiceExpense = async (analysis: ExpenseAnalysis) => {
    const text = (analysis.description || "").toLowerCase();
    // Improved detection: if it's explicitly a payment word OR if there's no amount but we find a budget match
    const isExplicitPayment = text.includes('pagué') || text.includes('pague') || text.includes('pagado') || text.includes('pago');
    const hasNoAmount = !analysis.amount || analysis.amount <= 0;

    if (hasNoAmount || isExplicitPayment) {
      // Look for a matching budget item in recurring transactions (budget items)
      const searchTerms = [
        analysis.category?.toLowerCase(),
        analysis.description?.toLowerCase(),
        // Synonyms for common things
        (text.includes('internet') || text.includes('wifi') || text.includes('net') || text.includes('inter')) ? 'internet' : null,
        (text.includes('residencia') || text.includes('alquiler') || text.includes('vivienda') || text.includes('casa') || text.includes('arriendo')) ? 'vivienda' : null,
        (text.includes('luz') || text.includes('electricidad') || text.includes('corriente')) ? 'luz' : null,
        (text.includes('agua')) ? 'agua' : null,
        (text.includes('comida') || text.includes('mercado') || text.includes('super') || text.includes('viveres')) ? 'alimentos' : null,
      ].filter(Boolean) as string[];

      const budgetItem = recurringTransactions.find(r =>
        searchTerms.some(term => {
          const rName = r.name.toLowerCase();
          return rName.includes(term) || term.includes(rName);
        })
      );

      if (budgetItem) {
        // If we found a budget match, we fix the analysis
        analysis.amount = budgetItem.amount;
        analysis.type = 'expense';
        analysis.category = budgetItem.category || budgetItem.name;
        analysis.is_invalid = false;
        analysis.currency = 'USD'; // Budget items are stored as USD

        // Give it a better description if it was just a generic payment word
        if (isExplicitPayment || text.length < 15) {
          analysis.description = `Pago de ${budgetItem.name}`;
        }
      }
    }

    await handleNewTransaction(analysis);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 w-full h-full flex flex-col transition-colors duration-300"
      >
        <AnimatePresence>
          {showMissions ? (
            <motion.div
              key="missions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full bg-[#121212] z-20"
            >
              <div className="w-full h-full bg-[#121212]/90 backdrop-blur-md">
                <BudgetManager
                  onBack={() => setShowMissions(false)}
                  transactions={transactions}
                  recurringItems={recurringTransactions}
                  onUpdateRecurring={(items) => {
                    setRecurringTransactions(items);
                    if (user) dbService.updateUserRecurringTransactions(user.id, items);
                  }}
                  missions={missions}
                  onUpdateMission={handleUpdateMission}
                  onAddTransaction={handleMarkAsPaid}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full flex flex-col z-10"
            >
              <Dashboard
                transactions={transactions}
                onEditTransaction={openEditModal}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                rates={rates}
                onProfileClick={() => setShowProfile(true)}
                onSubscriptionsClick={() => { setSubscriptionModalTab('expense'); setShowSubscriptions(true); }}
                onFixedIncomeClick={() => { setSubscriptionModalTab('income'); setShowSubscriptions(true); }}
                onMissionsClick={() => setShowMissions(true)}
                onSavingsClick={() => setShowSavings(true)}
                onCalculatorClick={() => setShowCalculator(true)}
                onRatesClick={() => setShowRates(true)}
                loading={dataLoading}
                userId={user?.id}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CurrencyConverterModal
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
          onAddTransaction={(data) => {
            handleNewTransaction({
              amount: data.amount,
              type: data.type,
              description: data.description,
              category: 'General',
              currency: data.currency,
              rate_type: null,
              date: new Date().toISOString().split('T')[0],
              is_invalid: false,
            } as any);
          }}
        />

        {/* Voice Interaction Layer */}
        <AnimatePresence>
          {!showMissions && (
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 pointer-events-none"
            >
              <VoiceInput
                onExpenseAdded={handleVoiceExpense}
                onMissionsClick={() => setShowMissions(true)}
                onRequestEdit={(data) => {
                  setCurrentTransaction({
                    id: '',
                    amount: data.amount,
                    type: data.type,
                    category: data.category || 'Otros',
                    description: data.description || '',
                    date: data.date || new Date().toISOString(),
                    currency: data.currency || 'USD',
                    rate_type: data.rate_type
                  } as any);
                  setIsEditing(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <OnboardingTour
          isActive={showTour}
          onComplete={handleTourComplete}
          userName={user?.name?.split(' ')[0] || 'Amigo'}
        />

        {/* Currency Picker (shown after tour for new users) */}
        <AnimatePresence>
          {showCurrencyPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full sm:max-w-sm bg-[#111] border border-white/10 rounded-t-[36px] sm:rounded-[36px] px-6 pt-12 pb-16"
              >
                {/* Handle bar */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-7 sm:hidden" />

                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💱</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">¿Con qué moneda trabajas?</h2>
                  <p className="text-gray-500 text-sm">Puedes cambiarlo en cualquier momento desde tu perfil.</p>
                </div>

                {/* Side by side options */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCurrencyPickerSelect('USD')}
                    className="flex flex-col items-center gap-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 rounded-[24px] py-10 px-4 transition-all duration-200 group"
                  >
                    <span className="text-4xl font-black text-emerald-400 leading-none">$</span>
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">Dólar</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">USD</div>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Estable</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCurrencyPickerSelect('VES')}
                    className="flex flex-col items-center gap-3 bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400/40 rounded-[24px] py-10 px-4 transition-all duration-200 group"
                  >
                    <span className="text-3xl font-black text-yellow-400 leading-none">Bs</span>
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">Bolívar</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">VES</div>
                    </div>
                    <span className="text-[10px] text-yellow-400/80 bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">Sin fluctuación</span>
                  </motion.button>
                </div>

                <p className="text-center text-[11px] text-gray-600 mt-5 leading-relaxed">
                  Si tus ingresos son en bolívares y no quieres que tu balance cambie con la tasa, elige <span className="text-yellow-400">Bolívar</span>. Si trabajas con dólares, elige <span className="text-emerald-400">Dólar</span>.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <BalanceSetupModal
          isOpen={showBalanceSetup}
          onComplete={handleBalanceSetupComplete}
          currencyPreference={user ? getCurrencyPreference(user.id) : 'USD'}
        />


        {/* Modals & Drawers */}
        <EditModal
          isOpen={isEditing}
          transaction={currentTransaction}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
        />

        <ProfileDrawer
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          onLogout={handleLogout}
          onMissionsClick={() => setShowMissions(true)}
          onSubscriptionsClick={() => { setSubscriptionModalTab('expense'); setShowSubscriptions(true); }}
          onFixedIncomeClick={() => { setSubscriptionModalTab('income'); setShowSubscriptions(true); }}
          onRatesClick={() => setShowRates(true)}
          onSavingsClick={() => setShowSavings(true)}
          onCalculatorClick={() => setShowCalculator(true)}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onHelpClick={() => setShowTour(true)}
        />

        <SubscriptionsModal
          isOpen={showSubscriptions}
          onClose={() => setShowSubscriptions(false)}
          initialTab={subscriptionModalTab}
          recurringItems={recurringTransactions}
          onUpdate={(items) => {
            setRecurringTransactions(items);
            if (user) dbService.updateUserRecurringTransactions(user.id, items);
          }}
        />

        <SavingsModal
          isOpen={showSavings}
          onClose={() => setShowSavings(false)}
          transactions={transactions}
          onAddTransaction={handleSavingsTransaction}
        />

        <AnimatePresence>
          {showRates && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setShowRates(false)} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl w-full max-w-xs pointer-events-auto shadow-2xl border border-gray-100 dark:border-[#333]">
                  <h3 className="font-bold text-center mb-6 text-xl text-gray-900 dark:text-white">Tasas de Cambio</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#2C2C2C] rounded-xl">
                      <span className="font-bold text-gray-500">Dolar</span>
                      <span className="font-bold text-gray-900 dark:text-white">{rates.bcv.toFixed(2)} Bs</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#2C2C2C] rounded-xl">
                      <span className="font-bold text-gray-500">Euro</span>
                      <span className="font-bold text-gray-900 dark:text-white">{rates.euro.toFixed(2)} Bs</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#2C2C2C] rounded-xl">
                      <span className="font-bold text-gray-500">USDT</span>
                      <span className="font-bold text-gray-900 dark:text-white">{rates.usdt.toFixed(2)} Bs</span>
                    </div>
                  </div>
                  <button onClick={() => setShowRates(false)} className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">Cerrar</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
