import React, { useEffect, useState } from 'react';
import { ToggleLeft, ToggleRight, Save, MessageSquare } from 'lucide-react';
import { getApiUrl } from '../../config/api';

const AdminSettings = () => {
    const [config, setConfig] = useState({ maintenanceMode: false, appVersion: '', systemMessage: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const BASE_URL = getApiUrl();
                const token = localStorage.getItem('admin_token');
                const res = await fetch(`${BASE_URL}/api/admin/config`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setConfig(data);
            } catch (error) {
                console.error("Error fetching config", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        try {
            const BASE_URL = getApiUrl();
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${BASE_URL}/api/admin/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });
            if (res.ok) alert('Configuración guardada correctamente');
            else alert('Error al guardar configuración');
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    };

    if (loading) return <div className="p-8 text-white">Cargando configuración...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Configuración del Sistema</h1>

            <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-gray-700 shadow-xl space-y-8">

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-700">
                    <div>
                        <h3 className="text-xl font-bold text-white">Modo Mantenimiento</h3>
                        <p className="text-gray-400 mt-1">Desactiva el acceso a la app para usuarios normales. Solo administradores podrán ingresar.</p>
                    </div>
                    <button
                        onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                        className={`transition-all duration-300 transform hover:scale-110 ${config.maintenanceMode ? 'text-red-500' : 'text-gray-500'}`}
                    >
                        {config.maintenanceMode ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                    </button>
                </div>

                {/* App Version */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Versión de la App</label>
                    <input
                        type="text"
                        value={config.appVersion}
                        onChange={(e) => setConfig({ ...config, appVersion: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="v1.0.0"
                    />
                    <p className="text-xs text-gray-500 mt-2">Versión actual desplegada en producción.</p>
                </div>

                {/* Global System Message */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={18} className="text-blue-400" />
                        <label className="block text-sm font-medium text-gray-400">Mensaje Global del Sistema</label>
                    </div>
                    <textarea
                        value={config.systemMessage}
                        onChange={(e) => setConfig({ ...config, systemMessage: e.target.value })}
                        rows={3}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        placeholder="Escribe un mensaje importante para todos los usuarios (ej. 'Mantenimiento programado para esta noche')..."
                    />
                    <p className="text-xs text-gray-500 mt-2">Este mensaje aparecerá en el dashboard de todos los usuarios activos.</p>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-700">
                    <button
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        Guardar Cambios del Sistema
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminSettings;
