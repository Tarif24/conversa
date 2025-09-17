import EVENTS from "../../../constants/socketEvents.js";

class ConnectionHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }
    handleConnection(socket) {
        socket.on(EVENTS.DISCONNECT, (user) =>
            this.handleDisconnect(socket, user)
        );

        socket.on(EVENTS.ERROR, (user) => {
            console.error("Socket error for", socket.id, ":", error);
        });
    }

    async handleDisconnect(socket, user) {
        try {
            console.log("user with socket ID:", socket.id, "disconnected");
        } catch (error) {
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.DISCONNECT,
                message: "Server error",
            });
        }
    }
}

export default ConnectionHandler;
