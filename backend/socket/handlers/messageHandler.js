import EVENTS from '../../../constants/socketEvents.js';
import {
    sendMessage,
    messageEdit,
    messageDelete,
    getMessagesForChat,
    getMessagesSearch,
} from '../../controllers/messageController.js';

class MessageHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Send message, Edit message, Delete message, Forward message, Basic message retrieval

        socket.on(EVENTS.SEND_MESSAGE, async (message, callback) => {
            await this.handleSendMessage(socket, message, callback);
        });

        socket.on(EVENTS.EDIT_MESSAGE, async (data, callback) => {
            await this.handleEditMessage(socket, data, callback);
        });

        socket.on(EVENTS.DELETE_MESSAGE, async data => {
            await this.handleDeleteMessage(socket, data);
        });

        socket.on(EVENTS.GET_MESSAGES_FOR_ROOM, async (room, callback) => {
            await this.handleGetMessagesForRoom(socket, room, callback);
        });

        socket.on(EVENTS.MESSAGE_SEARCH, async (data, callback) => {
            await this.handleMessageSearch(socket, data, callback);
        });
    }

    async handleSendMessage(socket, message, callback) {
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

                this.io.to(message.roomId).emit(EVENTS.UNREAD_COUNT_INCREMENT, {
                    roomId: message.roomId,
                });
            }

            if (callback) {
                callback(result);
            }
        } catch (error) {
            console.error('handle send message error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.SEND_MESSAGE,
                message: 'Server error',
            });
        }
    }

    async handleEditMessage(socket, data, callback) {
        try {
            const result = await messageEdit(data.messageId, socket.userId, data.newContent);

            if (result.success) {
                this.io.to(data.roomId).emit(EVENTS.ROOM_REFRESH, {
                    message: 'New message sent please refresh rooms',
                });
            }

            if (callback) {
                callback(result);
            }
        } catch (error) {
            console.error('handle edit message error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.EDIT_MESSAGE,
                message: 'Server error',
            });
        }
    }

    async handleDeleteMessage(socket, data) {
        try {
            const result = await messageDelete(data.messageId, socket.userId);

            if (result.success) {
                this.io.to(data.roomId).emit(EVENTS.ROOM_REFRESH, {
                    message: 'New deleted message please refresh rooms',
                });
            }
        } catch (error) {
            console.error('handle delete message error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.DELETE_MESSAGE,
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

    async handleMessageSearch(socket, data, callback) {
        try {
            const result = await getMessagesSearch(data.roomId, data.text);

            if (callback) {
                callback(result);
            }
        } catch (error) {
            console.error('handle message search error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.MESSAGE_SEARCH,
                message: 'Server error',
            });
        }
    }
}

export default MessageHandler;
