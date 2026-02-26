import { verifyAccessToken, verifyAdminToken } from '../../services/authenticationService.js';
import EVENTS from '../../constants/socketEvents.js';

const authenticateSocket = (socket, logManager) => {
    return ([eventName, data], next) => {
        try {
            // Skip the auth middleware if its the following events
            if (
                eventName === EVENTS.CONNECT ||
                eventName === EVENTS.DISCONNECT ||
                eventName === EVENTS.ERROR ||
                eventName === EVENTS.USER_LOGIN ||
                eventName === EVENTS.USER_SIGNUP ||
                eventName === EVENTS.USER_REFRESH_TOKEN
            ) {
                return next();
            }

            // Admin authentication

            // Allow admin login without token
            if (eventName === EVENTS.ADMIN_LOGIN) {
                return next();
            }

            // For admin events
            if (
                eventName === EVENTS.GET_ALL_ADMIN_DATA ||
                eventName === EVENTS.GET_ADMIN_LOG_FOR_DAY ||
                eventName === EVENTS.DELETE_ALL_DATA
            ) {
                const decoded = verifyAdminToken(data.token);

                if (!decoded) {
                    socket.emit(EVENTS.ERROR, {
                        event: eventName,
                        message: 'Invalid or expired admin token',
                    });
                    logManager.log('ADMIN', eventName, {
                        userId: socket.userId || data.userId || 'N/A',
                        message: 'Invalid or expired admin token',
                    });
                    return next(new Error('Invalid or expired admin token'));
                }
                return next();
            }

            const token = data.token;

            if (!token) {
                socket.emit(EVENTS.ERROR, {
                    event: eventName,
                    message: 'Authentication token required',
                });
                logManager.log('INFO', eventName, {
                    userId: socket.userId || data.userId || 'N/A',
                    message: `Authentication token required, no token provided by userId: ${socket.userId || data.userId || 'N/A'}`,
                });
                return next(new Error('Authentication token required'));
            }

            const decoded = verifyAccessToken(token);
            if (!decoded) {
                socket.emit(EVENTS.ERROR, {
                    event: eventName,
                    message: 'Invalid or expired token',
                });
                logManager.log('INFO', eventName, {
                    userId: socket.userId || data.userId || 'N/A',
                    message: 'Invalid or expired token',
                });
                return next(new Error('Invalid or expired token'));
            }

            // Sets the userId the userEmail within the socket connection

            socket.userId = decoded.userId;
            socket.userEmail = decoded.email;

            next();
        } catch (error) {
            console.error('Socket authentication middleware error:', error);
            return next(new Error('Authentication error'));
        }
    };
};

export default authenticateSocket;
