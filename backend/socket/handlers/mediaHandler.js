import EVENTS from '../../constants/socketEvents.js';
import {} from '../../controllers/mediaController.js';

class MediaHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Image/Video upload, Audio messages, File sharing, Thumbnail generation
    }
}

export default MediaHandler;
