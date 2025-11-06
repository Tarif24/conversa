import { getUser } from '../../controllers/connectionController.js';
import EVENTS from '../../../constants/socketEvents.js';
import { authentication } from '../middleware/index.js';

class ConnectionHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }
    handleConnection(socket) {
        socket.use(authentication(socket));

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
            console.log('user with socket ID:', socket.id, 'disconnected');

            // Notify all user rooms about the disconnection

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
            console.log('user with socket ID:', socket.userEmail, 'reconnected');

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
