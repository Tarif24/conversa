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
            console.log("Handel signup for user: ", user.email);

            const result = await signup(user);

            socket.emit(EVENTS.USER_SIGNUP_RESULT, result);
        } catch (error) {
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_SIGNUP,
                message: "Server error",
            });
        }
    }
}

export default AuthenticationHandler;
