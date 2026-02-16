import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { AnimatedBackground } from '../../components/AnimatedBackground';

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token!, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'El enlace ha expirado o es inválido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6 py-12 relative overflow-hidden"
        >
            <div style={{ opacity: 0.4 }} className="fixed inset-0 pointer-events-none z-0">
                <AnimatedBackground />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white lowercase mb-2">cuentalo</h1>
                    <p className="text-gray-400">Restablecer contraseña</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/10">
                    {success ? (
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-4">
                                <CheckCircle size={64} className="text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">¡Contraseña actualizada!</h2>
                            <p className="text-gray-400 mb-8">
                                Tu contraseña ha sido cambiada con éxito. Ya puedes iniciar sesión con tu nueva clave.
                            </p>
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-[24px] font-bold shadow-lg hover:bg-indigo-700 transition-all"
                            >
                                Ir al login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-gray-300 text-center mb-6">
                                Elige una nueva contraseña segura para tu cuenta.
                            </p>

                            {error && (
                                <div className="p-4 bg-red-900/20 border border-red-800 rounded-[24px] flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-black/20 border border-white/10 rounded-[24px] text-white transition-all focus:ring-2 focus:ring-indigo-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-[24px] text-white transition-all focus:ring-2 focus:ring-indigo-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ResetPasswordPage;
