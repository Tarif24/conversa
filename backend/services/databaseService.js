import {
    User,
    Message,
    File,
    Room,
    RefreshToken,
} from "../database/models/index.js";
import mongoose from "mongoose";

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

export const getUserByUserId = async (userId) => {
    const user = await User.findById(userId);
    if (user) {
        return { success: true, exists: true, user: user };
    }
    return { success: true, exists: false };
};

export const getUsersByUsernameSearch = async (usernameQuery) => {
    const users = await User.find({
        username: {
            $regex: usernameQuery,
            $options: "i", // case-insensitive
        },
    }).limit(10);

    if (users && users.length !== 0) {
        return { success: true, list: users, foundUsers: true };
    } else {
        return { success: true, foundUsers: false };
    }
};

export const addRoomToUsers = async (roomId, userIds = []) => {
    const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $push: { rooms: roomId } }
    );
    // for (const userId of userIds) {
    //     // const result = await User.updateOne(
    //     //     { _id: userId },
    //     //     { $push: { rooms: roomId } }
    //     // );
    //     // const result = await User.findOne({ _id: userId });
    //     const result = await User.findById(userId);
    //     console.log(result);
    // }
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
