import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, User, ChevronDown, Sparkles, Mic, Brain, Target, TrendingUp } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Ensure dark mode is active for landing page
    document.documentElement.classList.add('dark');

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
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                title="Mi Perfil"
              >
                <User size={18} />
              </button>
              <button
                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-all"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />

          {/* Network lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="70%" y1="30%" x2="90%" y2="50%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="20%" y1="60%" x2="50%" y2="80%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="60%" y1="70%" x2="80%" y2="90%" stroke="url(#lineGradient)" strokeWidth="1" />
          </svg>

          {/* Vertical light trails */}
          <div className="absolute top-0 right-[30%] w-px h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent" />
          <div className="absolute top-0 right-[40%] w-px h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Main Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight"
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
            className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
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
              className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full font-bold text-lg transition-all hover:scale-105"
            >
              Saber más
            </button>
          </motion.div>

          {/* Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold mb-8"
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

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Todo lo que necesitas en{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              un solo lugar
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Registro por Voz</h3>
              <p className="text-white/60 leading-relaxed">
                Solo di "Gasté 5 dólares en un café" y la app lo registrará automáticamente. Sin formularios, sin complicaciones.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Categorización IA</h3>
              <p className="text-white/60 leading-relaxed">
                Nuestra IA entiende el contexto de tus gastos y los categoriza automáticamente, aprendiendo de tus hábitos financieros.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Educación Financiera</h3>
              <p className="text-white/60 leading-relaxed">
                Completa misiones de ahorro diseñadas para el contexto venezolano y mejora tu salud económica paso a paso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para transformar tus finanzas?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Únete a las personas que ya están tomando el control de su dinero con cuentalo.
            </p>
            <button
              onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0a0a0a] rounded-full text-lg font-bold shadow-lg hover:bg-white/90 transition-all hover:scale-105"
            >
              Crear Cuenta Gratis
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white/40 text-sm">
            <p>© 2026 cuentalo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
