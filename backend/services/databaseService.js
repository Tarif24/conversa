import { User, Message, File, Room, RefreshToken, RoomMember } from '../database/models/index.js';
import { encryptMessage, decryptMessage } from './messageService.js';

// User Services
export const createUser = async userData => {
    const user = await User.create(userData);
    return user;
};

export const getUserByEmail = async email => {
    const user = await User.findOne({ email: email });
    if (user) {
        return { success: true, exists: true, user: user };
    }
    return { success: true, exists: false };
};

export const getUserByUsername = async username => {
    const user = await User.findOne({ username: username });
    if (user) {
        return { success: true, exists: true, user: user };
    }
    return { success: true, exists: false };
};

export const getUserByUserId = async userId => {
    const user = await User.findById(userId);
    if (user) {
        return { success: true, exists: true, user: user };
    }
    return { success: true, exists: false };
};

export const getUsersByUsernameSearch = async (usernameQuery, excludeUserIds = []) => {
    const users = await User.find({
        _id: { $nin: excludeUserIds },
        username: {
            $regex: usernameQuery,
            $options: 'i', // case-insensitive
        },
    }).limit(10);

    if (users && users.length !== 0) {
        return { success: true, list: users, foundUsers: true };
    } else {
        return { success: true, foundUsers: false };
    }
};

export const addRoomToUser = async (roomId, userId) => {
    const result = await User.updateOne({ _id: userId }, { $push: { rooms: roomId } });

    return result;
};

export const deleteRoomFromUser = async (roomId, userId) => {
    const result = await User.updateOne({ _id: userId }, { $pull: { rooms: roomId } });

    return result;
};

export const addRoomToUsers = async (roomId, userIds = []) => {
    const result = await User.updateMany({ _id: { $in: userIds } }, { $push: { rooms: roomId } });

    return result;
};

export const getUsernameByUserId = async userId => {
    const user = await User.findById(userId);
    if (user) {
        return { success: true, exists: true, username: user.username };
    }
    return { success: true, exists: false };
};

// Message Services
export const createMessage = async messageData => {
    let finalMessageData = messageData;

    if (!messageData.replyToId) {
        finalMessageData = { ...messageData, replyToId: null };
    }

    const message = await Message.create(messageData);
    return message;
};

export const deleteAllMessagesInRoom = async roomId => {
    const result = Message.deleteMany({ roomId });

    return result;
};

export const getMessagesForRoom = async roomId => {
    const result = await Message.find({ roomId: roomId }).limit(50).sort({
        createdAt: 1,
    });

    return result;
};

export const getLatestMessageForRoom = async (roomId, includingDeleted = false) => {
    if (includingDeleted) {
        return await Message.findOne({ roomId }).sort({ createdAt: -1 }).limit(1);
    }

    return await Message.findOne({ roomId, isDeleted: false }).sort({ createdAt: -1 }).limit(1);
};

export const getMessageById = async messageId => {
    return await Message.findById(messageId).lean();
};

export const editMessage = async (messageId, newContent, userId) => {
    // Could use findbyid but with the addition of userId you can make sure that the person editing the message is the person who sent it
    const message = await Message.findOne({ _id: messageId, userId });

    if (!message) {
        throw new Error('Message not found or unauthorized');
    }

    const room = await Room.findOne({ _id: message.roomId });
    const encryptedMessage = encryptMessage(newContent);

    message.message = encryptedMessage.encrypted;
    message.iv = encryptedMessage.iv;
    message.authTag = encryptedMessage.authTag;
    message.isEdited = true;
    message.editedAt = new Date();

    const savedMessage = await message.save();

    if (messageId === room.message._id.toString()) {
        room.message = savedMessage;
        await room.save();
    }

    return savedMessage;
};

