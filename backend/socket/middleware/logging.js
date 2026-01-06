import { verifyAccessToken } from '../../services/authenticationService.js';
import EVENTS from '../../../constants/socketEvents.js';

const logEvent = (socket, logManager) => {
    return ([eventName, data], next) => {
        try {
            // Skip the logging middleware if its the following events
            if (eventName === EVENTS.DISCONNECT) {
                return next();
            }

            const token = data.token;

            let filteredData = { ...data };

            if (data.token) {
                filteredData.token = 'SENT';
            }

            if (data.refreshToken) {
                filteredData.refreshToken = 'SENT';
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
