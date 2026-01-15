import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import VoiceInput from './components/VoiceInput';
import EditModal from './components/EditModal';
import { Transaction, ExpenseAnalysis, RateData } from './types';
import { getAllRates } from './services/exchangeRateService';

// Tasas por defecto (Fallback)
const DEFAULT_RATES: RateData = {
  bcv: 341.74,
  euro: 395.0,
  usdt: 500.0
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Pago de Salario', category: 'Salario', date: '2026-01-14', amount: 2500, type: 'income' },
  { id: '2', description: 'Mercado Mensual', category: 'Comida', date: '2026-01-10', amount: 124.30, type: 'expense' },
  { id: '3', description: 'Taxi', category: 'Transporte', date: '2026-01-08', amount: 15.50, type: 'expense' },
];

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cuentalo_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('cuentalo_theme');
    return savedTheme === 'dark';
  });
  const [rates, setRates] = useState<RateData>(DEFAULT_RATES);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);

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
    localStorage.setItem('cuentalo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Theme Handling & Persistence
  useEffect(() => {
    localStorage.setItem('cuentalo_theme', isDarkMode ? 'dark' : 'light');

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // CRUD Operations
  const handleNewExpense = async (analysis: ExpenseAnalysis) => {
    if (analysis.is_invalid) {
      console.warn("Invalid command detected, ignoring:", analysis);
      // We throw an error so the VoiceInput component shows the error state
      throw new Error("Comando no reconocido como transacción financiera");
    }

    // Currency Conversion Logic
    let finalAmount = analysis.amount;
    let originalAmount = analysis.amount;
    let originalCurrency = analysis.currency;
    let rateType = analysis.rate_type || null;
    let rateValue: number | undefined;

    if (analysis.currency === 'VES') {
      // Import getRateValue dynamically to avoid circular dependencies
      const { getRateValue } = await import('./services/exchangeRateService');

      // Use specified rate type or default to BCV
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
    <div className="flex w-full h-screen bg-[#F5F5F5] dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 overflow-hidden transition-colors duration-500">

      {/* Main Content Area - Full Width */}
      <main className="flex-1 flex flex-col h-full relative">
        <Dashboard
          transactions={transactions}
          onEditTransaction={openEditModal}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          rates={rates}
        />
      </main>

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
    </div>
  );
}

export default App;