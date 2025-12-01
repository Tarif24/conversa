import EVENTS from '../../../constants/socketEvents.js';
import {} from '../../controllers/messageInteractionController.js';

class MessageInteractionHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Reactions, Threads, Message pinning, Message search
    }
}

export default MessageInteractionHandler;