export const deleteMessage = async (messageId, userId) => {
    const message = await Message.findOne({ _id: messageId, userId });
    const room = await getRoomByRoomId(message.roomId);

    if (message.isDeleted) {
        return { success: false, message: 'Already Deleted' };
    }

    if (!message) {
        throw new Error('Message not found or unauthorized');
    }

    if (messageId === room.room.message._id.toString()) {
        const res = await updateRoomLastMessage(message.roomId, {
            ...message._doc,
            message: 'Deleted Message',
        });
    }
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;

    const savedMessage = await message.save();

    return { message: savedMessage, success: true };
};

export const messageSearch = async (roomId, query) => {
    const messages = await Message.find({
        roomId: roomId,
        isDeleted: false,
    })
        .sort({ timeStamp: -1 })
        .limit(500) // Limit for performance
        .lean();

    const results = [];
    for (const msg of messages) {
        try {
            const decrypted = decryptMessage({
                encrypted: msg.message,
                iv: msg.iv,
                authTag: msg.authTag,
            });
            if (decrypted.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    ...msg,
                    message: decrypted, // Return decrypted
                });
            }
        } catch (err) {
            // Skip messages that fail to decrypt
            continue;
        }
    }

    if (results.length === 0) {
        return { success: false, foundMessages: false };
    }

    return { success: true, foundMessages: true, list: results };
};

// File Services
export const createFile = async fileData => {
    const file = await File.create(fileData);
    return file;
};

// Room Services
export const createRoom = async roomData => {
    const room = await Room.create(roomData);
    return room;
};

export const deleteRoom = async roomId => {
    const room = await Room.deleteOne({ _id: roomId });
    return room;
};

export const getRoomByRoomId = async roomId => {
    const room = await Room.findById(roomId);
    if (room) {
        return { success: true, exists: true, room: room };
    }
    return { success: true, exists: false };
};

export const getAllRoomsForUser = async userId => {
    const rooms = await Room.find({ users: userId }).sort({ updatedAt: -1 });
    if (!rooms) {
        return { success: false, rooms: [] };
    }
    return { success: true, rooms: rooms };
};

export const updateRoomLastMessage = async (roomId, message) => {
    const result = await Room.findByIdAndUpdate(roomId, {
        $set: { message: message },
    });

    return result;
};

export const addUserToRoom = async (roomId, userId) => {
    const result = await Room.findByIdAndUpdate(roomId, {
        $push: { users: userId },
    });

    return result;
};

export const deleteUserFromRoom = async (roomId, userId) => {
    const result = await Room.findByIdAndUpdate(roomId, {
        $pull: { users: userId },
    });

    return result;
};

// Refresh Token Services
export const createRefreshToken = async tokenData => {
    const token = await RefreshToken.create(tokenData);
    return token;
};

export const getRefreshToken = async token => {
    const refreshToken = await RefreshToken.findOne({ token: token });

    if (refreshToken) {
        return { success: true, exists: true, refreshToken: refreshToken };
    }
    return { success: true, exists: false };
};

export const deleteRefreshToken = async token => {
    await RefreshToken.deleteOne({ token: token });
    return { success: true };
};

export const deleteRefreshTokensByUserId = async userId => {
    await RefreshToken.deleteMany({ userId: userId });
    return { success: true };
};

// Room Member Services
export const createRoomMember = async memberData => {
    const roomMember = await RoomMember.create(memberData);
    return roomMember;
};

export const deleteRoomMember = async (roomId, userId) => {
    const result = RoomMember.deleteOne({ roomId, userId });

    return result;
};

export const deleteAllRoomMemberInRoom = async roomId => {
    const result = RoomMember.deleteMany({ roomId });

    return result;
};

export const getRoomMemberForRoom = async (roomId, userId) => {
    return await RoomMember.findOne({ roomId, userId });
};

export const getAllRoomMembersForRoom = async roomId => {
    return await RoomMember.find({ roomId });
};

export const getUnreadCount = async (roomId, userId) => {
    const memberRecord = await getRoomMemberForRoom(roomId, userId);
    return memberRecord?.unreadCount || 0;
};

