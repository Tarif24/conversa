import {
    createMessage,
    getRoomByRoomId,
    updateRoomLastMessage,
    getUserByUserId,
    getUsernameByUserId,
    getMessagesForRoom,
} from '../services/databaseService.js';
import { encryptMessage, decryptMessage } from '../services/messageService.js';

export const sendMessage = async message => {
    try {
        let otherUser = null;
        const result = await getUserByUserId(message.userId);

        if (!result.exists) {
            return {
                success: false,
                message: 'User does not exist ',
            };
        }

        const room = await getRoomByRoomId(message.roomId);

        if (!room.exists) {
            return {
                success: false,
                message: 'Room does not exist ',
                roomExists: false,
            };
        }

        // Encrypt the message before creating it
        const encryptedData = encryptMessage(message.message);

        // Logic to save the message to the database
        const savedMessage = await createMessage({
            ...message,
            message: encryptedData.encrypted,
            iv: encryptedData.iv,
            authTag: encryptedData.authTag,
        });

        await updateRoomLastMessage(message.roomId, savedMessage);

        if (room.room.type === 'direct') {
            otherUser = await getUsernameByUserId(message.userId);
        }

        const decryptedMessage = { ...savedMessage._doc, message: message.message };

        return {
            success: true,
            message: decryptedMessage,
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

export const getMessagesForChat = async roomId => {
    try {
        const messages = await getMessagesForRoom(roomId);

        if (!messages) {
            return {
                success: false,
                message: `Could not get messages for roomId: ${roomId}`,
            };
        }

        // Decrypt messages
        const decryptedMessages = messages.map(msg => {
            const decrypted = decryptMessage({
                encrypted: msg.message,
                iv: msg.iv,
                authTag: msg.authTag,
            });
            return { ...msg._doc, message: decrypted };
        });

        return {
            success: true,
            roomId: roomId,
            messages: decryptedMessages,
            message: `Got messages for roomId: ${roomId}`,
        };
    } catch (error) {
        console.error('controller get messages for chat error:', error);
        const message = 'Failed to get messages for chat: ' + error;
        return { success: false, message: message };
    }
};
