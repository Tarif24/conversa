import {
    createRoom,
    createMessage,
    addRoomToUsers,
    getUserByUserId,
    getRoomByRoomId,
    updateRoomLastMessage,
    getUsernameByUserId,
    getLatestMessageForRoom,
    updateReadPosition,
    getUnreadMessages,
    createRoomMember,
    getAllRoomMembersForRoom,
    addRoomToUser,
    addUserToRoom,
    deleteRoomFromUser,
    deleteUserFromRoom,
    deleteRoomMember,
    deleteAllMessagesInRoom,
    deleteAllRoomMemberInRoom,
    deleteRoom,
    getRoomMemberForRoom,
} from '../services/databaseService.js';
import { populateReplyInfo, newSystemMessage } from '../services/messageService.js';
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

        for (const id of newRoom.users) {
            const user = (await getUserByUserId(id)).user;
            if (id === userId) {
                const newOwner = await createRoomMember({
                    roomId: roomId,
                    userId: id,
                    username: user.username,
                    role: 'owner',
                });
            } else {
                const newMember = await createRoomMember({
                    roomId: roomId,
                    userId: id,
                    username: user.username,
                });
            }
        }

        const systemMessage = sentRoom.users.length > 2 ? 'New Group Chat' : 'New Direct Chat';

        await newSystemMessage(roomId, systemMessage);

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
            if (room.message.message !== 'Deleted Message') {
                const decryptedMessage = decryptMessage({
                    encrypted: room.message.message,
                    iv: room.message.iv,
                    authTag: room.message.authTag,
                });
                room.message.message = decryptedMessage;
            }

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

export const setActiveRoom = async (roomId, userId, isFirstOpen = true) => {
    try {
        // Get latest message
        const latestMessage = await getLatestMessageForRoom(roomId, true);
        if (!latestMessage) {
            return {
                success: true,
                unreadMessages: [],
                unreadCount: 0,
            };
        }

        // Update user's read position
        await updateReadPosition(roomId, userId, latestMessage._id);

        // Only fetch unread messages on first open
        let unreadMessages = [];
        if (isFirstOpen) {
            unreadMessages = await getUnreadMessages(roomId, userId);

            // Populate reply parent info for each message
            unreadMessages = await populateReplyInfo(unreadMessages);
        }

        return {
            success: true,
            unreadMessages,
            unreadCount: unreadMessages.length,
            latestMessageId: latestMessage._id,
        };
    } catch (error) {
        console.error('Handle set active room error:', error);
        const message = 'Failed to set users active room: ' + error;
        return { success: false, message: message };
    }
};

export const GetRoomSidebarInfo = async roomId => {
    try {
        const room = await getRoomByRoomId(roomId);

        const roomMembers = await getAllRoomMembersForRoom(roomId);

        return {
            success: true,
            room: room.room,
            roomMembers: roomMembers,
        };
    } catch (error) {
        console.error('Handle get room sidebar info error:', error);
        const message = 'Failed to get room sidebar info: ' + error;
        return { success: false, message: message };
    }
};

export const joinRoom = async (roomId, userId) => {
    try {
        const userAddResult = await addRoomToUser(roomId, userId);

        const roomAddResult = await addUserToRoom(roomId, userId);

        const user = await getUserByUserId(userId);

        const newMember = await createRoomMember({
            roomId: roomId,
            userId: userId,
            username: user.user.username,
        });

        const systemMessage = `${user.user.username} has joined the chat`;

        await newSystemMessage(roomId, systemMessage);
        return {
            success: true,
        };
    } catch (error) {
        console.error('Handle leave room error:', error);
        const message = 'Failed to leave room: ' + error;
        return { success: false, message: message };
    }
};

export const leaveRoom = async (roomId, userId, senderUserId, isKick = false) => {
    try {
        const roomMember = await getRoomMemberForRoom(roomId, userId);
        const senderRoomMember = await getRoomMemberForRoom(roomId, senderUserId);
        const user = await getUserByUserId(userId);
        const room = (await getRoomByRoomId(roomId)).room;

        if (roomMember.role === 'owner' && room.type === 'group') {
            return { success: false, message: 'Owner cant leave room' };
        }

        if (isKick && senderRoomMember.role === 'owner') {
            if (room.users.length === 3 && room.type === 'group') {
                for (const id of room.users) {
                    await deleteRoomFromUser(roomId, id);
                }

                await deleteAllMessagesInRoom(roomId);
                await deleteAllRoomMemberInRoom(roomId);
                await deleteRoom(roomId);

                return {
                    success: true,
                };
            }

            await deleteUserFromRoom(roomId, userId);
            await deleteRoomFromUser(roomId, userId);
            await deleteRoomMember(roomId, userId);

            const systemMessage = `${user.user.username} has been kicked from the chat`;

            await newSystemMessage(roomId, systemMessage);

            return {
                success: true,
            };
        }

        if (room.type === 'direct') {
            for (const id of room.users) {
                await deleteRoomFromUser(roomId, id);
            }

            await deleteAllMessagesInRoom(roomId);
            await deleteAllRoomMemberInRoom(roomId);
            await deleteRoom(roomId);

            return {
                success: true,
            };
        }

        if (room.users.length === 3 && room.type === 'group') {
            for (const id of room.users) {
                await deleteRoomFromUser(roomId, id);
            }

            await deleteAllMessagesInRoom(roomId);
            await deleteAllRoomMemberInRoom(roomId);
            await deleteRoom(roomId);

            return {
                success: true,
            };
        }

        await deleteUserFromRoom(roomId, userId);
        await deleteRoomFromUser(roomId, userId);
        await deleteRoomMember(roomId, userId);

        const systemMessage = `${user.user.username} has left the chat`;

        await newSystemMessage(roomId, systemMessage);

        return {
            success: true,
        };
    } catch (error) {
        console.error('leave room error:', error);
        const message = 'Failed to leave room: ' + error;
        return { success: false, message: message };
    }
};
