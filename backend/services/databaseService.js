import { User, Message, File, Room, RefreshToken } from '../database/models/index.js';
import mongoose from 'mongoose';

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

export const getUsersByUsernameSearch = async usernameQuery => {
    const users = await User.find({
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
    const message = await Message.create(messageData);
    return message;
};

export const getMessagesForRoom = async roomId => {
    const result = await Message.find({ roomId: roomId }).limit(50).sort({
        createdAt: 1,
    });

    return result;
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
