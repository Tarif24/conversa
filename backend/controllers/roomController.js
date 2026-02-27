import {
    createRoom,
    addRoomToUsers,
    getUserByUserId,
    getRoomByRoomId,
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
    getUnreadCountsForRooms,
} from '../services/databaseService.js';
import { populateReplyInfo, newSystemMessage } from '../services/messageService.js';
import { decryptMessage } from '../services/messageService.js';

export const createChatRoom = async (sentRoom, userId) => {
    try {
        const userResult = await getUserByUserId(userId);

        // Checks if the user length is 2 meaning if its a direct one on one chat than checks the users other rooms to see if another direct chat with this user exists or not (users can only have one direct chat with the same person)
        if (sentRoom.users.length === 2) {
            let doesDirectExist = false;
            // Check if a direct chat already exists
            for (const roomId of userResult.rooms) {
                const result = await getRoomByRoomId(roomId);
                const room = result;
                if (result) {
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

        // Creates the final room object with the type and initial room message
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

        // If creating the room succeeds then a room member object is created and saved to the DB (roomMember objects hold all the room specific data for the user)
        for (const id of newRoom.users) {
            const user = await getUserByUserId(id);
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

        // Sends a initial system message stating chat creation and adds the chat to all users lists
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

        // Checks if user exists
        if (!result) {
            return {
                success: false,
                exists: false,
                message: 'User does not exist',
            };
        }

        const unreadCounts = await getUnreadCountsForRooms(userId, result.rooms);

        // Loops through all the user rooms to decrypt all the last messages sent and set a other user for all direct chats
        for (const roomId of result.rooms) {
            const room = await getRoomByRoomId(roomId);

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
            // Set the other person in the direct chat relative to the user
            if (room) {
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
            const roomFinal = {
                ...room._doc,
                otherUser: userOther,
                unreadCount: unreadCounts[roomId.toString()] || 0,
            };
            rooms.push(roomFinal);
        }

        // Sort all rooms in order of latest message first (system messages do count)
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
        // If the room dose not have a latest message its a new room and nothing needs to be updated when its set as the active room
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
            room: room,
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
        // Adds the room to the users room list and adds the user to the rooms user list
        await addRoomToUser(roomId, userId);
        await addUserToRoom(roomId, userId);

        const user = await getUserByUserId(userId);

        // Creates a new roomMember object for the user to hold all room specific data
        await createRoomMember({
            roomId: roomId,
            userId: userId,
            username: user.username,
        });

        // Sends a system message to the room saying that a new user has joined
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
        // Gets the roomMember objects if the person is getting kicked it gets the member thats getting kicked and the one kicking else just the user that sent the request
        const roomMember = await getRoomMemberForRoom(roomId, userId);
        const senderRoomMember = await getRoomMemberForRoom(roomId, senderUserId);
        const user = await getUserByUserId(userId);
        const room = await getRoomByRoomId(roomId);

        // If it is a leave not a kick it verifies if the person leaving is not a owner
        if (roomMember.role === 'owner' && room.type === 'group') {
            return { success: false, message: 'Owner cant leave room' };
        }

        // If it is a kick we need to verify if the person is the owner
        if (isKick && senderRoomMember.role === 'owner') {
            // If its a room of three to avoid dm conflicts the group chat is deleted
            if (room.users.length === 3 && room.type === 'group') {
                for (const id of room.users) {
                    await deleteRoomFromUser(roomId, id);
                }

                // Deletes all room messages the roomMember objects and then the room itself
                await deleteAllMessagesInRoom(roomId);
                await deleteAllRoomMemberInRoom(roomId);
                await deleteRoom(roomId);

                return {
                    success: true,
                };
            }

            // If its a valid kick and will leave the room with 3 users or more the room is deleted from the user and user is deleted from the room and the roomMember is deleted
            await deleteUserFromRoom(roomId, userId);
            await deleteRoomFromUser(roomId, userId);
            await deleteRoomMember(roomId, userId);

            // A system message is sent to the room stating that the user has been kicked
            const systemMessage = `${user.username} has been kicked from the chat`;
            await newSystemMessage(roomId, systemMessage);

            return {
                success: true,
            };
        }

        // If the person is leaving and its a direct chat it will delete the chat and all messages
        if (room.type === 'direct') {
            for (const id of room.users) {
                await deleteRoomFromUser(roomId, id);
            }

            // Delete all messages, roomMembers and then the room
            await deleteAllMessagesInRoom(roomId);
            await deleteAllRoomMemberInRoom(roomId);
            await deleteRoom(roomId);

            return {
                success: true,
            };
        }

        // If its a leave and a room of three to avoid dm conflicts the group chat is deleted
        if (room.users.length === 3 && room.type === 'group') {
            for (const id of room.users) {
                await deleteRoomFromUser(roomId, id);
            }

            // Delete all messages, roomMembers and then the room
            await deleteAllMessagesInRoom(roomId);
            await deleteAllRoomMemberInRoom(roomId);
            await deleteRoom(roomId);

            return {
                success: true,
            };
        }

        // If its a valid leave and will leave the room with 3 users or more the room is deleted from the user and user is deleted from the room and the roomMember is deleted
        await deleteUserFromRoom(roomId, userId);
        await deleteRoomFromUser(roomId, userId);
        await deleteRoomMember(roomId, userId);

        // A system message is sent to the room stating that the user has left
        const systemMessage = `${user.username} has left the chat`;
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
