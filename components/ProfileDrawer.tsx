import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, LogOut, UserCircle, Target, CreditCard, ChevronRight, TrendingUp, Edit2, Save, Globe } from 'lucide-react';
import { User as UserType, authService } from '../services/authService';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onLogout: () => void;
  onMissionsClick: () => void;
  onSubscriptionsClick: () => void;
  onFixedIncomeClick: () => void;
  onRatesClick: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, user, onLogout, onMissionsClick, onSubscriptionsClick, onFixedIncomeClick, onRatesClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhoto(user.photoURL || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await authService.updateUserProfile({ name: editName, photoURL: editPhoto });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#1E1E1E] shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#333]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {user ? (
                  <div className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center text-center mb-8 relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg overflow-hidden ring-4 ring-gray-50 dark:ring-[#2C2C2C]">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle size={48} className="text-white" />
                        )}
                      </div>

                      <div className="animate-fade-in">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {user.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-[#333]">
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider px-2">Menú</h4>

                      <button
                        onClick={() => { onClose(); onMissionsClick(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-[#252525] border border-gray-100 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#333] transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Target size={20} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-gray-900 dark:text-white">Objetivos</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Metas de ahorro financiero</div>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600">
                          <ChevronRight size={18} />
                        </div>
                      </button>

                      <button
                        onClick={() => { onClose(); onSubscriptionsClick(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-[#252525] border border-gray-100 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#333] transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CreditCard size={20} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-gray-900 dark:text-white">Gastos Fijos</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Suscripciones y pagos recurrentes</div>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600">
                          <ChevronRight size={18} />
                        </div>
                      </button>

                      <button
                        onClick={() => { onClose(); onFixedIncomeClick(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-[#252525] border border-gray-100 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#333] transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp size={20} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-gray-900 dark:text-white">Ingresos Fijos</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Salarios y rentas mensuales</div>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600">
                          <ChevronRight size={18} />
                        </div>
                      </button>

                      <button
                        onClick={() => { onClose(); onRatesClick(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-[#252525] border border-gray-100 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#333] transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe size={20} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-gray-900 dark:text-white">Tasas de Cambio</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">BCV, Euro, USDT</div>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600">
                          <ChevronRight size={18} />
                        </div>
                      </button>

                      {/* Edit Profile Toggle */}
                      <div className="overflow-hidden rounded-[20px] bg-white dark:bg-[#252525] border border-gray-100 dark:border-[#333] transition-all">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#333] transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={20} />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-bold text-gray-900 dark:text-white">Editar Perfil</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Nombre y Foto</div>
                          </div>
                          <div className={`text-gray-300 dark:text-gray-600 transition-transform ${isEditing ? 'rotate-90' : ''}`}>
                            <ChevronRight size={18} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isEditing && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4"
                            >
                              <div className="space-y-3 pt-2">
                                <input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white rounded-xl px-4 py-3 border border-gray-200 dark:border-[#333] text-sm focus:outline-none"
                                  placeholder="Nombre"
                                />
                                <input
                                  value={editPhoto}
                                  onChange={(e) => setEditPhoto(e.target.value)}
                                  className="w-full bg-gray-50 dark:bg-[#2C2C2C] text-gray-900 dark:text-white rounded-xl px-4 py-3 border border-gray-200 dark:border-[#333] text-xs font-mono focus:outline-none"
                                  placeholder="URL Foto"
                                />
                                <button
                                  onClick={handleSaveProfile}
                                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                >
                                  <Save size={16} />
                                  Guardar
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-[#2C2C2C] flex items-center justify-center mb-4">
                      <UserCircle size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No hay información de usuario</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-[#333]">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-[24px] font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 border border-red-200 dark:border-red-800"
                >
                  <LogOut size={20} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileDrawer;
