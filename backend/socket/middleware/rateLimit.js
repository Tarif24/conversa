import { verifyAccessToken } from '../../services/authenticationService.js';
import EVENTS from '../../constants/socketEvents.js';

const rateLimit = (socket, logManager, rateLimitManager) => {
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

            if (!rateLimitManager.canSend(socket.id)) {
                logManager.rateLimit(socket.id, socket.userId || data.userId);
                socket.emit(EVENTS.RATE_LIMIT_REACHED, {
                    event: eventName,
                    message: 'rate limit has been reached please wait',
                });
                return next(new Error('Rate Limit error'));
            }

            return next();
        } catch (error) {
            console.error('Rate Limit middleware error:', error);
            return next(new Error('Rate Limit error'));
        }
    };
};

export default rateLimit;
