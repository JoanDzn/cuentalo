import { useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const AdminCharts = ({ userGrowth, txVolume }) => {
    // Process data to ensure it's in the right format
    // Fallback data if API returns empty
    const mockGrowth = [
        { name: 'Lun', users: 4 },
        { name: 'Mar', users: 7 },
        { name: 'Mie', users: 12 },
        { name: 'Jue', users: 18 },
        { name: 'Vie', users: 24 },
        { name: 'Sab', users: 35 },
        { name: 'Dom', users: 42 },
    ];

    const mockVolume = [
        { name: 'Lun', volume: 120 },
        { name: 'Mar', volume: 200 },
        { name: 'Mie', volume: 150 },
        { name: 'Jue', volume: 300 },
        { name: 'Vie', volume: 250 },
        { name: 'Sab', volume: 400 },
        { name: 'Dom', volume: 380 },
    ];

    // Format API data to match Recharts expected format
    const formatGrowthData = (data) => {
        if (!data || data.length === 0) return mockGrowth;
        // Format date to DD/MM
        return data.map(item => {
            const date = new Date(item._id);
            // item._id is YYYY-MM-DD
            const [y, m, d] = item._id.split('-');
            return { name: `${d}/${m}`, users: item.count };
        });
    };

    const formatVolumeData = (data) => {
        if (!data || data.length === 0) return mockVolume;
        return data.map(item => {
            const [y, m, d] = item._id.split('-');
            return { name: `${d}/${m}`, volume: item.volume };
        });
    };

    const growthData = formatGrowthData(userGrowth);
    const volumeData = formatVolumeData(txVolume);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart 1: User Growth */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700 shadow-xl"
            >
                <div>
                    <h3 className="text-xl font-bold text-white">Crecimiento de Usuarios</h3>
                    <p className="text-xs text-gray-400 mb-4">Nuevos registros en los últimos 7 días</p>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#818cf8' }}
                                formatter={(value) => [`${value} Usuarios`, 'Registros']}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Chart 2: Transaction Volume (Financial) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700 shadow-xl"
            >
                <div>
                    <h3 className="text-xl font-bold text-white">Flujo Financiero Procesado</h3>
                    <p className="text-xs text-gray-400 mb-4">Volumen total de transacciones ($) gestionadas</p>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false}
                                tickFormatter={(value) => `$${value}`}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                                cursor={{ stroke: '#374151', strokeWidth: 1 }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Monto Total']}
                            />
                            <Area
                                type="monotone"
                                dataKey="volume"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVolume)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminCharts;
