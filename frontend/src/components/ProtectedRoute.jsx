import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authentication';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, isConnected } = useAuth();

    // Wait for auth to finish loading
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    // If not authenticated after loading, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
