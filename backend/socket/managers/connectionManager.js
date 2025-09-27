// Manages socket connections and user associations
class ConnectionManager {
    constructor() {
        this.connections = new Map(); // socketId -> {socket, userId, connectedAt}
        this.userSockets = new Map(); // userId -> socketId
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
}

export default ConnectionManager;
