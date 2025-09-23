import { User, Message, File, Room } from "../database/models/index.js";

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
