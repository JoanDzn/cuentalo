import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '../components/Dashboard';
import VoiceInput from '../components/VoiceInput';
import EditModal from '../components/EditModal';
import ProfileDrawer from '../components/ProfileDrawer';
import SavingsMissions from '../components/SavingsMissions';
import SubscriptionsModal from '../components/SubscriptionsModal';
import SavingsModal from '../components/SavingsModal';
import { Transaction, ExpenseAnalysis, RateData, RecurringTransaction, SavingsMission } from '../types';
import { getAllRates } from '../services/exchangeRateService';
import { authService, User } from '../services/authService';
import { dbService } from '../services/dbService';
import { OnboardingTour } from '../components/OnboardingTour';
import { normalizeToUSD } from '../utils/financeUtils';
import CurrencyConverterModal from '../components/CurrencyConverterModal';

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
    }
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

  // Check for due recurring transactions on load
  useEffect(() => {
    if (recurringTransactions.length > 0 && user) {
      const today = new Date();
      const currentDay = today.getDate();

      let newTransactions: Transaction[] = [];

      recurringTransactions.forEach(item => {
        if (item.day === currentDay) {
          const alreadyExists = transactions.some(t =>
            t.description === item.name &&
            Math.abs(t.amount - item.amount) < 0.01 &&
            t.date.startsWith(today.toISOString().split('T')[0])
          );

          if (!alreadyExists) {
            newTransactions.push({
              id: Date.now().toString() + Math.random().toString().substr(2, 5),
              description: item.name,
              amount: item.amount,
              category: item.type === 'expense' ? 'Suscripciones' : 'Salario',
              date: today.toISOString().split('T')[0], // YYYY-MM-DD
              type: item.type,
              createdAt: today.toISOString()
            });
          }
        }
      });

      if (newTransactions.length > 0) {
        setTransactions(prev => [...newTransactions, ...prev]);
        console.log("Auto-generated transactions:", newTransactions);
        // Persist generated transactions
        newTransactions.forEach(t => {
          if (user) dbService.addUserTransaction(user.id, t);
        });
      }
    }
  }, [recurringTransactions, user]); // Run when recurring items load.

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
          // Only rollback if absolutely necessary, but since it's optimistic, we keep it for UX 
          // unless user refreshes or we show an error toast
          setTransactions(prev => prev.filter(t => t.id !== newTransaction.id));
          alert("No se pudo sincronizar la transacción. Se eliminó de la lista.");
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

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 w-full h-full flex flex-col transition-colors duration-300"
      >
        <AnimatePresence mode="wait">
          {showMissions ? (
            <motion.div
              key="missions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full bg-[#F5F5F5] dark:bg-[#121212]"
            >
              <div className="w-full h-full bg-[#F5F5F5]/90 dark:bg-[#121212]/90 backdrop-blur-md">
                <SavingsMissions
                  onBack={() => setShowMissions(false)}
                  transactions={transactions}
                  missions={missions}
                  onUpdateMission={handleUpdateMission}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col h-full relative"
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
                loading={dataLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CurrencyConverterModal
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
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
                onExpenseAdded={handleNewTransaction}
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
