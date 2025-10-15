import {
    createRoom,
    createMessage,
    addRoomToUsers,
    getUserByUserId,
    getRoomByRoomId,
    getMessagesForRoom,
    updateRoomLastMessage,
} from '../services/databaseService.js';

export const createChatRoom = async room => {
    try {
        const finalRoom = {
            ...room,
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

        const message = {
            userId: 'system',
            message: 'New Room',
            roomId: roomId,
        };

        const initialMessage = await createMessage(message);

        updateRoomLastMessage(roomId, initialMessage);

        await addRoomToUsers(roomId, room.users);

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
            const room = await getRoomByRoomId(roomId);

            if (room.exists) {
                rooms.push(room.room);
            }
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

export const getMessagesForChat = async roomId => {
    try {
        const messages = await getMessagesForRoom(roomId);

        if (!messages) {
            return {
                success: false,
                message: `Could not get messages for roomId: ${roomId}`,
            };
        }

        return {
            success: true,
            roomId: roomId,
            messages: messages,
            message: `Got messages for roomId: ${roomId}`,
        };
    } catch (error) {
        console.error('controller get messages for chat error:', error);
        const message = 'Failed to get messages for chat: ' + error;
        return { success: false, message: message };
    }
};
