import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, ChevronDown, ChevronRight, Sparkles, Mic, Brain, Target, TrendingUp, UserPlus, CheckCircle2, Layout, PieChart, Wallet, Shield, Zap, Smartphone } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

// Landing Page - Updated with scroll navbar effect
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [inputMode, setInputMode] = useState<'voice' | 'manual'>('voice');
  const backgroundOpacity = Math.max(0.2, 1 - scrollPosition / 600);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.title = "Cuentalo";

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setScrollPosition(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 md:opacity-100">
        <AnimatedBackground />
      </div>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrollPosition > 20 ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
          backdropFilter: scrollPosition > 20 ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrollPosition > 20 ? 'blur(24px)' : 'none',
          borderBottom: scrollPosition > 20 ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
          padding: scrollPosition > 20 ? '0.75rem 1.5rem' : '1.5rem 1.5rem',
          boxShadow: scrollPosition > 20 ? '0 10px 40px rgba(0, 0, 0, 0.3)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-2xl font-bold tracking-tight">cuentalo</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/10 transition-all"
            >
              <User size={18} className="text-white" />
            </button>
            <button
              onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
              className="px-4 sm:px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden z-10 pt-40 pb-24 md:py-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full h-full">

          {/* Text Content */}
          <div className="flex-1 text-left z-10 flex flex-col items-start px-1 md:px-0">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-[2.5rem] xs:text-[2.75rem] sm:text-6xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-4 md:mb-8"
            >
              Tus finanzas aqui, <br />
              simplemente <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Cuentalo.</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base sm:text-xl md:text-2xl text-white/50 mb-6 md:mb-10 max-w-xl md:mx-0 leading-relaxed pr-4"
            >
              Escribe, habla o automatiza. Cuentalo organiza tus finanzas para que no tengas que pensarlo.
            </motion.p>

            {/* Desktop Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden md:flex flex-row items-center gap-4"
            >
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-3 bg-white text-black pl-6 pr-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] min-w-[180px]"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <Layout size={28} className="text-black" />
                </div>
                <div className="text-left flex flex-col flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 leading-none mb-1">Disponible</span>
                  <span className="text-base leading-none font-bold">Entra a la app</span>
                </div>
                <ChevronRight size={20} className="text-black" />
              </button>

              <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all border border-white/10 min-w-[180px]">
                <div className="w-8 h-8 flex items-center justify-center">
                  {/* Play Store generic icon or keep layout */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 opacity-20 blur-sm rounded-full"></div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white relative z-10">
                      <path d="M5 3.7l15.3 7.6c.7.4.7 1.4 0 1.8L5 20.7c-.7.4-1.6-.1-1.6-.9V4.6c0-.8.9-1.3 1.6-.9z" />
                    </svg>
                  </div>
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 leading-none mb-1">Próximamente</span>
                  <span className="text-lg leading-none font-bold">Google Play</span>
                </div>
              </button>

              <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all border border-white/10 min-w-[180px]">
                <div className="w-8 h-8 flex items-center justify-center">
                  {/* App Store generic icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-20 blur-sm rounded-full"></div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white relative z-10">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.57-.84 1.58.12 2.53.84 3.19 1.7-2.88 1.47-2.34 5.79.62 7.02-.59 1.63-1.44 3.25-2.46 4.35ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.29-1.9 4.33-3.74 4.25Z" />
                    </svg>
                  </div>
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 leading-none mb-1">Próximamente</span>
                  <span className="text-lg leading-none font-bold">App Store</span>
                </div>
              </button>
            </motion.div>
          </div>

          {/* Hero Image / Phone Mockup - Minimalist Top Half */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden md:flex flex-1 w-full max-w-[320px] md:max-w-[420px] relative mx-auto md:pl-12"
          >
            {/* Soft Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/10 blur-[100px] rounded-full"></div>

            {/* Phone Container with Mask - With Rotation */}
            <div className="relative md:scale-[1.25] md:origin-right">
              {/* Cut-off phone showing only top portion */}
              <div
                className="relative w-full aspect-[9/12] overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)'
                }}
              >
                <div className="w-full h-[200%] bg-[#0a0a0a] rounded-[48px] border-[6px] border-[#1f1f1f] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">

                  {/* Dynamic Island - Improved */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#0a0a0a] rounded-b-3xl z-30 shadow-inner"></div>

                  {/* Status Bar - No Time */}
                  <div className="flex justify-end items-center px-8 pt-4 pb-2 text-[11px] font-medium text-white/60 select-none">
                    <div className="flex gap-2 opacity-50">
                      <div className="h-3 w-3 bg-current rounded-full" />
                      <div className="h-3 w-3 bg-current rounded-full" />
                      <div className="h-3 w-6 bg-current rounded-full" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-center px-8 py-5 mb-4">
                    <span className="text-2xl font-bold tracking-tight text-white">cuentalo</span>
                    <div className="absolute right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                      <User size={16} className="text-white/60" />
                    </div>
                  </div>

                  {/* Tabs - Minimalist */}
                  <div className="px-8 mb-8">
                    <div className="bg-[#111] p-2 rounded-2xl flex items-center">
                      <div className="flex-1 py-3 rounded-xl bg-[#1a1a1a] text-center text-sm font-semibold text-white">
                        Resumen
                      </div>
                      <div className="flex-1 py-3 text-center text-sm font-medium text-white/30">
                        Historial
                      </div>
                    </div>
                  </div>

                  {/* Main Balance - Larger */}
                  <div className="text-center mb-10 px-8">
                    <div className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase mb-3">Balance Total</div>
                    <div className="text-6xl font-black text-white tracking-tight">$842.50</div>
                  </div>

                  {/* Stats Grid - Clean */}
                  <div className="grid grid-cols-3 gap-4 px-8">
                    <div className="bg-[#0f0f0f] rounded-2xl p-4 border border-white/5">
                      <TrendingUp size={14} className="text-emerald-400 mb-3" strokeWidth={2.5} />
                      <div className="font-black text-base text-white">$1.2K</div>
                      <div className="text-[11px] text-white/30 font-medium mt-1">Ingreso</div>
                    </div>
                    <div className="bg-[#0f0f0f] rounded-2xl p-4 border border-white/5">
                      <TrendingUp size={14} className="text-rose-400 rotate-180 mb-3" strokeWidth={2.5} />
                      <div className="font-black text-base text-white">$358</div>
                      <div className="text-[11px] text-white/30 font-medium mt-1">Gasto</div>
                    </div>
                    <div className="bg-[#0f0f0f] rounded-2xl p-4 border border-white/5">
                      <Target size={14} className="text-violet-400 mb-3" strokeWidth={2.5} />
                      <div className="font-black text-base text-white">$150</div>
                      <div className="text-[11px] text-white/30 font-medium mt-1">Ahorro</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Buttons (Phone Layout) */}
          <div className="flex md:hidden flex-col items-center gap-3 w-full mt-0">
            <button
              onClick={() => navigate('/auth')}
              className="w-full flex items-center justify-between bg-white text-black px-5 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 flex items-center justify-center">
                  <Layout size={20} className="text-black" />
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 leading-none mb-1">Disponible</span>
                  <span className="text-base leading-none font-bold">Entra a la app</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-black" />
            </button>

            <div className="flex w-full gap-3">
              <button className="flex-1 flex items-center justify-center gap-3 bg-white/5 text-white px-3 py-3 rounded-xl font-bold active:scale-95 transition-all border border-white/10 backdrop-blur-sm">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 opacity-20 blur-sm rounded-full"></div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white relative z-10">
                      <path d="M5 3.7l15.3 7.6c.7.4.7 1.4 0 1.8L5 20.7c-.7.4-1.6-.1-1.6-.9V4.6c0-.8.9-1.3 1.6-.9z" />
                    </svg>
                  </div>
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 leading-none mb-1">Próximamente</span>
                  <span className="text-sm leading-none font-bold">Google Play</span>
                </div>
              </button>

              <button className="flex-1 flex items-center justify-center gap-3 bg-white/5 text-white px-3 py-3 rounded-xl font-bold active:scale-95 transition-all border border-white/10 backdrop-blur-sm">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-20 blur-sm rounded-full"></div>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white relative z-10">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.57-.84 1.58.12 2.53.84 3.19 1.7-2.88 1.47-2.34 5.79.62 7.02-.59 1.63-1.44 3.25-2.46 4.35ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.29-1.9 4.33-3.74 4.25Z" />
                    </svg>
                  </div>
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 leading-none mb-1">Próximamente</span>
                  <span className="text-sm leading-none font-bold">App Store</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        {/* Scroll Indicator - Always Visible */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-30 opacity-80 hover:opacity-100 transition-opacity"
          onClick={() => {
            const processSection = document.getElementById('process');
            if (processSection) processSection.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-xs font-bold text-white/40 tracking-wide">Desliza para explorar</span>
          <div
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-sm"
          >
            <ChevronDown className="text-white/60" size={16} />
          </div>
        </div>
      </section >

      {/* NEW DYNAMIC PROCESS SECTION */}
      <section id="process" className="py-24 md:py-32 relative overflow-hidden scroll-mt-0">

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Section Title - Badge Style */}
          <div className="flex justify-center mb-20 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="text-indigo-400" size={24} fill="currentColor" />
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight">El control total, simplificado.</span>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-16 text-center">

            {/* Col 1: Capture (Voice) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center group"
            >
              {/* Animated Visual */}
              <div className="h-40 flex items-center justify-center mb-10 relative">
                {/* Float Animation */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative scale-125" // Made larger
                >
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                  <div className="bg-[#111] border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-5 shadow-2xl relative z-10">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Zap size={24} />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold text-white">Gasolina</div>
                      <div className="text-sm text-white/50">$40.00</div>
                    </div>
                  </div>
                  {/* Voice Wave */}
                  <div className="absolute -right-8 -bottom-5 bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-full flex gap-1.5 items-center shadow-lg">
                    <div className="w-1.5 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-7 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  </div>
                </motion.div>
              </div>
              {/* Text */}
              <h3 className="text-2xl font-bold text-white mb-4">Registra sin esfuerzo</h3>
              <p className="text-white/50 text-base leading-relaxed px-4">
                Solo dilo. "40 dólares de gasolina". La IA detecta la categoría, la moneda y lo anota por ti.
              </p>
            </motion.div>

            {/* Col 2: Habit (Grid) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center group"
            >
              {/* Animated Visual */}
              <div className="h-40 flex items-center justify-center mb-10">
                <div className="grid grid-cols-5 gap-3 p-5 bg-[#111] rounded-3xl border border-white/5 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 scale-110">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: i * 0.05 + 0.4 }}
                      viewport={{ once: true }}
                      className={`w-6 h-6 rounded-md ${i < 11 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>
              {/* Text */}
              <h3 className="text-2xl font-bold text-white mb-4">Crea el hábito</h3>
              <p className="text-white/50 text-base leading-relaxed px-4">
                Cuando registrar toma segundos, la consistencia se vuelve natural. Construye tu racha diaria.
              </p>
            </motion.div>

            {/* Col 3: Insight (Chart) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-center group"
            >
              {/* Animated Visual */}
              <div className="h-40 flex items-end justify-center gap-4 mb-10 pb-2 relative">
                {/* Fixed Heights using style to ensure visibility */}
                {[
                  { color: 'bg-indigo-500', height: 80, delay: 0.6, icon: '🍔' },
                  { color: 'bg-purple-500', height: 120, delay: 0.7, icon: '🚗' },
                  { color: 'bg-pink-500', height: 60, delay: 0.8, icon: '🛒' },
                  { color: 'bg-white/20', height: 40, delay: 0.9, icon: '💎' },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">{bar.icon}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: bar.height }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: bar.delay, type: 'spring', bounce: 0.2 }}
                      className={`w-10 rounded-t-xl ${bar.color} shadow-lg`}
                      style={{ minHeight: '10px' }} // Fallback size
                    />
                  </div>
                ))}
              </div>
              {/* Text */}
              <h3 className="text-2xl font-bold text-white mb-4">Ve el panorama completo</h3>
              <p className="text-white/50 text-base leading-relaxed px-4">
                Entiende tus patrones de gasto reales. Obtén información que nunca encontrarías manualmente.
              </p>
            </motion.div>

          </div>
          {/* Section Transition */}
          <div id="overview" className="mt-20 -mb-24 flex flex-col items-center text-center relative z-10 pt-24 scroll-mt-24">
            {/* Connecting Line */}
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent mb-6"></div>

            {/* Pill Label */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300">Funcionalidades</span>
            </motion.div>

            {/* Headline */}
            <h3 className="text-[2.5rem] md:text-6xl font-black text-white mb-2 tracking-tight leading-tight px-4">
              Tecnología que <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">trabaja por ti.</span>
            </h3>

            <p className="text-xl text-white/40 max-w-xl mx-auto mb-8">
              La herramienta diseñada para simplificar tu vida financiera en Venezuela.
            </p>

            <ChevronDown className="text-white/20 animate-bounce" size={24} />
          </div>

        </div>
      </section>



      {/* FEATURES 1: Horizontal Steps */}
      {/* STEP 1: Centraliza */}
      <section id="features" className="py-24 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            {/* Text Content */}
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                Simplemente dilo, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">nosotros lo anotamos</span>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed max-w-lg">
                Olvídate de procesos manuales. Registra cualquier transacción hablando naturalmente, ya sea en dólares o bolívares.
              </p>
              <ul className="space-y-4 pt-2">
                {['Reconocimiento de voz avanzado', 'Detección automática de moneda', 'Registro instantáneo sin fricción'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="flex-1 w-full">
              <div className="relative aspect-video bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center shadow-2xl group cursor-pointer transition-colors duration-500 hover:bg-[#0f0f0f]">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] transition-opacity duration-500 group-hover:opacity-60"></div>

                {/* Hover Reveal: Floating Elements */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  {/* Transcription Bubble - Pops up */}
                  <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 px-6 py-3 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 flex items-center gap-3 scale-90 group-hover:scale-100 delay-100">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <span className="text-white font-medium font-mono text-sm tracking-wide">"Gasté 5$ en café"</span>
                  </div>

                  {/* Floating Icons - Scatter out */}
                  <Zap className="absolute top-[35%] left-[25%] text-yellow-500/30 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 rotate-12" />

                  <div className="absolute bottom-[30%] right-[20%] text-purple-500/30 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 transform -translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 -rotate-12">
                    <Wallet size={32} />
                  </div>

                  <div className="absolute top-[40%] right-[25%] text-emerald-500/30 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-150 transform -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                  </div>
                </div>

                {/* Glowing Mic Container */}
                <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">

                  {/* Active Pulse Ring (Fixed Glow) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>

                  {/* Wave 1 Container - Centers the wave */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center">
                    {/* The Wave itself animates independently inside */}
                    <div className="w-full h-full border border-indigo-500/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping [animation-duration:2s]"></div>
                  </div>

                  {/* Wave 2 Container - Centers the larger wave */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center">
                    <div className="w-full h-full border border-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping [animation-duration:3s] [animation-delay:0.4s]"></div>
                  </div>

                  {/* Mic Button - Remains on top */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_80px_rgba(124,58,237,0.6)] pointer-events-auto">
                    <Mic size={40} className="text-white transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: Ordena */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24">
            {/* Text Content */}
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                Unifica tus cuentas <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">en una sola moneda</span>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed max-w-lg">
                Centraliza tus movimientos de Pago Móvil, Zelle, Efectivo o Binance. Visualiza tu balance real en una moneda consolidada.
              </p>
              <ul className="space-y-4 pt-2">
                {['Conversión inteligente de divisas', 'Consolidación de múltiples fuentes', 'Categorización automática precisa'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="flex-1 w-full flex items-center justify-center">
              <div className="relative w-full max-w-md bg-[#0c0c0c] rounded-3xl border border-white/5 p-6 shadow-2xl group cursor-pointer transition-all duration-500 hover:border-white/10 hover:bg-[#111]">

                {/* Cards Container - Scattered to Aligned */}
                <div className="flex flex-col gap-5 w-full py-4 relative z-10">

                  {/* Card 1: Comida - Starts tilted left & offset */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#161616] border border-white/5 shadow-lg relative z-30 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform -translate-x-6 md:-translate-x-12 group-hover:translate-x-0 hover:!scale-105 group-hover:bg-[#1a1a1a]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                        <TrendingUp size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">Comida</div>
                        <div className="h-1.5 w-16 bg-white/10 rounded-full mt-2"></div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white text-lg">-$15.00</div>
                  </div>

                  {/* Card 2: Servicios - Starts tilted right & offset */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#161616] border border-white/5 shadow-lg relative z-20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform translate-x-6 md:translate-x-12 group-hover:translate-x-0 hover:!scale-105 group-hover:bg-[#1a1a1a]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20">
                        <Zap size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">Servicios</div>
                        <div className="h-1.5 w-20 bg-white/10 rounded-full mt-2"></div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white text-lg">-$40.00</div>
                  </div>

                  {/* Card 3: Salario - Starts tilted left & offset */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#161616] border border-white/5 shadow-lg relative z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform -translate-x-3 md:-translate-x-6 group-hover:translate-x-0 hover:!scale-105 group-hover:border-emerald-500/20 group-hover:bg-[#1a1a1a]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Wallet size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">Salario</div>
                        <div className="h-1.5 w-24 bg-white/10 rounded-full mt-2"></div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-lg">+$1,200.00</div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 3: Analiza */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            {/* Text Content */}
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                Entiende y Optimiza <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">tu Flujo de Caja</span>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed max-w-lg">
                Obtén claridad total sobre tus ingresos y gastos. Toma decisiones informadas con gráficos intuitivos y reportes detallados.
              </p>
              <ul className="space-y-4 pt-2">
                {['Análisis financiero detallado', 'Identificación de oportunidades de ahorro', 'Reportes claros y accionables'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="flex-1 w-full flex items-center justify-center">
              <div className="relative aspect-square md:aspect-video w-full max-w-md bg-[#0a0a0a] rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl overflow-hidden group cursor-pointer transition-colors duration-500 hover:bg-[#0f0f0f]">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 blur-[80px] rounded-full transition-all duration-500 group-hover:bg-emerald-500/15"></div>

                {/* Decorative Elements */}
                <div className="absolute top-8 left-8 p-3 rounded-2xl bg-white/5 text-white/20 transition-all duration-500 group-hover:text-emerald-500/40 group-hover:scale-110">
                  <TrendingUp size={24} />
                </div>
                <div className="absolute bottom-10 right-10 text-white/10 transition-all duration-500 group-hover:text-white/20 group-hover:rotate-12">
                  <Wallet size={32} />
                </div>

                {/* Chart Container */}
                <div className="relative w-64 h-64 flex items-center justify-center z-10">
                  {/* SVG Chart */}
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Track */}
                    <circle cx="128" cy="128" r="90" stroke="#1a1a1a" strokeWidth="12" fill="transparent" />

                    {/* Progress Circle - Animates 65% -> 85% */}
                    <circle
                      cx="128" cy="128" r="90"
                      stroke="currentColor" strokeWidth="12"
                      fill="transparent"
                      strokeDasharray="565.48"
                      strokeDashoffset="198"
                      strokeLinecap="round"
                      className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)] transition-all duration-[1.5s] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:[stroke-dashoffset:85px]"
                    />
                  </svg>

                  {/* Inner Content - Percentage Top, Status Bottom (Overlapping) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    {/* Percentage Transition (Centered) */}
                    <div className="relative h-20 w-40 flex items-center justify-center -mt-4">
                      {/* 65% State */}
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:scale-110 group-hover:blur-sm">
                        <span className="text-[3.5rem] font-black text-white tracking-tighter">65%</span>
                      </div>

                      {/* 85% State - Enters on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-90 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 group-hover:blur-0 delay-100">
                        <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">85%</span>
                      </div>
                    </div>

                    {/* Status Text Transition (Tighter spacing) */}
                    <div className="absolute bottom-[5.2rem] w-full flex items-center justify-center z-20">
                      {/* '¡Vas muy bien!' - Visible Initially */}
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-2">
                        <span className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest bg-[#0a0a0a] px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap shadow-lg">¡Vas muy bien!</span>
                      </div>

                      {/* 'Meta cumplida' - Enters on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 -translate-y-2 scale-90 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 delay-100">
                        <div className="flex items-center gap-2 bg-[#0a0a0a] px-3 py-1 rounded-full border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)] whitespace-nowrap">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Meta cumplida</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer & CTA */}
      <footer className="relative pt-32 pb-12 px-6 border-t border-white/5 bg-[#050505] overflow-hidden">
        {/* Large CTA Card */}
        <div className="max-w-5xl mx-auto mb-24 relative z-10">
          <div className="bg-gradient-to-b from-[#1a0b2e] to-[#11051f] rounded-[48px] p-8 sm:p-12 md:p-20 text-center border border-white/10 shadow-2xl relative overflow-hidden mx-1">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/10 blur-[80px] rounded-full"></div>

            <h2 className="text-[2.5rem] md:text-6xl font-black tracking-tight mb-6 relative z-10 leading-tight">
              Transforma tu gestión <br />
              financiera hoy.
            </h2>
            <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto relative z-10">
              Únete a quienes ya han tomado el control de su economía personal de forma inteligente y automatizada.
            </p>
            <button
              onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
              className="px-10 py-5 bg-white text-black rounded-full text-lg font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10 flex items-center justify-center gap-2 mx-auto"
            >
              Prueba Cuentalo Gratis <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Footer Content */}
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="flex flex-col md:items-start items-center gap-6 text-center md:text-left mb-12">
            <div className="space-y-6 max-w-lg">
              <span className="text-4xl font-bold text-white lowercase tracking-tight">cuentalo</span>
              <p className="leading-relaxed text-base text-white/40">
                Tu centro de comando financiero personal. Diseñado para <br className="hidden md:block" />
                dar claridad y control sobre tu dinero en Venezuela.
              </p>
            </div>
          </div>

          <div className="text-center w-full border-t border-white/5 pt-8">
            <div className="text-xs text-white/20 font-medium tracking-wider uppercase">
              <p>© 2026 Cuentalo. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none -z-0"></div>
      </footer>
    </div >
  );
};

export default LandingPage;
