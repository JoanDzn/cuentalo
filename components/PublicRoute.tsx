import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService, User } from '../services/authService';

interface PublicRouteProps {
    children: React.ReactNode;
}

/**
 * A wrapper for routes that should only be accessible to unauthenticated users.
 * If a user is authenticated, they are redirected to the dashboard.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
