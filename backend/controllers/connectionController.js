import { getUserByUserId } from '../services/databaseService.js';

export const getUser = async userId => {
    try {
        const result = await getUserByUserId(userId);

        if (!result.exists) {
            return {
                success: false,
                message: 'User not be retrieved',
            };
        }

        return {
            success: true,
            user: result.user,
            message: 'User retrieved successfully',
        };
    } catch (error) {
        console.error('Get user error:', error);
        const message = 'Failed to get user: ' + error;
        return { success: false, message: message };
    }
};
