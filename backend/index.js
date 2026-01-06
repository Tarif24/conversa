import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { connectToDatabase } from './database/connection.js';

import ConnectionManager from './socket/managers/connectionManager.js';
import LogManager from './socket/managers/logManager.js';

// Import all the handlers
import AuthenticationHandler from './socket/handlers/authenticationHandler.js';
import ConnectionHandler from './socket/handlers/connectionHandler.js';
import MessageHandler from './socket/handlers/messageHandler.js';
import UserHandler from './socket/handlers/userHandler.js';
import RoomHandler from './socket/handlers/roomHandler.js';
import PresenceHandler from './socket/handlers/presenceHandler.js';
import MessageInteractionHandler from './socket/handlers/messageInteractionHandler.js';
import MessageStatusHandler from './socket/handlers/messageStatusHandler.js';
import MediaHandler from './socket/handlers/mediaHandler.js';
import AdminHandler from './socket/handlers/adminHandler.js';

// Import middleware
import { authentication, logging } from './socket/middleware/index.js';

// Initialize HTTP server and Socket.IO
const server = createServer();
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});
const PORT = process.env.PORT;

// Initialize Managers
const connectionManager = new ConnectionManager();
const logManager = new LogManager();

// Initialize handlers
const authenticationHandler = new AuthenticationHandler(io, connectionManager);
const connectionHandler = new ConnectionHandler(io, connectionManager, logManager);
const messageHandler = new MessageHandler(io, connectionManager);
const userHandler = new UserHandler(io, connectionManager);
const roomHandler = new RoomHandler(io, connectionManager);
const presenceHandler = new PresenceHandler(io, connectionManager);
const messageInteractionHandler = new MessageInteractionHandler(io, connectionManager);
const messageStatusHandler = new MessageStatusHandler(io, connectionManager);
const mediaHandler = new MediaHandler(io, connectionManager);
const adminHandler = new AdminHandler(io, connectionManager);

// Graceful shutdown handling
const gracefulShutdown = signal => {
    console.log(`${signal} received, shutting down gracefully`);

    if (!server) {
        console.log('Server is not running');
        process.exit(1);
    }
    server.close(err => {
        if (err) {
            console.error('Error during server shutdown:', err);
            process.exit(1);
        }

        console.log('Server closed successfully');

        // Close database connections, cleanup resources, etc.
        // db.close() if you have a database

        process.exit(0);
    });

    // Force close after 5 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 5000);
};

// Server signal handling
const serverSignalHandler = () => {
    // Error handling
    server.on('error', error => {
        console.error('Server error:', error);
    });

    io.on('error', error => {
        console.error('IO error:', error);
    });

    // New client connection handling
    io.on('connection', socket => {
        logManager.log('INFO', 'CONNECTION', { event: 'CONNECTION', authenticated: false });
        //console.log('user with socket ID:', socket.id, 'connected');

        // Initialize middleware for the new connection
        socket.use(logging(socket, logManager));
        socket.use(authentication(socket));

        connectionManager.addConnection(socket);

        // Initialize handlers for the new connection
        authenticationHandler.handleConnection(socket);
        connectionHandler.handleConnection(socket);
        messageHandler.handleConnection(socket);
        userHandler.handleConnection(socket);
        roomHandler.handleConnection(socket);
        presenceHandler.handleConnection(socket);
        messageInteractionHandler.handleConnection(socket);
        messageStatusHandler.handleConnection(socket);
        mediaHandler.handleConnection(socket);
        adminHandler.handleConnection(socket);
    });

    // Shutdown signals handling
    process.on('SIGTERM', () => {
        console.log('SIGTERM handler called');
        gracefulShutdown('SIGTERM');
    });
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', err => {
        console.error('Uncaught Exception:', err);
        //gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        //gracefulShutdown('UNHANDLED_REJECTION');
    });
};

const startServer = async () => {
    try {
        console.log('Starting application setup');

        console.log('Setting up server signal handlers');
        serverSignalHandler();

        console.log('Connecting to database');
        await connectToDatabase();

        console.log('Starting server');
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        console.log('Application setup complete');
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
