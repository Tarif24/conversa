import { getUsersByUsernameSearch } from '../services/databaseService.js';

export const userSearch = async query => {
    try {
        if (query.text === '') return { success: false, message: 'No text provided' };

        const result = await getUsersByUsernameSearch(query.text);

        if (!result.foundUsers) {
            return {
                success: false,
                userList: [{ username: 'No users found' }],
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
