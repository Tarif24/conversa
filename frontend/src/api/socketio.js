// api/socketio.js
import { io } from "socket.io-client";
import EVENTS from "../../../constants/socketEvents.js";

class SocketIOManager {
    constructor() {
        this.socket = null;
        this.url = import.meta.env.VITE_CONVERSA_API_URL;
        this.listeners = new Map(); // eventType -> Set of callbacks
        this.lastEmitted = null;
    }

    // Connect to Socket.IO server
    connect(options = {}) {
        if (this.socket?.connected) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.socket = io(this.url, {
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                ...options,
            });

            // Connection successful
            this.socket.on("connect", () => {
                console.log("Socket.IO connected");
                resolve();
            });

            // Connection error
            this.socket.on("connect_error", (error) => {
                console.error("Socket.IO connection error:", error);
                reject(error);
            });

            // Disconnection
            this.socket.on("disconnect", (reason) => {
                console.log("Socket.IO disconnected:", reason);
            });

            // onAny receives all events and forwards the events to our listeners
            this.socket.onAny((eventType, ...args) => {
                // Skip internal socket.io events
                if (
                    !eventType.startsWith("connect") &&
                    !eventType.startsWith("disconnect")
                ) {
                    this.notifyListeners(
                        eventType,
                        args.length === 1 ? args[0] : args
                    );
                }
            });

            // Actually connect
            this.socket.connect();
        });
    }

    // Send event (with or without data, callback and a token)
    send(eventType, payload = null, callback = null, token = null) {
        this.lastEmitted = { eventType, payload, callback };

        let finalPayload = payload;

        // These events do not need a token
        if (
            eventType !== EVENTS.CONNECT &&
            eventType !== EVENTS.DISCONNECT &&
            eventType !== EVENTS.ERROR &&
            eventType !== EVENTS.USER_LOGIN &&
            eventType !== EVENTS.USER_SIGNUP
        ) {
            finalPayload = { ...payload, token: token };
        }

        if (!this.isConnected()) {
            console.warn("Socket.IO not connected");
            return;
        }

        this.socket.emit(eventType, finalPayload, callback);
    }

    // Subscribe to events by adding them to the listener map and each item in the map has a corresponding set so that each event can have multiple callbacks
    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }

        this.listeners.get(eventType).add(callback);

        // Return unsubscribe function
        return () => {
            this.unsubscribe(eventType, callback);
        };
    }

    // Unsubscribe from events takes that specific callback from the set
    unsubscribe(eventType, callback) {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(eventType);
            }
        }
    }

    // Emit event to all our listeners checks if we have a listener for the event that was forwarded then runs every callback for that event if found
    notifyListeners(eventType, payload) {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error(`Error in listener for ${eventType}:`, error);
                }
            });
        }
    }

    // Check if connected
    isConnected() {
        return this.socket && this.socket.connected;
    }

    // Get connection status
    getConnectionState() {
        if (!this.socket) return "DISCONNECTED";
        return this.socket.connected ? "CONNECTED" : "DISCONNECTED";
    }

    // Join a room (Socket.IO specific)
    joinRoom(roomName) {
        this.socket.emit("join", roomName);
    }

    // Leave a room (Socket.IO specific)
    leaveRoom(roomName) {
        this.socket.emit("leave", roomName);
    }

    // Disconnect
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Clean up
    destroy() {
        this.disconnect();
        this.listeners.clear();
    }
}

// Create singleton instance this instance of the socket manager is sent only not a new one every time
const socketManager = new SocketIOManager();

export default socketManager;
