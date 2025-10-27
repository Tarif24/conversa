import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authentication';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, isConnected } = useAuth();
    const [didRedirect, setDidRedirect] = useState(false);

    // Wait for auth to finish loading
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#363163] via-[#695ce0] to-[#595C8A]">
                <div className="text-4xl text-white">Loading...</div>
            </div>
        );
    }

    // If not authenticated after loading, redirect to login
    if (!isAuthenticated) {
        if (!didRedirect) {
            toast.info('Not logged in. Redirecting to authentication page...');
            setDidRedirect(true);
        }

        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
