// hooks/useSocketIO.js
import { useEffect, useState, useCallback } from "react";
import socketManager from "../api/socketio";

// Hook to establish Socket.IO connection
export const useSocketIO = (options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState("DISCONNECTED");

    useEffect(() => {
        // Connect on mount
        socketManager
            .connect(options)
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
    const send = useCallback((eventType, payload, callback) => {
        socketManager.send(eventType, payload, callback);
    }, []);

    // Join room function
    const joinRoom = useCallback((roomName) => {
        socketManager.joinRoom(roomName);
    }, []);

    // Leave room function
    const leaveRoom = useCallback((roomName) => {
        socketManager.leaveRoom(roomName);
    }, []);

    return {
        isConnected,
        connectionState,
        send,
        joinRoom,
        leaveRoom,
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
