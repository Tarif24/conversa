import EVENTS from "../../../constants/socketEvents.js";
import { signup, login } from "../../controllers/authenticationController.js";

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
}

export default AuthenticationHandler;
