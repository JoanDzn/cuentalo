import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '../components/Dashboard';
import VoiceInput from '../components/VoiceInput';
import EditModal from '../components/EditModal';
import ProfileDrawer from '../components/ProfileDrawer';
import SavingsMissions from '../components/SavingsMissions';
import { Transaction, ExpenseAnalysis, RateData } from '../types';
import { getAllRates } from '../services/exchangeRateService';
import { authService, User } from '../services/authService';
import { dbService } from '../services/dbService';

// Tasas por defecto (Fallback)
const DEFAULT_RATES: RateData = {
  bcv: 341.74,
  euro: 395.0,
  usdt: 500.0
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('cuentalo_theme');
    return savedTheme === 'dark';
  });
  const [rates, setRates] = useState<RateData>(DEFAULT_RATES);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);

  // Fetch user and setup auth listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/auth');
      } else {
        // Load user-specific transactions when user is set
        const userData = dbService.getUserData(currentUser.id);
        setTransactions(userData.transactions);

        // Load user theme preference
        if (userData.settings?.theme) {
          setIsDarkMode(userData.settings.theme === 'dark');
        }
      }
    });
    return unsubscribe;
  }, [navigate]);

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
  const handleNewExpense = async (analysis: ExpenseAnalysis) => {
    if (analysis.is_invalid) {
      console.warn("Invalid command detected, ignoring:", analysis);
      throw new Error("Comando no reconocido como transacción financiera");
    }

    let finalAmount = analysis.amount;
    let originalAmount = analysis.amount;
    let originalCurrency = analysis.currency;
    let rateType = analysis.rate_type || null;
    let rateValue: number | undefined;

    if (analysis.currency === 'VES') {
      const { getRateValue } = await import('../services/exchangeRateService');
      const effectiveRateType = analysis.rate_type || 'bcv';
      rateValue = await getRateValue(effectiveRateType);
      finalAmount = analysis.amount / rateValue;
      console.log(`Converting ${analysis.amount} VES to ${finalAmount} USD at ${effectiveRateType} rate ${rateValue}`);
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: analysis.description,
      amount: finalAmount,
      category: analysis.category,
      date: analysis.date,
      type: analysis.type,
      originalAmount: originalCurrency === 'VES' ? originalAmount : undefined,
      originalCurrency: originalCurrency === 'VES' ? 'VES' : undefined,
      rateType: originalCurrency === 'VES' ? rateType : undefined,
      rateValue: originalCurrency === 'VES' ? rateValue : undefined
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Also save to database if user is logged in
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full h-screen bg-[#F5F5F5] dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 overflow-hidden transition-colors duration-500"
    >
      <AnimatePresence mode="wait">
        {showMissions ? (
          <motion.div
            key="missions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full"
          >
            <SavingsMissions onBack={() => setShowMissions(false)} />
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
              onMissionsClick={() => setShowMissions(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Interaction Layer */}
      <VoiceInput onExpenseAdded={handleNewExpense} />

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditing}
        transaction={currentTransaction}
        onClose={() => setIsEditing(false)}
        onSave={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onLogout={handleLogout}
      />
    </motion.div>
  );
};

export default DashboardPage;
