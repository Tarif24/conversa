import { verifyAccessToken } from '../../services/authenticationService.js';
import EVENTS from '../../constants/socketEvents.js';

const logEvent = (socket, logManager) => {
    return ([eventName, data], next) => {
        try {
            const token = data.token;

            // Filters all the sensitive data
            let filteredData = { ...data };
            if (data.token) {
                filteredData.token = 'SENT';
            }
            if (data.refreshToken) {
                filteredData.refreshToken = 'SENT';
            }
            if (data.password) {
                filteredData.password = 'SENT';
            }
            if (data.username) {
                filteredData.username = 'SENT';
            }
            if (data.adminToken) {
                filteredData.adminToken = 'SENT';
            }

            // Special logs for admin
            if (
                eventName === EVENTS.ADMIN_LOGIN ||
                eventName === EVENTS.GET_ALL_ADMIN_DATA ||
                eventName === EVENTS.GET_ADMIN_LOG_FOR_DAY
            ) {
                logManager.log('ADMIN', eventName, {
                    userId: socket.userId || data.userId || 'N/A',
                    data: JSON.stringify(filteredData),
                });
                return next();
            }

            if (eventName === EVENTS.USER_RECONNECT) {
                logManager.connection(socket.id, socket.userId || data.userId, 'RECONNECTION');
                return next();
            }

            if (eventName === EVENTS.SEND_MESSAGE) {
                logManager.message(socket.id, socket.userId || data.userId, data.roomId);
                return next();
            }

            if (eventName === EVENTS.ERROR) {
                logManager.error(data);
                return next();
            }

            if (!token) {
                logManager.log('INFO', eventName, {
                    authenticated: false,
                    userId: socket.userId || data.userId || 'N/A',
                    data: JSON.stringify(filteredData),
                });
            }

            const decoded = verifyAccessToken(token);
            if (!decoded) {
                logManager.log('INFO', eventName, {
                    authenticated: false,
                    data: JSON.stringify(filteredData),
                });
                return next();
            }

            logManager.log('INFO', eventName, {
                authenticated: true,
                data: JSON.stringify(filteredData),
            });

            next();
        } catch (error) {
            console.error('Event logging middleware error:', error);
            return next(new Error('Logging error'));
        }
    };
};

export default logEvent;
