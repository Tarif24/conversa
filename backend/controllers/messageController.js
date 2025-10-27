import {
    createMessage,
    getRoomByRoomId,
    updateRoomLastMessage,
    getUserByUserId,
    getUsernameByUserId,
} from '../services/databaseService.js';

export const sendMessage = async message => {
    try {
        let otherUser = null;
        const result = await getUserByUserId(message.userId);

        if (!result.exists) {
            return {
                success: false,
                message: 'User does not exist',
            };
        }

        const room = await getRoomByRoomId(message.roomId);

        if (!room.exists) {
            return {
                success: false,
                message: 'Room does not exist',
                roomExists: false,
            };
        }

        // Logic to save the message to the database
        const savedMessage = await createMessage(message);

        await updateRoomLastMessage(message.roomId, savedMessage);

        if (room.room.type === 'direct') {
            otherUser = await getUsernameByUserId(message.userId);
        }

        return {
            success: true,
            message: savedMessage,
            roomExists: true,
            roomName: room.room.roomName,
            otherUser: otherUser?.username,
            type: room.room.type,
            sentByUser: result.user.username,
        };
    } catch (error) {
        console.error('send message error:', error);
        const message = 'Failed to send message: ' + error;
        return { success: false, message: message };
    }
};