export const incrementUnreadForOthers = async (roomId, excludeUserId) => {
    return await RoomMember.updateMany(
        { roomId, userId: { $ne: excludeUserId } },
        { $inc: { unreadCount: 1 } }
    );
};

export const getUnreadCountsForRooms = async (userId, roomIds) => {
    const memberRecords = await RoomMember.find({
        userId,
        roomId: { $in: roomIds },
    }).lean();

    // Return as map: roomId -> unreadCount
    return memberRecords.reduce((acc, record) => {
        acc[record.roomId.toString()] = record.unreadCount || 0;
        return acc;
    }, {});
};

export const populateRoomMemberReadStatus = async (messages, roomId) => {
    const listOfMembers = await getAllRoomMembersForRoom(roomId);

    // Create a map of messageId -> array of users who read it
    const readStatusMap = new Map();
    for (const member of listOfMembers) {
        if (member.lastReadMessageId) {
            if (!readStatusMap.has(member.lastReadMessageId.toString())) {
                readStatusMap.set(member.lastReadMessageId.toString(), []);
            }
            readStatusMap.get(member.lastReadMessageId.toString()).push({
                userId: member.userId,
                username: member.username,
            });
        }
    }

    return messages.map(message => ({
        ...message,
        readUsers: readStatusMap.get(message._id.toString()) || [],
    }));
};

export const populateRoomMemberReadStatusSingleMessage = async (message, roomId) => {
    const listOfMembers = await getAllRoomMembersForRoom(roomId);

    // Create a map of messageId -> array of users who read it
    const readStatusMap = new Map();
    for (const member of listOfMembers) {
        if (member.lastReadMessageId) {
            if (!readStatusMap.has(member.lastReadMessageId.toString())) {
                readStatusMap.set(member.lastReadMessageId.toString(), []);
            }
            readStatusMap.get(member.lastReadMessageId.toString()).push({
                userId: member.userId,
                username: member.username,
            });
        }
    }

    return {
        ...message,
        readUsers: readStatusMap.get(message._id.toString()) || [],
    };
};

// Read/Delivery specific
export const getUnreadMessages = async (roomId, userId, limit = 50) => {
    const memberRecord = await getRoomMemberForRoom(roomId, userId);

    // If no read position, get recent messages
    if (!memberRecord || !memberRecord.lastReadMessageId) {
        return await Message.find({ roomId, isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
    }

    // Use stored timestamp if available
    let timestampToUse = memberRecord.lastReadMessageTimestamp;

    // Fallback: if timestamp not stored, look up the message
    if (!timestampToUse) {
        const lastReadMessage = await Message.findById(memberRecord.lastReadMessageId);

        if (!lastReadMessage) {
            // Message was hard deleted or doesn't exist - fallback to recent
            return await Message.find({ roomId, isDeleted: false })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();
        }

        timestampToUse = lastReadMessage.createdAt;
    }

    // Get messages after last read timestamp (excluding deleted)
    return await Message.find({
        roomId,
        isDeleted: false,
        createdAt: { $gt: timestampToUse },
    })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
};

export const updateReadPosition = async (roomId, userId, messageId) => {
    // Get the message to extract its timestamp
    const message = await Message.findById(messageId);

    if (!message) {
        throw new Error('Message not found');
    }

    return await RoomMember.findOneAndUpdate(
        { roomId, userId },
        {
            lastReadMessageId: messageId,
            lastReadMessageTimestamp: message.createdAt,
            lastReadAt: new Date(),
            unreadCount: 0,
        },
        { new: true }
    );
};

// ADMIN DB SERVICES

export const getTotalUserCount = async () => {
    return await User.countDocuments();
};

export const getTotalRoomCount = async () => {
    return await Room.countDocuments();
};

export const getTotalMessageCount = async () => {
    return await Message.countDocuments();
};
