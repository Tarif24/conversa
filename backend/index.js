import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import ConnectionManager from "./socket/managers/connectionManager.js";

import AuthenticationHandler from "./socket/handlers/authenticationHandler.js";
import ConnectionHandler from "./socket/handlers/connectionHandler.js";

dotenv.config();

// Initialize HTTP server and Socket.IO
const server = createServer();
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});
const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;

// Initialize connection manager
const connectionManager = new ConnectionManager();

// Initialize handlers
const authenticationHandler = new AuthenticationHandler(io, connectionManager);
const connectionHandler = new ConnectionHandler(io, connectionManager);

// Server error handling
server.on("error", (error) => {
    console.error("Server error:", error);
});

io.on("error", (error) => {
    console.error("IO error:", error);
});

io.on("connection", (socket) => {
    console.log("A user connected");

    // Initialize handlers for the new connection
    authenticationHandler.handleConnection(socket);
    connectionHandler.handleConnection(socket);
});

console.log("Starting application...");

mongoose
    .connect(MONGOURL)
    .then(() => {
        console.log("DATABASE CONNECTION SUCCESSFUL");
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => console.log(error));

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);

    if (!server) {
        console.log("Server is not running");
        process.exit(1);
    }
    server.close((err) => {
        if (err) {
            console.error("Error during server shutdown:", err);
            process.exit(1);
        }

        console.log("Server closed successfully");

        // Close database connections, cleanup resources, etc.
        // db.close() if you have a database

        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
//process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGTERM", () => {
    console.log("SIGTERM handler called");
    gracefulShutdown("SIGTERM");
});
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("UNHANDLED_REJECTION");
});

// // Define schema first
// const test1 = new mongoose.Schema({
//     name: {
//         type: String,
//         default: "Job Container",
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// console.log("Schema defined");

// const TestModel = mongoose.model("Test", test1);

// async function createTestDocument() {
//     try {
//         const testDocument = new TestModel({
//             name: "My Test Document", // You can override the default
//         });

//         const savedDocument = await testDocument.save();
//         console.log("✅ Test document saved:", savedDocument);

//         // Also try the create method
//         const anotherDoc = await TestModel.create({
//             name: "Another Test Document",
//         });
//         console.log("✅ Another document created:", anotherDoc);
//     } catch (error) {
//         console.log("❌ Error saving document:", error);
//     }
// }

// // Connect to MongoDB and then create documents
// mongoose
//     .connect("mongodb://admin:password12@mongodb:27017/myapp?authSource=admin")
//     .then(() => {
//         console.log("✅ DB CONNECTED");

//         // Only create documents after connection is established
//         return createTestDocument();
//     })
//     .then(async () => {
//         console.log("✅ All operations completed");
//         const result = await mongoose.connection.db.admin().ping();
//         console.log("MongoDB ping result:", result);
//     })
//     .catch((error) => {
//         console.log("❌ Error:", error);
//     });
