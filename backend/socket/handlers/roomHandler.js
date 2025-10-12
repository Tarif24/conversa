import EVENTS from "../../../constants/socketEvents.js";
import {
    createChatRoom,
    getUserChats,
    getMessagesForChat,
} from "../../controllers/roomController.js";
import { authentication } from "../middleware/index.js";

class RoomHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        socket.use(authentication(socket));

        socket.on(EVENTS.CREATE_CHAT_ROOM, (room, callback) =>
            this.handleCreateRoom(socket, room, callback)
        );

        socket.on(EVENTS.GET_USER_ROOMS, (user, callback) =>
            this.handleGetUserRooms(socket, user, callback)
        );

        socket.on(EVENTS.SET_ACTIVE_ROOM, (room, callback) =>
            this.handleSetActiveRoom(socket, room, callback)
        );

        socket.on(EVENTS.GET_MESSAGES_FOR_ROOM, (room, callback) =>
            this.handleGetMessagesForRoom(socket, room, callback)
        );
    }

    async handleCreateRoom(socket, room, callback) {
        try {
            const cleanedUserIds = room.users.map((user) => user.userId);

            const finalRoom = {
                ...room,
                users: [...cleanedUserIds, socket.userId],
            };
            const result = await createChatRoom(finalRoom);

            if (result.success) {
                // Wait for all users to join the room
                const joinPromises = finalRoom.users.map(async (userId) => {
                    const userSocket =
                        this.connectionManager.getSocketByUserId(userId);

                    if (userSocket) {
                        await userSocket.join(result.roomId);
                        return { userId, joined: true };
                    }
                    return { userId, joined: false };
                });

                // Wait for all joins to complete
                await Promise.all(joinPromises);

                this.io.to(result.roomId).emit(EVENTS.ROOM_REFRESH, {
                    message: "New room available please refresh rooms",
                });
            }

            if (callback) {
                callback(result);
            } else {
                console.log("No callback provided for user_search event");
            }
        } catch (error) {
            console.error("handle create room error:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.CREATE_ROOM,
                message: "Server error",
            });
        }
    }

    async handleGetUserRooms(socket, user, callback) {
        try {
            const userId = user.userId;
            const result = await getUserChats(userId);

            if (callback) {
                callback(result);
            } else {
                console.log("No callback provided for user_search event");
            }
        } catch (error) {
            console.error("handle get user rooms:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_USER_ROOMS,
                message: "Server error",
            });
        }
    }

    async handleSetActiveRoom(socket, room, callback) {
        try {
            if (room.roomId) {
                callback({ success: false, message: "No roomId provided" });
                return;
            }

            socket.activeRoomId = room.roomId;

            if (callback) {
                callback({
                    success: true,
                    message: `Active roomId set to ${room.roomId}`,
                });
            } else {
                console.log("No callback provided for user_search event");
            }
        } catch (error) {
            console.error("handle get user rooms:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_USER_ROOMS,
                message: "Server error",
            });
        }
    }

    async handleGetMessagesForRoom(socket, room, callback) {
        try {
            if (!room.roomId) {
                callback({ success: false, message: "No roomId provided" });
                return;
            }

            const result = await getMessagesForChat(room.roomId);

            if (callback) {
                callback(result);
            } else {
                console.log("No callback provided for user_search event");
            }
        } catch (error) {
            console.error("handle get messages for room:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_MESSAGES_FOR_ROOM,
                message: "Server error",
            });
        }
    }
}

export default RoomHandler;
