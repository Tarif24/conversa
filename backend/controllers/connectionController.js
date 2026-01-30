import { getUserByUserId, getAllRoomsForUser } from '../services/databaseService.js';

export const getUser = async userId => {
    try {
        const result = await getUserByUserId(userId);

        if (!result) {
            return {
                success: false,
                message: 'User not be retrieved',
            };
        }

        return {
            success: true,
            user: result,
            message: 'User retrieved successfully',
        };
    } catch (error) {
        console.error('Get user error:', error);
        const message = 'Failed to get user: ' + error;
        return { success: false, message: message };
    }
};

export const getAllUserRooms = async userId => {
    try {
        const result = await getAllRoomsForUser(userId);

        if (!result) {
            return {
                success: false,
                message: 'Could not retrieve user rooms',
            };
        }

        return {
            success: true,
            rooms: result,
            message: 'User rooms retrieved successfully',
        };
    } catch (error) {
        console.error('Get all user rooms error:', error);
        const message = 'Failed to get user rooms: ' + error;
        return { success: false, message: message };
    }
};
