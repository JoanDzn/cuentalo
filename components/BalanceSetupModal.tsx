import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Landmark, ArrowRight, Check } from 'lucide-react';

interface BalanceSetupModalProps {
    isOpen: boolean;
    onComplete: (balances: { usd: number, ves: number }) => void;
    currencyPreference: 'USD' | 'VES';
}

export const BalanceSetupModal: React.FC<BalanceSetupModalProps> = ({ isOpen, onComplete, currencyPreference }) => {
    const [usdBalance, setUsdBalance] = useState<string>('');
    const [vesBalance, setVesBalance] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleFinish = () => {
        setLoading(true);
        const usd = parseFloat(usdBalance) || 0;
        const ves = parseFloat(vesBalance) || 0;

        // Artificial delay for premium feel
        setTimeout(() => {
            onComplete({ usd, ves });
            setLoading(false);
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full sm:max-w-md bg-[#111111] border border-white/10 rounded-t-[40px] sm:rounded-[40px] px-8 pt-10 pb-12 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center shadow-inner">
                                    <Wallet className="text-white" size={32} />
                                </div>
                            </div>

                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black text-white mb-2">Tu Saldo Inicial</h2>
                                <p className="text-gray-400 text-sm leading-relaxed px-4">
                                    ¿Con cuánto dinero empiezas en tus cuentas? Te ayudaremos a llevar el control desde hoy.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* USD Balance */}
                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">
                                        Saldo en Dólares (USD)
                                    </label>
                                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 group-focus-within:border-indigo-500/50 group-focus-within:bg-white/[0.08] transition-all">
                                        <span className="text-2xl font-bold text-gray-500 mr-3">$</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="bg-transparent text-white text-3xl font-black outline-none w-full placeholder:text-white/10"
                                            value={usdBalance}
                                            onChange={(e) => setUsdBalance(e.target.value)}
                                        />
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <span className="text-xs font-bold text-indigo-400">USD</span>
                                        </div>
                                    </div>
                                </div>

                                {/* VES Balance */}
                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-yellow-400 transition-colors">
                                        Saldo en Bolívares (VES)
                                    </label>
                                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 group-focus-within:border-yellow-500/50 group-focus-within:bg-white/[0.08] transition-all">
                                        <span className="text-lg font-bold text-gray-500 mr-3">Bs</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="bg-transparent text-white text-3xl font-black outline-none w-full placeholder:text-white/10"
                                            value={vesBalance}
                                            onChange={(e) => setVesBalance(e.target.value)}
                                        />
                                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                            <span className="text-[10px] font-bold text-yellow-500">VES</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleFinish}
                                    disabled={loading}
                                    className={`w-full py-5 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] transition-all ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-gray-100'}`}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Empezar ahora</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            <p className="text-center text-[11px] text-gray-600 mt-6 leading-relaxed uppercase tracking-tighter">
                                Podrás registrar más ingresos en cualquier momento con tu voz
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
