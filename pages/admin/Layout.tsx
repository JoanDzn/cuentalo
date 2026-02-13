import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Home, Users, ShieldAlert, Settings, LogOut, Loader2, Menu, Volume2 } from 'lucide-react';

interface AdminUser {
    email: string;
    role: 'ADMIN';
}

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Set Title
        document.title = "Cuentalo | Admin";

        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');

        if (!token || !userData) {
            navigate('/admin/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role !== 'ADMIN') throw new Error('Not admin');
            setUser(parsedUser);
        } catch (e) {
            localStorage.removeItem('admin_token');
            navigate('/admin/login');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login');
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#111]">
                <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
            </div>
        );
    }

    const menuItems = [
        { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Usuarios' },
        { path: '/admin/voice', icon: Volume2, label: 'Auditoría Voz' },
        { path: '/admin/logs', icon: ShieldAlert, label: 'Bitácora' },
        { path: '/admin/settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#111] font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1E1E1E] border-r border-gray-200 dark:border-[#333]">
                <div className="p-6 border-b border-gray-100 dark:border-[#333] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Admin Panel</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cuentalo System</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2C2C2C] hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-[#333]">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            A
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">Admin</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-bold"
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-[#333] z-50 flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-bold">Admin</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-100 dark:bg-[#333] rounded-lg">
                    <Menu size={20} />
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed top-16 left-0 w-full bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-[#333] z-40 p-4 shadow-xl animate-slide-down">
                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location.pathname === item.path
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold mt-4 border-t border-gray-100 dark:border-[#333] pt-4"
                        >
                            <LogOut size={20} /> Salir
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
