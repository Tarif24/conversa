import {
    getUnreadCount,
    getUnreadCountsForRooms,
    updateReadPosition,
} from '../services/databaseService.js';

export const getUserUnreadCount = async (roomId, userId) => {
    try {
        const count = await getUnreadCount(roomId, userId);
        return {
            success: true,
            count,
        };
    } catch (error) {
        console.error('controller get unread count:', error);
        const message = 'Failed get unread count: ' + error;
        return { success: false, message: message, count: 0 };
    }
};

export const getUserUnreadCountsForRooms = async (userId, roomIds) => {
    try {
        const counts = await getUnreadCountsForRooms(userId, roomIds);
        return {
            success: true,
            counts,
        };
    } catch (error) {
        console.error('controller get unread count for rooms:', error);
        const message = 'Failed to get unread count for rooms: ' + error;
        return { success: false, message: message, count: {} };
    }
};

export const updateUserReadPosition = async (roomId, userId, messageId) => {
    try {
        await updateReadPosition(roomId, userId, messageId);
        return {
            success: true,
            messageId,
        };
    } catch (error) {
        console.error('controller update read position:', error);
        const message = 'Failed to update read position: ' + error;
        return { success: false, message: message };
    }
};
