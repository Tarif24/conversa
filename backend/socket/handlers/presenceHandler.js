import EVENTS from '../../constants/socketEvents.js';
import {} from '../../controllers/presenceController.js';

class PresenceHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Last Seen Updates, User Activity Tracking, Typing Indicators

        socket.on(EVENTS.TYPING_START, (data, callback) =>
            this.handleTypingStart(socket, data, callback)
        );

        socket.on(EVENTS.TYPING_STOP, (data, callback) =>
            this.handleTypingStop(socket, data, callback)
        );
    }

    async handleTypingStart(socket, data, callback) {
        try {
            this.connectionManager.setUserTypingInRoom(data.roomId, socket.userId, data.username);

            const typingUsers = this.connectionManager.getTypingUsersInRoom(data.roomId);

            socket.to(data.roomId).emit(EVENTS.TYPING_UPDATE, {
                roomId: data.roomId,
                typingUsers: typingUsers,
            });

            if (callback) {
                callback({ success: true });
            } else {
                console.log('No callback provided for typing_start event');
            }
        } catch (error) {
            console.error('handle typing start:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.TYPING_START,
                message: 'Server error',
            });
        }
    }

    async handleTypingStop(socket, data, callback) {
        try {
            const removed = this.connectionManager.removeUserTypingInRoom(
                data.roomId,
                socket.userId
            );

            const typingUsers = this.connectionManager.getTypingUsersInRoom(data.roomId);

            if (removed) {
                socket.to(data.roomId).emit(EVENTS.TYPING_UPDATE, {
                    roomId: data.roomId,
                    typingUsers: typingUsers,
                });
            }

            if (callback) {
                callback({ success: true });
            } else {
                console.log('No callback provided for typing_stop event');
            }
        } catch (error) {
            console.error('handle typing stop:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.TYPING_STOP,
                message: 'Server error',
            });
        }
    }
}

export default PresenceHandler;
