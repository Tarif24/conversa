import EVENTS from "../../../constants/socketEvents.js";
import {
    createChatRoom,
    getUserRooms,
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
                for (const userId of finalRoom.users) {
                    const userSocket =
                        this.connectionManager.getSocketByUserId(userId);

                    if (userSocket) {
                        userSocket.join(result.roomId);
                    }
                }
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
            const userId = user._id.toString();
            const result = getUserRooms(userId);

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
}

export default RoomHandler;
