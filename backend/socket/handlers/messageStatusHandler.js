import EVENTS from '../../constants/socketEvents.js';
import {
    getUserUnreadCount,
    getUserUnreadCountsForRooms,
    updateUserReadPosition,
} from '../../controllers/messageStatusController.js';

class MessageStatusHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Delivery receipts, Read receipts, Message failed status

        socket.on(EVENTS.GET_UNREAD_COUNT, async (data, callback) => {
            await this.handleGetUnreadCount(socket, data, callback);
        });

        socket.on(EVENTS.GET_UNREAD_COUNTS, async (data, callback) => {
            await this.handleGetUnreadCounts(socket, data, callback);
        });

        socket.on(EVENTS.MARK_AS_READ, async (data, callback) => {
            await this.handleMarkAsRead(socket, data, callback);
        });
    }

    async handleGetUnreadCount(socket, data, callback) {
        try {
            const result = await getUserUnreadCount(data.roomId, socket.userId);

            if (callback) {
                callback(result);
            }
        } catch (error) {
            console.error('handle get unread count error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_UNREAD_COUNT,
                message: 'Server error',
            });
        }
    }

    async handleGetUnreadCounts(socket, data, callback) {
        try {
            const result = await getUserUnreadCountsForRooms(socket.userId, data.roomIds);

            if (callback) {
                callback(result);
            }
        } catch (error) {
            console.error('handle get unread counts error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_UNREAD_COUNTS,
                message: 'Server error',
            });
        }
    }

    async handleMarkAsRead(socket, data, callback) {
        try {
            const result = await updateUserReadPosition(data.roomId, socket.userId, data.messageId);

            if (result.success) {
                this.io.to(data.roomId.toString()).emit(EVENTS.USER_READ_UPDATE, {
                    roomId: data.roomId,
                    userId: socket.userId,
                    messageId: data.latestMessageId,
                });
            }

            if (callback) {
                callback({ ...result, message: 'success' });
            }
        } catch (error) {
            console.error('handle mark as read error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.MARK_AS_READ,
                message: 'Server error',
            });
        }
    }
}

export default MessageStatusHandler;
