import {
    createMessage,
    getRoomByRoomId,
    updateRoomLastMessage,
    getUserByUserId,
} from "../services/databaseService.js";

export const sendMessage = async (message) => {
    try {
        const result = await getUserByUserId(message.userId);

        if (!result.exists) {
            return {
                success: false,
                message: "User does not exist",
            };
        }

        const room = await getRoomByRoomId(message.roomId);

        if (!room.exists) {
            return {
                success: false,
                message: "Room does not exist",
                roomExists: false,
            };
        }

        // Logic to save the message to the database
        const savedMessage = await createMessage(message);

        await updateRoomLastMessage(message.roomId, savedMessage);

        return {
            success: true,
            message: savedMessage,
            roomExists: true,
            roomName: room.room.roomName,
            sentByUser: result.user.username,
        };
    } catch (error) {
        console.error("send message error:", error);
        const message = "Failed to send message: " + error;
        return { success: false, message: message };
    }
};
