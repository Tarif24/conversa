import EVENTS from '../../../constants/socketEvents.js';
import {} from '../../controllers/messageStatusController.js';

class MessageStatusHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Delivery receipts, Read receipts, Message failed status
    }
}

export default MessageStatusHandler;
