import { verifyAccessToken } from '../../services/authenticationService.js';
import EVENTS from '../../../constants/socketEvents.js';

const logEvent = (socket, logManager) => {
    return ([eventName, data], next) => {
        try {
            const token = data.token;

            let filteredData = { ...data };

            if (data.token) {
                filteredData.token = 'SENT';
            }

            if (data.refreshToken) {
                filteredData.refreshToken = 'SENT';
            }

            if (eventName === EVENTS.DISCONNECT) {
                logManager.connection(socket.id, socket.userId || data.userId);
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
                    event: eventName,
                    authenticated: false,
                    data: JSON.stringify(filteredData),
                });
            }

            const decoded = verifyAccessToken(token);
            if (!decoded) {
                logManager.log('INFO', eventName, {
                    event: eventName,
                    authenticated: false,
                    data: JSON.stringify(filteredData),
                });
                return next();
            }

            logManager.log('INFO', eventName, {
                event: eventName,
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
