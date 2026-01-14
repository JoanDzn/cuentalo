import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { X, Trash2, Save } from 'lucide-react';

interface EditModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
  onDelete: (id: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ transaction, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Transaction | null>(null);

  useEffect(() => {
    if (transaction) {
      setFormData({ ...transaction });
    }
  }, [transaction]);

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl shadow-2xl p-6 transition-all animate-fade-in">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Transacción</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Monto</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white rounded-xl px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Tipo</label>
             <div className="flex bg-gray-100 dark:bg-[#2C2C2C] p-1 rounded-xl">
                <button 
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-[#3D3D3D] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                >
                  Gasto
                </button>
                <button 
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'income' ? 'bg-white dark:bg-[#3D3D3D] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                >
                  Ingreso
                </button>
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Categoría</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
             </div>
             <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={() => onDelete(formData.id)}
            className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-medium hover:scale-[1.02] transition-transform"
          >
            <Save size={18} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;