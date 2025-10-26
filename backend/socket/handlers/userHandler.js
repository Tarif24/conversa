import EVENTS from '../../../constants/socketEvents.js';
import { userSearch, getUsername } from '../../controllers/userController.js';
import { authentication } from '../middleware/index.js';

class UserHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        socket.use(authentication(socket));

        socket.on(EVENTS.USER_SEARCH, (query, callback) =>
            this.handleUserSearch(socket, query, callback)
        );
        socket.on(EVENTS.GET_USERNAME, (user, callback) =>
            this.handleGetUsername(socket, user, callback)
        );
    }

    async handleUserSearch(socket, query, callback) {
        try {
            const result = await userSearch(query);

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
