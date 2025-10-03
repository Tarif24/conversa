import EVENTS from "../../../constants/socketEvents.js";
import { sendMessage } from "../../controllers/messageController.js";
import { authentication } from "../middleware/index.js";

class MessageHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        socket.use(authentication(socket));

        socket.on(EVENTS.SEND_MESSAGE, (message) =>
            this.handleSendMessage(socket, message)
        );
    }

    async handleSendMessage(socket, message) {
        try {
            console.log("user with socket ID:", socket.id, "sent a message");

            const userId = this.connectionManager.getUserIdBySocketId(
                socket.id
            );
            if (!userId) {
                socket.emit(EVENTS.ERROR, {
                    event: EVENTS.SEND_MESSAGE,
                    message: "User not found",
                });
                return;
            }

            const result = await sendMessage(message);

            if (!result.success) {
                socket.emit(EVENTS.ERROR, {
                    event: EVENTS.SEND_MESSAGE,
                });
                return;
            }

            socket.broadcast.emit(EVENTS.RECEIVE_MESSAGE, result);
        } catch (error) {
            console.error("handle send message error:", error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.SEND_MESSAGE,
                message: "Server error",
            });
        }
    }
}

export default MessageHandler;
