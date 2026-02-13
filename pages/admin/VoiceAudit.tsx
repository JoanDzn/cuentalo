import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Volume2, ArrowUpRight, BarChart } from 'lucide-react';
import { getApiUrl } from '../../config/api';

const AdminVoiceAudit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                const BASE_URL = getApiUrl();
                // Fetch only AI/Voice related logs
                const res = await fetch(`${BASE_URL}/api/admin/logs?type=AI_RESPONSE`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLogs(data);
                } else {
                    console.error("API Error:", data);
                    setLogs([]);
                }
            } catch (error) {
                console.error("Error fetching voice logs", error);
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Helper to format details if they are objects
    const formatDetails = (details) => {
        if (!details) return '-';
        if (typeof details === 'object') return JSON.stringify(details, null, 2);
        return details;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 max-w-7xl mx-auto"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                    <Volume2 size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Auditoría de Voz & IA</h1>
                    <p className="text-gray-400">Monitorea la interpretación del lenguaje natural</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm mb-1 uppercase">Interacciones Totales</h3>
                    <p className="text-3xl font-bold text-white">{logs.length}</p>
                </div>
                {/* Placeholders for more metrics if needed */}
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/80 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-700">
                            <tr>
                                <th className="p-4 pl-6">Timestamp</th>
                                <th className="p-4">Evento</th>
                                <th className="p-4">Detalles (JSON)</th>
                                <th className="p-4 text-right pr-6">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Cargando logs de voz...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay interacciones de voz registradas.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 pl-6 text-gray-300 font-mono text-sm">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <pre className="text-xs text-gray-400 bg-gray-900/50 p-3 rounded-lg overflow-x-auto max-w-md">
                                                {formatDetails(log.details)}
                                            </pre>
                                        </td>
                                        <td className="p-4 text-right pr-6 text-gray-500 text-sm font-mono">
                                            {log.ip || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminVoiceAudit;
