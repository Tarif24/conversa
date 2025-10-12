import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";

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
            const parsedUser = JSON.parse(savedUser);

            setAccessToken(savedAccessToken);
            setRefreshToken(savedRefreshToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    // Clear auth helper
    const clearAuth = useCallback(() => {
        console.log("clearAuth");
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    }, []);

    // Login function to save auth
    const login = useCallback(async (response) => {
        console.log("login");
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
    }, []);

    // Signup function to save auth
    const signup = useCallback(async (response) => {
        console.log("signup");
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
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        clearAuth();
    }, [clearAuth]);

    // Refresh token function to update access token
    const refreshAccessToken = useCallback(
        async (response, logoutEmit) => {
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
        },
        [refreshToken, logout]
    );

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
