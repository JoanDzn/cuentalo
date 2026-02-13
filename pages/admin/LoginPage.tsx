import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

import { getApiUrl } from '../../config/api';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const BASE_URL = getApiUrl();
            const loginUrl = `${BASE_URL}/api/admin/login`;
            console.log("Admin Login attempting to fetch:", loginUrl);
            const res = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error de acceso');
            }

            const { token, user } = await res.json();
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));
            navigate('/admin/dashboard');

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111] p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-[#333]">
                <div className="bg-indigo-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Shield className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-indigo-200 text-sm">Acceso restringido al sistema</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo Admin</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-[#333] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all"
                                placeholder="admin@gmail.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-[#333] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all"
                                placeholder="••••••"
                                required
                            />
                            <Lock className="absolute right-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
                    >
                        Ingresar al Sistema
                    </button>

                    <div className="text-center mt-4">
                        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            ← Volver a Cuentalo
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
