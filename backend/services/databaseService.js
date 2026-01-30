import { User, Message, File, Room, RefreshToken, RoomMember } from '../database/models/index.js';
import { encryptMessage, decryptMessage } from './messageService.js';

// User Services
export const createUser = async userData => {
    return await User.create(userData);
};

export const getUserByEmail = async email => {
    return await User.findOne({ email: email });
};

export const getUserByUsername = async username => {
    return await User.findOne({ username: username });
};

export const getUserByUserId = async userId => {
    return await User.findById(userId);
};

export const getUsersByUsernameSearch = async (usernameQuery, excludeUserIds = []) => {
    return await User.find({
        _id: { $nin: excludeUserIds },
        username: {
            $regex: usernameQuery,
            $options: 'i', // case-insensitive
        },
    }).limit(10);
};

export const addRoomToUser = async (roomId, userId) => {
    return await User.updateOne({ _id: userId }, { $push: { rooms: roomId } });
};

export const deleteRoomFromUser = async (roomId, userId) => {
    return await User.updateOne({ _id: userId }, { $pull: { rooms: roomId } });
};

export const addRoomToUsers = async (roomId, userIds = []) => {
    return await User.updateMany({ _id: { $in: userIds } }, { $push: { rooms: roomId } });
};

export const getUsernameByUserId = async userId => {
    return await User.findById(userId);
};

// Message Services
export const createMessage = async messageData => {
    let finalMessageData = messageData;

    if (!messageData.replyToId) {
        finalMessageData = { ...messageData, replyToId: null };
    }

    return await Message.create(messageData);
};

export const deleteAllMessagesInRoom = async roomId => {
    return await Message.deleteMany({ roomId });
};

export const getMessagesForRoom = async roomId => {
    return await Message.find({ roomId: roomId }).limit(50).sort({
        createdAt: 1,
    });
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

    // Encrypt the new message and save the new encryption along with new IV and authTag and edited data to original message object (same ID)
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
    // Using the user along side the messageId ensures that the person editing is the person who sent it
    const message = await Message.findOne({ _id: messageId, userId });
    const room = await getRoomByRoomId(message.roomId);

    if (message.isDeleted) {
        return { success: false, message: 'Already Deleted' };
    }

    if (!message) {
        throw new Error('Message not found or unauthorized');
    }

    if (messageId === room.message._id.toString()) {
        const res = await updateRoomLastMessage(message.roomId, {
            ...message._doc,
            message: 'Deleted Message',
        });
    }
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;

    return await message.save();
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

    // Need to decrypt message then compare
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

    return results;
};

// File Services
export const createFile = async fileData => {
    return await File.create(fileData);
};

// Room Services
export const createRoom = async roomData => {
    return await Room.create(roomData);
};

export const deleteRoom = async roomId => {
    return await Room.deleteOne({ _id: roomId });
};

export const getRoomByRoomId = async roomId => {
    return await Room.findById(roomId);
};

export const getAllRoomsForUser = async userId => {
    return await Room.find({ users: userId }).sort({ updatedAt: -1 });
};

export const updateRoomLastMessage = async (roomId, message) => {
    return await Room.findByIdAndUpdate(roomId, {
        $set: { message: message },
    });
};

export const addUserToRoom = async (roomId, userId) => {
    return await Room.findByIdAndUpdate(roomId, {
        $push: { users: userId },
    });
};

export const deleteUserFromRoom = async (roomId, userId) => {
    return await Room.findByIdAndUpdate(roomId, {
        $pull: { users: userId },
    });
};

// Refresh Token Services
export const createRefreshToken = async tokenData => {
    return await RefreshToken.create(tokenData);
};

export const getRefreshToken = async token => {
    return await RefreshToken.findOne({ token: token });
};

export const deleteRefreshToken = async token => {
    return await RefreshToken.deleteOne({ token: token });
};

export const deleteRefreshTokensByUserId = async userId => {
    return await RefreshToken.deleteMany({ userId: userId });
};

// Room Member Services
export const createRoomMember = async memberData => {
    return await RoomMember.create(memberData);
};

export const deleteRoomMember = async (roomId, userId) => {
    return await RoomMember.deleteOne({ roomId, userId });
};

export const deleteAllRoomMemberInRoom = async roomId => {
    return await RoomMember.deleteMany({ roomId });
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
