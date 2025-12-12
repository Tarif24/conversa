import {
    createMessage,
    getRoomByRoomId,
    updateRoomLastMessage,
    getUserByUserId,
    getUsernameByUserId,
    getMessagesForRoom,
    getMessageById,
    updateReadPosition,
    incrementUnreadForOthers,
    editMessage,
    deleteMessage,
    populateRoomMemberReadStatus,
    populateRoomMemberReadStatusSingleMessage,
    messageSearch,
} from '../services/databaseService.js';
import {
    encryptMessage,
    decryptMessage,
    addReplyInfo,
    populateReplyInfo,
} from '../services/messageService.js';

export const sendMessage = async message => {
    try {
        let otherUser = null;
        const result = await getUserByUserId(message.userId);

        // User existence check
        if (!result.exists) {
            return {
                success: false,
                message: 'User does not exist ',
            };
        }

        const room = await getRoomByRoomId(message.roomId);

        // Room existence check
        if (!room.exists) {
            return {
                success: false,
                message: 'Room does not exist ',
                roomExists: false,
            };
        }

        // Validate reply parent exists if provided
        if (message.replyToId) {
            const parentMessage = await getMessageById(message.replyToId);
            if (!parentMessage) {
                return {
                    success: false,
                    error: 'Reply parent message not found',
                };
            }
        }

        // Encrypt the message before creating it
        const encryptedData = encryptMessage(message.message);

        // Logic to save the message to the database
        const savedMessage = await createMessage({
            ...message,
            username: result.user.username,
            message: encryptedData.encrypted,
            iv: encryptedData.iv,
            authTag: encryptedData.authTag,
        });

        await updateRoomLastMessage(message.roomId, savedMessage);

        // If its a direct message then the otherUser is needed otherwise null
        if (room.room.type === 'direct') {
            otherUser = await getUsernameByUserId(message.userId);
        }

        const decryptedMessage = { ...savedMessage._doc, message: message.message };

        // Mark as read by sender immediately
        await updateReadPosition(message.roomId, message.userId, decryptedMessage._id);

        // Increment unread count for other room members
        await incrementUnreadForOthers(message.roomId, message.userId);

        // Prepare message with reply info for response
        const messageWithReply = await addReplyInfo(decryptedMessage);

        const messageWithReadStatus =
            await populateRoomMemberReadStatusSingleMessage(decryptedMessage);

        return {
            success: true,
            message: messageWithReadStatus,
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

            if (!msg.isDeleted) {
                return { ...msg._doc, message: decrypted };
            }
            return { ...msg._doc, message: 'DELETED MESSAGE' };
        });

        const messagesWithReply = await populateReplyInfo(decryptedMessages);

        const messageWithReadStatus = await populateRoomMemberReadStatus(messagesWithReply, roomId);

        return {
            success: true,
            roomId: roomId,
            messages: messageWithReadStatus,
            message: `Got messages for roomId: ${roomId}`,
        };
    } catch (error) {
        console.error('controller get messages for chat error:', error);
        const message = 'Failed to get messages for chat: ' + error;
        return { success: false, message: message };
    }
};

export const messageEdit = async (messageId, userId, newContent) => {
    try {
        const message = await editMessage(messageId, newContent, userId);

        return {
            success: true,
            message: message.toObject(),
        };
    } catch (error) {
        console.error('controller message edit:', error);
        const message = 'Failed to edit message: ' + error;
        return { success: false, message: message };
    }
};

export const messageDelete = async (messageId, userId) => {
    try {
        // Soft deletes the message
        const message = await deleteMessage(messageId, userId);

        if (!message.success) {
            return message;
        }

        return {
            success: true,
            messageId: message.message._id,
        };
    } catch (error) {
        console.error('controller delete message error:', error);
        const message = 'Failed to delete message: ' + error;
        return { success: false, message: message };
    }
};

export const getMessagesSearch = async (roomId, query) => {
    try {
        if (query.text === '') return { success: false, message: 'No text provided' };

        const result = await messageSearch(roomId, query.text);

        if (!result.foundMessages) {
            return {
                success: false,
                userList: [{ message: 'No messages found' }],
                foundMessages: false,
                message: 'No messages found',
            };
        }

        return {
            success: true,
            userList: result.list,
            foundUsers: true,
            message: 'Found Users',
        };
    } catch (error) {
        console.error('user search error:', error);
        const message = 'Failed to user search: ' + error;
        return { success: false, message: message };
    }
};
