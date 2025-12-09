import EVENTS from '../../../constants/socketEvents.js';
import { createChatRoom, getUserChats, setActiveRoom } from '../../controllers/roomController.js';

class RoomHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Group/Private Chat Room Creation, User's Chat Rooms Retrieval, Set Active Room, Member management, Room settings, Permissions

        socket.on(EVENTS.CREATE_CHAT_ROOM, (room, callback) =>
            this.handleCreateRoom(socket, room, callback)
        );

        socket.on(EVENTS.GET_USER_ROOMS, (user, callback) =>
            this.handleGetUserRooms(socket, user, callback)
        );

        socket.on(EVENTS.SET_ACTIVE_ROOM, (room, callback) =>
            this.handleSetActiveRoom(socket, room, callback)
        );
    }

    async handleCreateRoom(socket, room, callback) {
        try {
            const cleanedUserIds = room.users.map(user => user.userId);

            const finalRoom = {
                ...room,
                users: [...cleanedUserIds, socket.userId],
            };
            const result = await createChatRoom(finalRoom, socket.userId);

            if (result.success) {
                // Wait for all users to join the room
                const joinPromises = finalRoom.users.map(async userId => {
                    const userSocket = this.connectionManager.getSocketByUserId(userId);

                    if (userSocket) {
                        await userSocket.join(result.roomId);
                        return { userId, joined: true };
                    }
                    return { userId, joined: false };
                });

                // Wait for all joins to complete
                await Promise.all(joinPromises);

                this.io.to(result.roomId).emit(EVENTS.ROOM_REFRESH, {
                    message: 'New room available please refresh rooms',
                });
            }

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for user_search event');
            }
        } catch (error) {
            console.error('handle create room error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.CREATE_ROOM,
                message: 'Server error',
            });
        }
    }

    async handleGetUserRooms(socket, user, callback) {
        try {
            const userId = user.userId;
            const result = await getUserChats(userId);

            const roomsWithTyping = this.connectionManager.getAllIsTypingRoomsByUserRooms(
                result.rooms
            );

            const roomsWithOnlineStatus =
                this.connectionManager.getAllOnlineStatusForUserRooms(roomsWithTyping);

            const finalResult = {
                ...result,
                rooms: roomsWithOnlineStatus,
            };

            if (callback) {
                callback(finalResult);
            } else {
                console.log('No callback provided for user_search event');
            }
        } catch (error) {
            console.error('handle get user rooms:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_USER_ROOMS,
                message: 'Server error',
            });
        }
    }

    async handleSetActiveRoom(socket, room, callback) {
        try {
            // Check if roomId was sent
            if (!room.roomId) {
                callback({ success: false, message: 'No roomId provided' });
                return;
            }

            const result = await setActiveRoom(room.roomId, socket.userId, true);

            // If setting the active room was a success then set the socket active room send a user read update to everyone in the room and send a user unread to the original socket
            if (result.success) {
                socket.activeRoomId = room.roomId;

                this.io.to(room.roomId.toString()).emit(EVENTS.USER_READ_UPDATE, {
                    roomId: room.roomId,
                    userId: socket.userId,
                    messageId: result.latestMessageId,
                });

                socket.emit(EVENTS.USER_UNREAD_UPDATE, {
                    roomId: room.roomId,
                    count: 0,
                });
            }

            if (callback) {
                callback({
                    success: true,
                    message: `Active roomId set to ${room.roomId}`,
                });
            } else {
                console.log('No callback provided for user_search event');
            }

            const typingUsers = this.connectionManager.getTypingUsersInRoom(room.roomId);

            // If any users are typing in the room the user just joined send a user typing update
            if (typingUsers.length > 0) {
                socket.emit(EVENTS.TYPING_UPDATE, {
                    roomId: room.roomId,
                    typingUsers: typingUsers,
                });
            }
        } catch (error) {
            console.error('handle get user rooms:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_USER_ROOMS,
                message: 'Server error',
            });
        }
    }
}

export default RoomHandler;
