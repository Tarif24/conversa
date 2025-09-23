import EVENTS from "../../../constants/socketEvents.js";
import { signup } from "../../controllers/authenticationController.js";

class AuthenticationHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }
    handleConnection(socket) {
        socket.on(EVENTS.USER_SIGNUP, (user) =>
            this.handleSignup(socket, user)
        );
    }

    async handleSignup(socket, user) {
        try {
            console.log("Handel signup for user: ", user);

            const result = await signup(user);

            if (result.success) {
                socket.emit(EVENTS.USER_SIGNUP_RESULT, {
                    success: true,
                    message: "Signup successful",
                });
            } else {
                socket.emit(EVENTS.USER_SIGNUP_RESULT, {
                    success: false,
                    message: result.error || "Signup failed",
                });
            }
        } catch (error) {
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_SIGNUP,
                message: "Server error",
            });
        }
    }
}

export default AuthenticationHandler;
