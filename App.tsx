import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import VoiceInput from './components/VoiceInput';
import EditModal from './components/EditModal';
import { Transaction, ExpenseAnalysis } from './types';

// Tasa BCV por defecto (Fallback)
const DEFAULT_BCV_RATE = 315.00;

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
  const [bcvRate, setBcvRate] = useState<number>(DEFAULT_BCV_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);

  // Fetch BCV Rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const data = await response.json();
        if (data && data.promedio) {
          setBcvRate(data.promedio);
        }
      } catch (error) {
        console.error("Error fetching BCV rate:", error);
      } finally {
        setIsLoadingRate(false);
      }
    };
    fetchRate();
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
  const handleNewExpense = (analysis: ExpenseAnalysis) => {

    // Currency Conversion Logic
    let finalAmount = analysis.amount;
    let originalAmount = analysis.amount;
    let originalCurrency = analysis.currency;

    if (analysis.currency === 'VES') {
      finalAmount = analysis.amount / bcvRate;
      console.log(`Converting ${analysis.amount} VES to ${finalAmount} USD at rate ${bcvRate}`);
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: analysis.description,
      amount: finalAmount,
      category: analysis.category,
      date: analysis.date,
      type: analysis.type,
      originalAmount: originalCurrency === 'VES' ? originalAmount : undefined,
      originalCurrency: originalCurrency === 'VES' ? 'VES' : undefined
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
          bcvRate={bcvRate}
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