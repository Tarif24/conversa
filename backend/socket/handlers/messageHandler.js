import EVENTS from '../../../constants/socketEvents.js';
import { sendMessage, getMessagesForChat } from '../../controllers/messageController.js';

class MessageHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Send message, Edit message, Delete message, Forward message, Basic message retrieval

        socket.on(EVENTS.SEND_MESSAGE, message => this.handleSendMessage(socket, message));

        socket.on(EVENTS.GET_MESSAGES_FOR_ROOM, (room, callback) =>
            this.handleGetMessagesForRoom(socket, room, callback)
        );
    }

    async handleSendMessage(socket, message) {
        try {
            console.log('user with socket ID:', socket.userId, 'sent a message');

            const result = await sendMessage(message);

            if (!result.success) {
                socket.emit(EVENTS.ERROR, {
                    event: EVENTS.SEND_MESSAGE,
                    message: result.message,
                });
                return;
            }

            if (result.roomExists) {
                socket.broadcast.to(message.roomId).emit(EVENTS.RECEIVE_MESSAGE, result);

                this.io.to(message.roomId).emit(EVENTS.ROOM_REFRESH, {
                    message: 'New message sent please refresh rooms',
                });
            }
        } catch (error) {
            console.error('handle send message error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.SEND_MESSAGE,
                message: 'Server error',
            });
        }
    }

    async handleGetMessagesForRoom(socket, room, callback) {
        try {
            if (!room.roomId) {
                callback({ success: false, message: 'No roomId provided' });
                return;
            }

            const result = await getMessagesForChat(room.roomId);

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for user_search event');
            }
        } catch (error) {
            console.error('handle get messages for room:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_MESSAGES_FOR_ROOM,
                message: 'Server error',
            });
        }
    }
}

export default MessageHandler;
