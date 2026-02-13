import React, { useEffect, useState } from 'react';
import { Users, CreditCard, Activity, AlertTriangle } from 'lucide-react';
import { getApiUrl } from '../../config/api';
import AdminCharts from './components/AdminCharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({ users: 0, todayTransactions: 0, transactions: 0, aiSuccessRate: 0, charts: { userGrowth: [], txVolume: [] } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                const BASE_URL = getApiUrl();
                const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) {
                    localStorage.removeItem('admin_token');
                    window.location.href = '/admin/login';
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setMetrics(data);
                } else {
                    console.error("Failed to fetch metrics", await res.text());
                }
            } catch (error) {
                console.error("Error loading metrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    const StatCard = ({ title, value, icon, color, delay, titleColor = "text-gray-500 dark:text-gray-400", valueColor = "text-gray-900 dark:text-white" }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={`bg-white dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-gray-900 dark:text-white`}>
                {React.cloneElement(icon, { size: 64 })}
            </div>
            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl bg-opacity-20 ${color} shadow-inner`}>
                    {React.cloneElement(icon, { size: 28, className: "text-gray-700 dark:text-white" })}
                </div>
                <div>
                    <h3 className={`${titleColor} text-sm font-medium uppercase tracking-wider`}>{title}</h3>
                    <p className={`3xl font-bold ${valueColor} mt-1`}>{value}</p>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Panel de <span className="text-blue-600 dark:text-blue-500">Control</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Centro de Comando y Analíticas en Tiempo Real</p>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Usuarios Totales"
                    value={metrics.users}
                    icon={<Users />}
                    color="bg-blue-100 dark:bg-blue-500"
                    delay={0.1}
                />
                <StatCard
                    title="Transacciones Hoy/Total"
                    value={metrics.todayTransactions || metrics.transactions}
                    icon={<CreditCard />}
                    color="bg-emerald-100 dark:bg-emerald-500"
                    delay={0.2}
                />
                <StatCard
                    title="Éxito IA (%)"
                    value={`${metrics.aiSuccessRate}%`}
                    icon={<Activity />}
                    color="bg-purple-100 dark:bg-purple-500"
                    delay={0.3}
                />
            </div>

            {/* Charts Section */}
            <AdminCharts userGrowth={metrics.charts?.userGrowth} txVolume={metrics.charts?.txVolume} />

            {/* System Alerts */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl transition-all duration-300 shadow-sm"
            >
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estado del Sistema</h3>
                </div>

                {metrics.aiSuccessRate < 80 ? (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex gap-3 items-center">
                        <AlertTriangle size={20} />
                        <span>Alta tasa de fallo en comandos de voz detectada. Revise los logs de audio.</span>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 rounded-xl flex gap-3 items-center">
                        <Activity size={20} />
                        <span>Todos los sistemas operativos operan con normalidad.</span>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
