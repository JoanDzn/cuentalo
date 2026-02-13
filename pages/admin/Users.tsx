import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Trash2, Edit, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiUrl } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', isActive: true });

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const BASE_URL = getApiUrl();
            const res = await fetch(`${BASE_URL}/api/admin/users?page=${page}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                // Support both { users: [], pagination: {} } and direct [] formats
                const usersList = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
                setUsers(usersList);
                setTotalPages(data.pagination?.pages || 1);
            } else {
                console.error("API Error:", data.message);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
        const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return emailMatch || nameMatch;
    });

    const openEditModal = (user) => {
        setCurrentUser(user);
        setEditForm({ name: user.name || '', email: user.email, isActive: user.isActive !== false }); // default true if undefined
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!currentUser) return;
        try {
            const token = localStorage.getItem('admin_token');
            const BASE_URL = getApiUrl();
            const res = await fetch(`${BASE_URL}/api/admin/users/${currentUser._id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                fetchUsers();
                setIsEditOpen(false);
            } else {
                alert("Error updating user");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("¿Estás seguro de eliminar este usuario y TODOS sus datos? Esta acción no se puede deshacer.")) return;

        try {
            const token = localStorage.getItem('admin_token');
            const BASE_URL = getApiUrl();
            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchUsers();
            } else {
                alert("Error deleting user");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const exportToCSV = () => {
        const headers = ["ID", "Name", "Email", "Role", "Active", "Created At"];
        const rows = users.map(user => [
            user._id,
            user.name || "N/A",
            user.email,
            user.role,
            user.isActive ? "Yes" : "No",
            new Date(user.createdAt).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
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
                {/* ... header content ... */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                    <p className="text-gray-400">Administra cuentas y permisos</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors border border-gray-600"
                >
                    <Download size={18} /> Exportar CSV
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    className="w-full bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="p-4 pl-6">Usuario</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Registro</th>
                                <th className="p-4 text-right pr-6">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            <p className="text-gray-500">Cargando lista de usuarios...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500">
                                        {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados.'}
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{user.name || 'Sin Nombre'}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive !== false ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                            {user.isActive !== false ? 'Activo' : 'Suspendido'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-2 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft />
                    </button>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Página {page} de {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="p-2 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-700">
                                <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                                    <span className="text-gray-300">Cuenta Activa</span>
                                    <button
                                        onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${editForm.isActive ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${editForm.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800/50">
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminUsers;
