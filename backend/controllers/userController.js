import { getUsersByUsernameSearch, getUsernameByUserId } from '../services/databaseService.js';

export const userSearch = async (text, excludeUsers) => {
    try {
        if (text === '') return { success: false, message: 'No text provided' };

        const result = await getUsersByUsernameSearch(text, excludeUsers);

        if (!result.foundUsers) {
            return {
                success: false,
                userList: [{ username: 'No users found', userId: 'NOT FOUND' }],
                foundUsers: false,
                message: 'No users found',
            };
        }

        // Secure list only sends the userid and username
        const resultListSecure = result.list.map(user => {
            const id = user._id.toString();
            return {
                userId: id,
                username: user.username,
            };
        });

        return {
            success: true,
            userList: resultListSecure,
            foundUsers: true,
            message: 'Found Users',
        };
    } catch (error) {
        console.error('user search error:', error);
        const message = 'Failed to user search: ' + error;
        return { success: false, message: message };
    }
};

export const getUsername = async userId => {
    try {
        const result = await getUsernameByUserId(userId);

        if (!result.exists) {
            return {
                success: false,
                username: 'Unknown User',
                foundUsers: false,
                message: 'No users found',
            };
        }

        return {
            success: true,
            username: result.username,
            foundUser: true,
            message: 'Found User',
        };
    } catch (error) {
        console.error('get username error:', error);
        const message = 'Failed to get username: ' + error;
        return { success: false, message: message };
    }
};
