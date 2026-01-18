import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, User, ChevronDown, Sparkles, Mic, Brain, Target, TrendingUp, UserPlus, CheckCircle2, Layout, PieChart, Wallet, Shield, Zap } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  const backgroundOpacity = Math.max(0.5, 1 - scrollPosition / 600);

  useEffect(() => {
    // Ensure dark mode is active for landing page
    document.documentElement.classList.add('dark');
    document.title = "Cuentalo";

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden"
    >
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="text-xl font-bold lowercase">cuentalo</span>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="hidden md:block p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                title="Iniciar Sesión"
              >
                <User size={20} />
              </button>

              <button
                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs md:text-sm font-semibold transition-all backdrop-blur-md border border-white/5"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        <div style={{ opacity: backgroundOpacity, transition: 'opacity 0.3s ease-out' }} className="fixed inset-0 z-0 pointer-events-none">
          <AnimatedBackground />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Main Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight"
          >
            Tus finanzas con{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Inteligencia Artificial
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-white/60 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
          >
            La forma más sencilla de gestionar tu dinero en Venezuela. Registra gastos con tu voz y deja que nuestra IA haga el resto.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/auth')}
              className="group flex items-center gap-3 px-8 py-4 bg-white text-[#0a0a0a] rounded-full font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-lg shadow-white/10"
            >
              Entrar a la App
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden md:flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full font-bold text-lg transition-all hover:scale-105"
            >
              Saber más
            </button>
          </motion.div>

          {/* Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="order-first md:order-last inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-xs sm:text-sm font-semibold mb-8"
          >
            <Sparkles size={16} className="text-indigo-400" />
            ¡Optimiza tus ahorros hoy mismo!
            <ArrowRight size={16} />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="text-xs font-bold text-white/40">Desliza para explorar</div>
          <button
            onClick={() => {
              const featuresSection = document.getElementById('features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
          >
            <ChevronDown size={20} className="text-white/60" />
          </button>
        </div>
      </section>

      {/* Features Section - Step by Step */}
      <div id="features" className="py-24 space-y-32 px-6 overflow-hidden">

        {/* Step 1 */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6 relative z-20">
              <span className="text-indigo-400 font-mono tracking-wider text-sm font-bold uppercase">Paso 01</span>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white">
                Centraliza tu <br />
                <span className="text-indigo-400">Universo Financiero</span>
              </h2>
              <p className="text-xl text-white/60 leading-relaxed">
                Olvídate de guardar recibos o escribir en notas. Crea tu única fuente de verdad registrando cada movimiento con tu voz.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Registro de voz natural y rápido',
                  'Sincronización instantánea',
                  'Sin fricción: dilo y listo'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="text-indigo-500" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual 1 - Voice Interface Mockup */}
            <div className="flex-1 w-full">
              <div className="relative aspect-square md:aspect-video bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 p-8 flex flex-col justify-center items-center shadow-2xl overflow-hidden group">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                {/* Hover Background Graphics */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute top-10 left-10 text-indigo-500/20 transform -rotate-12"><Zap size={40} /></div>
                  <div className="absolute bottom-10 right-10 text-purple-500/20 transform rotate-12"><Wallet size={40} /></div>
                  <div className="absolute top-1/2 right-12 text-emerald-500/20 transform rotate-45"><TrendingUp size={30} /></div>
                  <div className="absolute top-20 right-20 text-white/10 transform rotate-90"><Shield size={24} /></div>
                  <div className="absolute bottom-20 left-20 text-indigo-300/10"><Layout size={32} /></div>
                  <div className="absolute top-8 left-1/2 text-purple-300/10"><PieChart size={28} /></div>
                </div>

                {/* Voice Element */}
                <div className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-pulse">
                    <Mic size={40} className="text-white" />
                  </div>
                </div>

                {/* Floating Card - Moves to top on hover */}
                <div className="absolute top-8 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 group-hover:translate-y-0 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 transition-all duration-500 z-20">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-mono text-sm whitespace-nowrap">"Gasté 5$ en café"</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6 relative z-20">
              <span className="text-purple-400 font-mono tracking-wider text-sm font-bold uppercase">Paso 02</span>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white">
                Ordena y Clasifica <br />
                <span className="text-purple-400">con Precisión IA</span>
              </h2>
              <p className="text-xl text-white/60 leading-relaxed">
                Nuestra Inteligencia Artificial analiza el contexto de tus gastos y los organiza automáticamente en categorías inteligentes.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Categorización automática',
                  'Detección inteligente de servicios',
                  'Visión clara de tus hábitos'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="text-purple-500" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual 2 - Categories/Cards Mockup */}
            <div className="flex-1 w-full">
              <div className="relative aspect-square md:aspect-video bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 p-8 flex flex-col gap-4 shadow-2xl group overflow-hidden">


                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Abstract Cards */}
                {[
                  { icon: <TrendingUp size={20} />, color: 'bg-red-500', title: 'Comida', amount: '-$15.00' },
                  { icon: <Zap size={20} />, color: 'bg-yellow-500', title: 'Servicios', amount: '-$40.00' },
                  { icon: <Wallet size={20} />, color: 'bg-green-500', title: 'Salario', amount: '+$1,200.00' },
                ].map((card, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 transition-all duration-300 group-hover:bg-white/10 ${i === 1 ? 'translate-x-4' : ''} group-hover:translate-x-0 group-hover:scale-105`} style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${card.color}/20 text-${card.color.split('-')[1]}-400 flex items-center justify-center`}>
                        {/* Simple Icon Placeholder since Briefcase is not imported yet, used TrendingUp/Zap */}
                        {i === 2 ? <Wallet size={20} className="text-green-400" /> : card.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{card.title}</span>
                        <div className="w-16 h-2 bg-white/10 rounded-full mt-1"></div>
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${card.amount.startsWith('+') ? 'text-green-400' : 'text-white'}`}>{card.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6 relative z-20">
              <span className="text-emerald-400 font-mono tracking-wider text-sm font-bold uppercase">Paso 03</span>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white">
                Analiza y Optimiza <br />
                <span className="text-emerald-400">tu Rendimiento</span>
              </h2>
              <p className="text-xl text-white/60 leading-relaxed">
                Convierte tu actividad diaria en insights claros. Completa misiones de ahorro y mejora tu salud financiera paso a paso.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Gráficos detallados de flujo de caja',
                  'Misiones de ahorro personalizadas',
                  'Proyección de saldo futuro'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual 3 - Donut Chart Mockup */}
            <div className="flex-1 w-full">
              <div className="relative aspect-square md:aspect-video bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 p-8 flex items-center justify-center shadow-2xl group overflow-hidden">

                {/* Hover Graphics */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none select-none">
                  <div className="absolute top-4 left-4 text-emerald-500/10"><PieChart size={60} /></div>
                  <div className="absolute top-1/2 right-4 text-emerald-500/10"><Target size={50} /></div>
                  <div className="absolute top-10 right-10 text-emerald-500/10 transform rotate-45"><Wallet size={40} /></div>
                  <div className="absolute bottom-10 left-10 text-emerald-500/10"><CheckCircle2 size={45} /></div>
                  <div className="absolute top-1/2 left-8 text-white/5"><Layout size={30} /></div>
                </div>

                {/* Donut Chart */}
                <div className="relative w-56 h-56 rounded-full transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-12 transform-gpu"
                  style={{ background: 'conic-gradient(from 180deg, #10b981 0%, #10b981 65%, #334155 65%, #334155 100%)' }}>
                  <div className="absolute inset-4 bg-black rounded-full flex items-center justify-center border border-white/5">
                    <div className="text-center">
                      <span className="block text-4xl md:text-5xl font-bold text-white tracking-tighter">65%</span>
                      <span className="text-xs md:text-sm text-emerald-400 uppercase tracking-widest font-bold mt-1">Ahorro</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3 transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">Meta cumplida</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-white/10 rounded-[40px] p-12 lg:p-20 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 relative z-10">
              Empieza a construir <br /> tu futuro, hoy.
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto relative z-10">
              Únete a miles de usuarios que ya están transformando sus finanzas con Cuentalo.
            </p>
            <button
              onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
              className="relative z-10 inline-flex items-center gap-3 px-10 py-5 bg-white text-[#0a0a0a] rounded-full text-lg font-bold shadow-xl hover:bg-gray-100 transition-all hover:scale-105"
            >
              Prueba Cuentalo Gratis
              <ArrowRight size={20} />
            </button>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-0"></div>
          </div>
        </div>
      </section>

      {/* Detailed Footer */}
      {/* Detailed Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-4 max-w-sm text-center md:text-left">
              <span className="text-2xl font-bold lowercase">cuentalo</span>
              <p className="text-white/40 leading-relaxed text-sm">
                Tu centro de comando financiero personal. Diseñado para dar claridad y control sobre tu dinero en Venezuela.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs text-center md:text-left">
            <p>© 2026 Cuentalo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
