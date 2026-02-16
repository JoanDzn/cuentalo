import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { AnimatedBackground } from '../../components/AnimatedBackground';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.requestPasswordReset(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error al enviar el enlace de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6 py-12 relative overflow-hidden"
        >
            <div style={{ opacity: 0.4 }} className="fixed inset-0 pointer-events-none z-0">
                <AnimatedBackground />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white lowercase mb-2">cuentalo</h1>
                    <p className="text-gray-400">Recuperación de cuenta</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/10">
                    {success ? (
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-4">
                                <CheckCircle size={64} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">¡Enlace enviado!</h2>
                            <p className="text-gray-400 mb-8">
                                Si el correo <b>{email}</b> está registrado, recibirás instrucciones para restablecer tu contraseña en unos minutos.
                            </p>
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full px-6 py-4 bg-white/10 text-white rounded-[24px] font-bold hover:bg-white/20 transition-all"
                            >
                                Volver al login
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-300 mb-8 text-center">
                                Introduce tu correo electrónico y te enviaremos un enlace para que puedas volver a entrar a tu cuenta.
                            </p>

                            {error && (
                                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-[24px] flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-[24px] text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="tu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Enviando...' : 'Enviar enlace'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white mx-auto transition-colors"
                    >
                        <ArrowLeft size={16} /> Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ForgotPasswordPage;
