import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved tokens and create authenticated socket
    useEffect(() => {
        const savedAccessToken = localStorage.getItem("accessToken");
        const savedRefreshToken = localStorage.getItem("refreshToken");
        const savedUser = localStorage.getItem("user");

        if (savedAccessToken && savedRefreshToken && savedUser) {
            setAccessToken(savedAccessToken);
            setRefreshToken(savedRefreshToken);
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    // Clear auth helper
    const clearAuth = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    };

    // Login function
    const login = async (response) => {
        setIsLoading(true);

        try {
            if (response.success) {
                setAccessToken(response.accessToken);
                setRefreshToken(response.refreshToken);
                setUser(response.user);
                setIsAuthenticated(true);

                localStorage.setItem("accessToken", response.accessToken);
                localStorage.setItem("refreshToken", response.refreshToken);
                localStorage.setItem("user", JSON.stringify(response.user));

                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    // Register function
    const signup = async (response) => {
        setIsLoading(true);

        try {
            if (response.success) {
                setAccessToken(response.accessToken);
                setRefreshToken(response.refreshToken);
                setUser(response.user);
                setIsAuthenticated(true);

                localStorage.setItem("accessToken", response.accessToken);
                localStorage.setItem("refreshToken", response.refreshToken);
                localStorage.setItem("user", JSON.stringify(response.user));

                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    // Refresh token function
    const refreshAccessToken = async (response, logoutEmit) => {
        if (!refreshToken) return;

        try {
            if (response.success) {
                setAccessToken(response.accessToken);
                localStorage.setItem("accessToken", response.accessToken);
            }

            return response.accessToken;
        } catch (error) {
            console.error("Token refresh failed:", error);
            logout();
            logoutEmit();
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        clearAuth();
    };

    // All context data being sent
    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        refreshAccessToken,
        accessToken,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// Simple hook to use auth
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
