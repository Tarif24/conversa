// Manages socket connections and user associations
class ConnectionManager {
    constructor() {
        this.connections = new Map(); // socketId -> {socket, userId, connectedAt}
        this.userSockets = new Map(); // userId -> socketId
        this.typingUsers = new Map(); // roomId -> Map({userId, username})
    }

    addConnection(socket, userId = null) {
        this.connections.set(socket.id, {
            socket,
            userId,
            connectedAt: new Date(),
        });

        if (userId) {
            this.userSockets.set(userId, socket.id);
        }
    }

    addUserIDToConnection(socket, userId) {
        const conn = this.connections.get(socket.id);

        if (conn && userId) {
            this.connections.set(socket.id, { ...conn, userId });
            this.userSockets.set(userId, socket.id);
        } else {
            this.addConnection(socket, userId);
        }
    }

    removeConnection(socketId) {
        const conn = this.connections.get(socketId);
        if (conn?.userId) {
            this.userSockets.delete(conn.userId);
        }
        this.connections.delete(socketId);
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
