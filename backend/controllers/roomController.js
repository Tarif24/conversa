import {
    createRoom,
    createMessage,
    addRoomToUsers,
    getUserByUserId,
    getRoomByRoomId,
    updateRoomLastMessage,
    getUsernameByUserId,
} from '../services/databaseService.js';
import { encryptMessage, decryptMessage } from '../services/messageService.js';

export const createChatRoom = async (sentRoom, userId) => {
    try {
        const userResult = await getUserByUserId(userId);
        if (sentRoom.users.length === 2) {
            let doesDirectExist = false;
            // Check if a direct chat already exists
            for (const roomId of userResult.user.rooms) {
                const result = await getRoomByRoomId(roomId);
                const room = result.room;
                if (result.exists) {
                    if (room.type === 'direct') {
                        const other = room.users.find(u => u !== userId);

                        if (sentRoom.users.find(u => u === other)) {
                            doesDirectExist = true;
                        }
                    }
                }
            }

            if (doesDirectExist) {
                return {
                    success: false,
                    doesDirectExist: true,
                    message: 'Direct chat already exists',
                };
            }
        }

        const type = sentRoom.users.length > 2 ? 'group' : 'direct';
        const finalRoom = {
            ...sentRoom,
            type: type,
            message: { userId: 'system', message: 'New Room' },
        };
        const newRoom = await createRoom(finalRoom);

        if (!newRoom) {
            return {
                success: false,
                message: 'Room was not created',
            };
        }

        const roomId = newRoom._id.toString();

        const systemMessage = sentRoom.users.length > 2 ? 'New Group Chat' : 'New Direct Chat';

        const encryptedData = encryptMessage(systemMessage);

        const message = {
            userId: 'system',
            roomId: roomId,
            username: 'SYSTEM',
            message: encryptedData.encrypted,
            iv: encryptedData.iv,
            authTag: encryptedData.authTag,
        };

        const initialMessage = await createMessage(message);

        updateRoomLastMessage(roomId, initialMessage);

        await addRoomToUsers(roomId, sentRoom.users);

        return {
            success: true,
            roomId: roomId,
            message: 'New room created',
        };
    } catch (error) {
        console.error('controller create room error:', error);
        const message = 'Failed to create room: ' + error;
        return { success: false, message: message };
    }
};

export const getUserChats = async userId => {
    try {
        const result = await getUserByUserId(userId);
        let rooms = [];

        if (!result.exists) {
            return {
                success: false,
                exists: false,
                message: 'User does not exist',
            };
        }

        for (const roomId of result.user.rooms) {
            const result = await getRoomByRoomId(roomId);
            const room = result.room;

            // Decrypt the last message
            const decryptedMessage = decryptMessage({
                encrypted: room.message.message,
                iv: room.message.iv,
                authTag: room.message.authTag,
            });
            room.message.message = decryptedMessage;

            let userOther = '';
            if (result.exists) {
                if (room.type === 'direct') {
                    const other = room.users.find(u => u !== userId);
                    if (other) {
                        const resp = await getUsernameByUserId(other);
                        userOther = resp?.username || 'Unknown';
                    } else {
                        userOther = 'Unknown';
                    }
                } else {
                    userOther = 'group';
                }
            }
            const roomFinal = { ...room._doc, otherUser: userOther };
            rooms.push(roomFinal);
        }

        const roomsSorted = rooms.sort((a, b) => {
            const dateA = a.message.updatedAt ? new Date(a.message.updatedAt) : new Date(0);
            const dateB = b.message.updatedAt ? new Date(b.message.updatedAt) : new Date(0);
            return dateB - dateA;
        });

        return {
            success: true,
            exists: true,
            rooms: roomsSorted,
            message: 'Got all user rooms',
        };
    } catch (error) {
        console.error('Handle get user rooms error:', error);
        const message = 'Failed to get user rooms: ' + error;
        return { success: false, message: message };
    }
};
