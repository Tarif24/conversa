import EVENTS from "../../../constants/socketEvents.js";
import {
    signup,
    login,
    logout,
    refreshToken,
} from "../../controllers/authenticationController.js";

class AuthenticationHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        socket.on(EVENTS.USER_SIGNUP, (user, callback) =>
            this.handleSignup(socket, user, callback)
        );
        socket.on(EVENTS.USER_LOGIN, (user, callback) =>
            this.handleLogin(socket, user, callback)
        );
        socket.on(EVENTS.USER_LOGOUT, (user, callback) =>
            this.handleLogout(socket, user, callback)
        );
        socket.on(EVENTS.USER_REFRESH_TOKEN, (tokenData, callback) =>
            this.handleRefreshToken(socket, tokenData, callback)
        );
    }

    async handleSignup(socket, user, callback) {
        try {
            console.log("Handel signup for user: ", user.email);

            const result = await signup(user);

            if (result.success) {
                this.connectionManager.addUserIDToConnection(
                    socket,
                    result.user._id.toString()
                );
            }

            socket.userId = result.user._id.toString();
            socket.userEmail = result.email;

            if (callback) {
                callback(result);
            } else {
                console.log("No callback provided for signup event");
            }
        } catch (error) {
            console.error("Signup error:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_SIGNUP,
                message: "Server error",
            });
        }
    }

    async handleLogin(socket, user, callback) {
        try {
            console.log("Handel login for user: ", user.email);

            const result = await login(user);

            if (result.success) {
                this.connectionManager.addUserIDToConnection(
                    socket,
                    result.user._id.toString()
                );
            }

            socket.userId = result.user._id.toString();
            socket.userEmail = result.email;

            if (callback) {
                callback(result);
            } else {
                console.log("No callback provided for login event");
            }
        } catch (error) {
            console.error("Login error:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_LOGIN,
                message: "Server error",
            });
        }
    }

    async handleLogout(socket, user, callback) {
        try {
            console.log("Handel logout for user: ", user.email);

            const result = await logout(user);

            this.connectionManager.removeConnection(socket.id);

            if (callback) {
                callback(result);
            } else {
                console.log("No callback provided for logout event");
            }
        } catch (error) {
            console.error("Logout error:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_LOGOUT,
                message: "Server error",
            });
        }
    }

    async handleRefreshToken(socket, tokenData, callback) {
        try {
            console.log("Handle refresh token for: ", socket.userId);

            const { token } = tokenData;

            if (!token) {
                return callback({
                    success: false,
                    message: "Refresh token required",
                });
            }

            const result = await refreshToken(tokenData);

            if (callback) {
                callback(result);
            } else {
                console.log("No callback provided for refresh token event");
            }
        } catch (error) {
            console.error("Refresh Token error:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_REFRESH_TOKEN,
                message: "Server error",
            });
        }
    }
}

export default AuthenticationHandler;
