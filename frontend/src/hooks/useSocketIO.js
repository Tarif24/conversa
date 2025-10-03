// hooks/useSocketIO.js
import { useEffect, useState, useCallback, use } from "react";
import socketManager from "../api/socketio";
import { useAuth } from "../contexts/Authentication";
import EVENTS from "../../../constants/socketEvents";

// Hook to establish Socket.IO connection
export const useSocketIO = (options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState("DISCONNECTED");
    const {
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        refreshAccessToken,
        accessToken,
        refreshToken,
    } = useAuth();

    useEffect(() => {
        // Connect on mount
        socketManager
            .connect({ auth: { token: accessToken }, ...options })
            .then(() => {
                setIsConnected(true);
                setConnectionState("CONNECTED");
            })
            .catch(() => {
                setIsConnected(false);
                setConnectionState("DISCONNECTED");
            });

        // Check connection status periodically
        const checkConnection = setInterval(() => {
            const connected = socketManager.isConnected();
            const state = socketManager.getConnectionState();

            setIsConnected(connected);
            setConnectionState(state);
        }, 1000);

        return () => {
            clearInterval(checkConnection);
        };
    }, []);

    // Send event function
    const sendProtected = useCallback(
        (eventType, payload, callback) => {
            socketManager.send(eventType, payload, callback, accessToken);
        },
        [accessToken, refreshToken]
    );

    // Join room function
    const joinRoom = useCallback((roomName) => {
        socketManager.joinRoom(roomName);
    }, []);

    // Leave room function
    const leaveRoom = useCallback((roomName) => {
        socketManager.leaveRoom(roomName);
    }, []);

    // Login
    const sendLogin = useCallback((payload, callback) => {
        socketManager.send(EVENTS.USER_LOGIN, payload, (response) => {
            login(response);
            callback(response);
        });
    }, []);

    // Signup
    const sendSignup = useCallback((payload, callback) => {
        socketManager.send(EVENTS.USER_SIGNUP, payload, (response) => {
            signup(response);
            callback(response);
        });
    }, []);

    // Logout
    const sendLogout = useCallback((payload, callback) => {
        socketManager.send(EVENTS.USER_LOGOUT, payload, (response) => {
            logout();
            if (callback) callback(response);
        });
    }, []);

    // Refresh Token
    const sendRefresh = useCallback(
        (callback) => {
            socketManager.send(
                EVENTS.USER_REFRESH_TOKEN,
                {},
                (response) => {
                    refreshAccessToken(response, () => {
                        send(EVENTS.USER_LOGOUT, {
                            token: refreshToken,
                        });
                    });

                    if (callback) callback(response);
                },
                refreshToken
            );
        },
        [refreshToken]
    );

    const sendLastEmitted = useCallback(() => {
        if (socketManager.lastEmitted) {
            const { eventType, payload, callback } = socketManager.lastEmitted;
            socketManager.send(eventType, payload, callback, accessToken);
        }
    });

    // Auto-refresh token every 10 minutes
    useEffect(() => {
        if (!isAuthenticated || !refreshToken) return;

        const interval = setInterval(
            () => {
                socketManager.send(
                    EVENTS.USER_REFRESH_TOKEN,
                    {},
                    (response) => {
                        refreshAccessToken(response, () => {
                            send(EVENTS.USER_LOGOUT, {
                                token: refreshToken,
                            });
                        });
                    },
                    refreshToken
                );
            },
            1 * 30 * 1000
        ); // 10 minutes

        return () => clearInterval(interval);
    }, [isAuthenticated, refreshToken]);

    return {
        isConnected,
        connectionState,
        sendProtected,
        joinRoom,
        leaveRoom,
        sendLogin,
        sendSignup,
        sendLogout,
        sendRefresh,
        sendLastEmitted,
        user,
        isAuthenticated,
    };
};

// Hook to subscribe to specific events
export const useSocketIOEvent = (eventType, callback) => {
    useEffect(() => {
        if (!eventType || !callback) return;

        // Subscribe to event
        const unsubscribe = socketManager.subscribe(eventType, callback);

        // Cleanup on unmount or dependency change
        return unsubscribe;
    }, [eventType, callback]);
};

// Hook to listen for events and maintain state
export const useSocketIOState = (eventType, initialValue = null) => {
    const [data, setData] = useState(initialValue);

    useSocketIOEvent(
        eventType,
        useCallback((payload) => {
            setData(payload);
        }, [])
    );

    return data;
};
