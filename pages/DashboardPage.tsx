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
import { Transaction, ExpenseAnalysis, RateData, RecurringTransaction } from '../types';
import { getAllRates } from '../services/exchangeRateService';
import { authService, User } from '../services/authService';
import { dbService } from '../services/dbService';
import { OnboardingTour } from '../components/OnboardingTour';

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

  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [subscriptionModalTab, setSubscriptionModalTab] = useState<'expense' | 'income'>('expense');
  const [user, setUser] = useState<User | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('cuentalo_theme');
    return savedTheme === 'dark';
  });
  const [rates, setRates] = useState<RateData>(DEFAULT_RATES);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
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

  // Fetch user and setup auth listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/auth');
      } else {
        const userData = dbService.getUserData(currentUser.id);
        setTransactions(userData.transactions);
        setRecurringTransactions(userData.recurringTransactions || []);
        if (userData.settings?.theme) {
          setIsDarkMode(userData.settings.theme === 'dark');
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
      const currentMonthKey = today.toISOString().substring(0, 7); // YYYY-MM

      let newTransactions: Transaction[] = [];

      recurringTransactions.forEach(item => {
        if (item.day === currentDay) {
          // Check if already generated for this month?
          // A simple heuristic: check if any transaction today matches the description and amount
          // This is not perfect (what if I bought Netflix manually?), but good enough for MVP without complex tracking
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
              type: item.type
            });
          }
        }
      });

      if (newTransactions.length > 0) {
        setTransactions(prev => [...newTransactions, ...prev]);
        // Also notify logic or toast?
        console.log("Auto-generated transactions:", newTransactions);
      }
    }
  }, [recurringTransactions, user]); // Run when recurring items load. Note: 'transactions' dep removed to avoid loops, but we need initial transactions loaded.

  // Fetch All Rates
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

  // Persistence Effect for Transactions
  useEffect(() => {
    if (user) {
      dbService.updateUserTransactions(user.id, transactions);
    }
  }, [transactions, user]);

  // Theme Handling & Persistence
  useEffect(() => {
    if (user) {
      dbService.updateUserSettings(user.id, {
        theme: isDarkMode ? 'dark' : 'light',
      });
    }

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
    if (analysis.is_invalid) {
      console.warn("Invalid command detected, ignoring:", analysis);
      throw new Error("Comando no reconocido como transacción financiera");
    }

    let finalAmount = analysis.amount;
    let originalAmount = analysis.amount;
    let originalCurrency = analysis.currency;
    let rateType = analysis.rate_type || null;
    let rateValue: number | undefined;

    const { getRateValue } = await import('../services/exchangeRateService');

    // Logic for VES Transactions: ALWAYS use BCV rate
    if (analysis.currency === 'VES') {
      const bcvRate = await getRateValue('bcv');
      finalAmount = analysis.amount / bcvRate;
      rateValue = bcvRate;
      rateType = 'bcv'; // Force rate type to BCV for VES transactions
    }
    // Logic for USD Transactions with specific rate (Arbitrage)
    // "Me cobraron 10 dólares a tasa euro" -> Convert using Euro rate, then normalize to BCV USD
    else if (analysis.currency === 'USD' && rateType && rateType !== 'bcv') {
      const specialRate = await getRateValue(rateType);
      const vesValue = analysis.amount * specialRate;
      const bcvRate = await getRateValue('bcv');

      finalAmount = vesValue / bcvRate;
      rateValue = specialRate; // Store the special rate used

      console.log(`Arbitrage Transaction: ${analysis.amount} USD @ ${rateType} (${specialRate}) = ${vesValue} VES. Normalized to ${finalAmount} USD @ BCV (${bcvRate})`);
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: analysis.description,
      amount: finalAmount,
      category: analysis.category,
      date: analysis.date,
      type: analysis.type,
      originalAmount: originalCurrency === 'VES' ? originalAmount : (rateType && rateType !== 'bcv' ? originalAmount : undefined),
      originalCurrency: originalCurrency,
      rateType: rateType || undefined,
      rateValue: rateValue
    };
    setTransactions(prev => [newTransaction, ...prev]);

    if (user) {
      dbService.addUserTransaction(user.id, newTransaction);
    }
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    setIsEditing(false);
    setCurrentTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setIsEditing(false);
    setCurrentTransaction(null);
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
      originalCurrency: 'USD', // Default for savings
      originalAmount: t.amount,
      amount: t.amount, // Assumes USD for now
      description: t.description,
      category: t.category,
      type: t.type
    };
    setTransactions(prev => [newT, ...prev]);
    if (user) dbService.addUserTransaction(user.id, newT);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900">

      {/* Background from Landing Page */}


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 w-full h-full flex flex-col"
      >
        <AnimatePresence mode="wait">
          {showMissions ? (
            <motion.div
              key="missions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full bg-[#F5F5F5] dark:bg-[#121212]" // Keep background for readability of sub-pages? Or transparent?
            >
              {/* SavingsMissions has its own background? It probably needs opaque background to cover main one */}
              <div className="w-full h-full bg-[#F5F5F5]/90 dark:bg-[#121212]/90 backdrop-blur-md">
                <SavingsMissions onBack={() => setShowMissions(false)} transactions={transactions} />
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
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Interaction Layer */}
        <VoiceInput onExpenseAdded={handleNewTransaction} />

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
