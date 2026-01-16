import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, LogOut, UserCircle } from 'lucide-react';
import { User as UserType } from '../services/authService';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onLogout: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, user, onLogout }) => {
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
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle size={48} className="text-white" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {user.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>

                    {/* User Info Cards */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-[#2C2C2C] rounded-[24px] p-5 border border-gray-200 dark:border-[#333]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[16px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Mail size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                              Email
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#2C2C2C] rounded-[24px] p-5 border border-gray-200 dark:border-[#333]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[16px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <User size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                              Nombre
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#2C2C2C] rounded-[24px] p-5 border border-gray-200 dark:border-[#333]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[16px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Calendar size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                              Miembro desde
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
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
