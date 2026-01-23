import { getUser, getAllUserRooms } from '../../controllers/connectionController.js';
import EVENTS from '../../../constants/socketEvents.js';

class ConnectionHandler {
    constructor(io, connectionManager, logManager) {
        this.io = io;
        this.connectionManager = connectionManager;
        this.logManager = logManager;

        connectionManager.setOfflineCallback(async userId => {
            const result = await getAllUserRooms(userId);

            if (!result.success) {
                return;
            }

            result.rooms.forEach(room => {
                io.to(room._id.toString()).emit(EVENTS.USER_STATUS_UPDATE, {
                    userId,
                    status: 'offline',
                });
            });
        });
    }
    handleConnection(socket) {
        // Connection, Disconnection, Reconnection

        socket.on(EVENTS.DISCONNECT, user => this.handleDisconnect(socket, user));

        socket.on(EVENTS.USER_RECONNECT, (user, callback) =>
            this.handleUserReconnect(socket, user, callback)
        );

        socket.on(EVENTS.ERROR, error => {
            console.error('Socket error for', socket.id, ':', error);
        });
    }

    async handleDisconnect(socket, user) {
        try {
            this.logManager.connection(socket.id, socket.userId || 'N/A', 'DISCONNECTION');
            // Notify all user rooms about the disconnection

            this.connectionManager.removeUserFromAllTypingRooms(socket.userId);
            this.connectionManager.removeConnection(socket.id);
        } catch (error) {
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.DISCONNECT,
                message: 'Server error',
            });
        }
    }

    async handleUserReconnect(socket, user, callback) {
        try {
            const result = await getUser(user.userId);

            if (!result.success) {
                if (callback) {
                    callback({
                        success: false,
                        message: 'User not found could not be reconnected',
                    });
                }
                return;
            }

            this.connectionManager.addConnection(socket, user.userId);

            // Join all existing user rooms on login
            for (const room of result.user.rooms) {
                socket.join(room);
            }

            if (callback) {
                callback(result);
            }
        } catch (error) {
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_RECONNECT,
                message: 'Server error',
            });
        }
    }
}

export default ConnectionHandler;
