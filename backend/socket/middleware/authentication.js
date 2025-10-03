import { verifyAccessToken } from "../../services/authenticationService.js";
import EVENTS from "../../../constants/socketEvents.js";

const authenticateSocket = (socket) => {
    return ([eventName, data], next) => {
        try {
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

            const token = data.token;

            if (!token) {
                socket.emit(EVENTS.ERROR, {
                    event: eventName,
                    message: "Authentication token required",
                });
                return next(new Error("Authentication token required"));
            }

            const decoded = verifyAccessToken(token);
            if (!decoded) {
                socket.emit(EVENTS.ERROR, {
                    event: eventName,
                    message: "Invalid or expired token",
                });
                return next(new Error("Invalid or expired token"));
            }

            socket.userId = decoded.userId;
            socket.userEmail = decoded.email;
            next();
        } catch (error) {
            console.error("Socket authentication middleware error:", error);
            return next(new Error("Authentication error"));
        }
    };
};

export default authenticateSocket;
