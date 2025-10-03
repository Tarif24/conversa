import {
    User,
    Message,
    File,
    Room,
    RefreshToken,
} from "../database/models/index.js";

// User Services
export const createUser = async (userData) => {
    const user = await User.create(userData);
    return user;
};

export const getUserByEmail = async (email) => {
    const user = await User.findOne({ email: email });
    if (user) {
        return { success: true, exists: true, user: user };
    }
    return { success: true, exists: false };
};

export const getUserByUsername = async (username) => {
    const user = await User.findOne({ username: username });
    if (user) {
        return { success: true, exists: true, user: user };
    }
    return { success: true, exists: false };
};

// Message Services
export const createMessage = async (messageData) => {
    const message = await Message.create(messageData);
    return message;
};

// File Services
export const createFile = async (fileData) => {
    const file = await File.create(fileData);
    return file;
};

// Room Services
export const createRoom = async (roomData) => {
    const room = await Room.create(roomData);
    return room;
};

// Refresh Token Services
export const createRefreshToken = async (tokenData) => {
    const token = await RefreshToken.create(tokenData);
    return token;
};

export const getRefreshToken = async (token) => {
    const refreshToken = await RefreshToken.findOne({ token: token });

    if (refreshToken) {
        return { success: true, exists: true, refreshToken: refreshToken };
    }
    return { success: true, exists: false };
};

export const deleteRefreshToken = async (token) => {
    await RefreshToken.deleteOne({ token: token });
    return { success: true };
};

export const deleteRefreshTokensByUserId = async (userId) => {
    await RefreshToken.deleteMany({ userId: userId });
    return { success: true };
};
