
import React from 'react';

export const AnimatedBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Base Background Color - specific to Landing Page aesthetic, but we might want to respect theme in Dashboard */}
            <div className="absolute inset-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 -z-10" />

            {/* Glowing orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse transition-all duration-300" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse transition-all duration-300" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl transition-all duration-300" />

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
    );
};
