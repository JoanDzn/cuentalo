import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import VoiceInput from './components/VoiceInput';
import EditModal from './components/EditModal';
import { Transaction, ExpenseAnalysis } from './types';

// Tasa BCV actualizada (Ref: Enero 2026)
const BCV_RATE = 315.00;

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Pago de Salario', category: 'Salario', date: '2026-01-14', amount: 2500, type: 'income' },
  { id: '2', description: 'Mercado Mensual', category: 'Comida', date: '2026-01-10', amount: 124.30, type: 'expense' },
  { id: '3', description: 'Taxi', category: 'Transporte', date: '2026-01-08', amount: 15.50, type: 'expense' },
];

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme Handling
  useEffect(() => {
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
    
    if (analysis.currency === 'VES') {
      finalAmount = analysis.amount / BCV_RATE;
      console.log(`Converting ${analysis.amount} VES to ${finalAmount} USD at rate ${BCV_RATE}`);
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: analysis.description,
      amount: finalAmount,
      category: analysis.category,
      date: analysis.date,
      type: analysis.type,
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
    <div className="flex w-full h-screen bg-[#F5F5F5] dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 overflow-hidden transition-colors duration-300">
      
      {/* Main Content Area - Full Width */}
      <main className="flex-1 flex flex-col h-full relative">
        <Dashboard 
          transactions={transactions} 
          onEditTransaction={openEditModal}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
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