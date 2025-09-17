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
