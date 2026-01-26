import EVENTS from '../../constants/socketEvents.js';
import { userSearch, getUsername } from '../../controllers/userController.js';

class UserHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Profile update, User search, Get username, User settings

        socket.on(EVENTS.USER_SEARCH, (data, callback) =>
            this.handleUserSearch(socket, data, callback)
        );
        socket.on(EVENTS.GET_USERNAME, (user, callback) =>
            this.handleGetUsername(socket, user, callback)
        );
    }

    async handleUserSearch(socket, data, callback) {
        try {
            const result = await userSearch(data.text, data.excludeUsers);

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for user_search event');
            }
        } catch (error) {
            console.error('handle user search error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_SEARCH,
                message: 'Server error',
            });
        }
    }

    async handleGetUsername(socket, user, callback) {
        try {
            const result = await getUsername(user.userId);

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for user_search event');
            }
        } catch (error) {
            console.error('handle get username error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_USERNAME,
                message: 'Server error',
            });
        }
    }
}

export default UserHandler;
