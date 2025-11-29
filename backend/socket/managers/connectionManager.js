// Manages socket connections and user associations
class ConnectionManager {
    constructor() {
        this.connections = new Map(); // socketId -> {socket, userId, connectedAt}
        this.userSockets = new Map(); // userId -> socketId
        this.typingUsers = new Map(); // roomId -> Map({userId, username})
        this.onlineUsers = new Map(); // userId -> {username, connectedAt}
        this.pendingDisconnects = new Map(); // userId -> timeoutId

        this.DISCONNECT_DELAY = 3000; // 3 seconds
    }

    addConnection(socket, userId = null, username = null) {
        this.connections.set(socket.id, {
            socket,
            userId,
            connectedAt: new Date(),
        });

        if (userId) {
            this.userSockets.set(userId, socket.id);

            // Cancel any pending disconnect for this user
            if (this.pendingDisconnects.has(userId)) {
                clearTimeout(this.pendingDisconnects.get(userId));
                this.pendingDisconnects.delete(userId);
            }

            const isNewConnection = !this.onlineUsers.has(userId);

            if (isNewConnection) {
                this.onlineUsers.set(userId, {
                    userId: userId,
                    username: username,
                    connectedAt: Date.now(),
                });
            }

            return { isNewConnection, didSendUserId: true };
        }

        return { isNewConnection: false, didSendUserId: false };
    }

    addUserIDToConnection(socket, userId, username) {
        const conn = this.connections.get(socket.id);

        if (conn && userId) {
            this.connections.set(socket.id, { ...conn, userId });
            this.userSockets.set(userId, socket.id);
        } else {
            this.addConnection(socket, userId, username);
        }

        // Cancel any pending disconnect for this user
        if (this.pendingDisconnects.has(userId)) {
            clearTimeout(this.pendingDisconnects.get(userId));
            this.pendingDisconnects.delete(userId);
        }

        const isNewConnection = !this.onlineUsers.has(userId);

        if (isNewConnection) {
            this.onlineUsers.set(userId, {
                userI: userId,
                username: username,
                connectedAt: Date.now(),
            });
        }

        return isNewConnection;
    }

    removeConnection(socketId) {
        const conn = this.connections.get(socketId);
        if (conn?.userId) {
            this.userSockets.delete(conn.userId);

            // Schedule offline status after delay
            return this.scheduleOfflineStatus(conn.userId);
        }
        this.connections.delete(socketId);
        return { userId, wentOffline: false, scheduled: false };
    }

    getSocketByUserId(userId) {
        const socketId = this.userSockets.get(userId);
        return socketId ? this.connections.get(socketId)?.socket : null;
    }

    getUserIdBySocketId(socketId) {
        const conn = this.connections.get(socketId);
        return conn ? conn.userId : null;
    }

    getActiveConnections() {
        return this.connections.size;
    }

    getUsersInRoom(roomId) {
        const usersInRoom = [];
        for (const [socketId, conn] of this.connections) {
            if (conn.socket.rooms.has(roomId) && conn.userId) {
                usersInRoom.push(conn.userId);
            }
        }
        return usersInRoom;
    }

    scheduleOfflineStatus(userId) {
        // If already scheduled, don't schedule again
        if (this.pendingDisconnects.has(userId)) {
            return { userId, wentOffline: false, scheduled: true };
        }

        const timeoutId = setTimeout(() => {
            // Double-check user is still offline (they might have reconnected)
            if (!this.userSockets.has(userId)) {
                this.onlineUsers.delete(userId);
                this.pendingDisconnects.delete(userId);

                // Return callback data for the timeout
                this.handleUserWentOffline(userId);
            } else {
                this.pendingDisconnects.delete(userId);
            }
        }, this.DISCONNECT_DELAY);

        this.pendingDisconnects.set(userId, timeoutId);

        return {
            userId,
            wentOffline: false,
            scheduled: true,
            timeoutId,
        };
    }

    handleUserWentOffline(userId) {
        // This will be called by the timeout
        // We'll need to emit the offline event from here
        // Store a callback to be set by the socket server
        if (this.onOfflineCallback) {
            this.onOfflineCallback(userId);
        }
    }

    setOfflineCallback(callback) {
        this.onOfflineCallback = callback;
    }

    // Manually force user offline (e.g., for logout)
    forceUserOffline(userId) {
        // Cancel any pending disconnects
        if (this.pendingDisconnects.has(userId)) {
            clearTimeout(this.pendingDisconnects.get(userId));
            this.pendingDisconnects.delete(userId);
        }

        // Remove all sockets
        this.connections.delete(this.userSockets.get(userId));
        this.userSockets.delete(userId);
        this.onlineUsers.delete(userId);

        return { userId, wentOffline: true };
    }

    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }

    getOnlineUsers() {
        return Array.from(this.onlineUsers.values());
    }

    getOnlineUsersInRoom(roomMembers) {
        return roomMembers
            .filter(memberId => this.isUserOnline(memberId))
            .map(memberId => this.onlineUsers.get(memberId));
    }

    getAllOnlineStatusForUserRooms(userRooms) {
        const rooms = userRooms.map(room => {
            const onlineMembers = this.getOnlineUsersInRoom(room.users);
            return { ...room, onlineMembers };
        });

        return rooms;
    }

    // TYPING USERS MANAGEMENT
    setUserTypingInRoom(roomId, userId, username) {
        if (!this.typingUsers.has(roomId)) {
            this.typingUsers.set(roomId, new Map());
        }
        this.typingUsers.get(roomId).set(userId, username);
    }

    removeUserTypingInRoom(roomId, userId) {
        if (this.typingUsers.has(roomId)) {
            const usersMap = this.typingUsers.get(roomId);
            usersMap.delete(userId);
            if (usersMap.size === 0) {
                this.typingUsers.delete(roomId);
            }
            return true;
        }
        return false;
    }

    removeUserFromAllTypingRooms(userId) {
        for (const [roomId, usersMap] of this.typingUsers) {
            if (usersMap.has(userId)) {
                usersMap.delete(userId);
                if (usersMap.size === 0) {
                    this.typingUsers.delete(roomId);
                }
            }
        }
    }

    getTypingUsersInRoom(roomId) {
        if (this.typingUsers.has(roomId)) {
            const usersMap = this.typingUsers.get(roomId);
            return Array.from(usersMap.entries()).map(([userId, username]) => ({
                userId,
                username,
            }));
        }
        return [];
    }

    getAllIsTypingRoomsByUserRooms(userRooms) {
        const rooms = userRooms.map(room => {
            if (this.typingUsers.has(room._id.toString())) {
                const typing = this.getTypingUsersInRoom(room._id.toString());
                return { ...room, isTyping: true, typingUsers: typing };
            }
            return { ...room, isTyping: false, typingUsers: [] };
        });

        return rooms;
    }
}

export default ConnectionManager;
