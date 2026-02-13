import React, { useEffect, useState } from 'react';
import { Search, Loader2, FileText, Download } from 'lucide-react';
import { getApiUrl } from '../../config/api';
import { motion } from 'framer-motion';

interface LogEntry {
    _id: string;
    type: string;
    createdAt: string;
    details: any;
    ip?: string;
}

const AdminLogs = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const BASE_URL = getApiUrl();
            const res = await fetch(`${BASE_URL}/api/admin/logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setLogs(data);
            } else {
                console.error("API Error or Invalid format", data);
                setLogs([]);
            }
        } catch (e) {
            console.error("Error fetching logs", e);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToJSON = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(logs, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `system_logs_${new Date().toISOString()}.json`;
        link.click();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 max-w-7xl mx-auto"
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Bitácora del Sistema</h1>
                    <p className="text-gray-400">Registro completo de eventos y auditoría</p>
                </div>
                <button
                    onClick={exportToJSON}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors border border-gray-600"
                >
                    <Download size={18} /> Exportar JSON
                </button>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/80 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-700">
                            <tr>
                                <th className="p-4 pl-6">Evento</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Detalles</th>
                                <th className="p-4 text-right pr-6">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Cargando registros...</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 pl-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${log.type === 'LOGIN' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            log.type === 'AUDIO_ERROR' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                log.type === 'DB_CORRECTION' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                            }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 font-mono text-xs">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <pre className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded border border-gray-700/50 max-w-md overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </td>
                                    <td className="p-4 text-right pr-6 text-gray-500 text-xs font-mono">
                                        {log.ip || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminLogs;
