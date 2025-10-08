import {
    createRoom,
    addRoomToUsers,
    getUserByUserId,
} from "../services/databaseService.js";

export const createChatRoom = async (room) => {
    try {
        const newRoom = await createRoom(room);

        if (!newRoom) {
            return {
                success: false,
                message: "Room was not created",
            };
        }

        const roomId = newRoom._id.toString();

        await addRoomToUsers(roomId, room.users);

        return {
            success: true,
            roomId: roomId,
            message: "New room created",
        };
    } catch (error) {
        console.error("controller create room error:", error);
        const message = "Failed to create room: " + error;
        return { success: false, message: message };
    }
};

export const getUserRooms = async (userId) => {
    try {
        const user = await getUserByUserId(userId);

        if (!user.exists) {
            return {
                success: false,
                exist: false,
                message: "User does not exist",
            };
        }

        return {
            success: true,
            exist: true,
            rooms: user.rooms,
            message: "Got all user rooms",
        };
    } catch (error) {
        console.error("Get user rooms error:", error);
        const message = "Failed to get user rooms: " + error;
        return { success: false, message: message };
    }
};
