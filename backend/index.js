import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";

const server = createServer();
const io = new Server(server);
const PORT = process.env.PORT || 5000;
dotenv.config();

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

console.log("Starting application...");

// Define schema first
const test1 = new mongoose.Schema({
    name: {
        type: String,
        default: "Job Container",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

console.log("Schema defined");

const TestModel = mongoose.model("Test", test1);

async function createTestDocument() {
    try {
        const testDocument = new TestModel({
            name: "My Test Document", // You can override the default
        });

        const savedDocument = await testDocument.save();
        console.log("✅ Test document saved:", savedDocument);

        // Also try the create method
        const anotherDoc = await TestModel.create({
            name: "Another Test Document",
        });
        console.log("✅ Another document created:", anotherDoc);
    } catch (error) {
        console.log("❌ Error saving document:", error);
    }
}

// Connect to MongoDB and then create documents
mongoose
    .connect("mongodb://admin:password123@mongodb:27017/myapp?authSource=admin")
    .then(() => {
        console.log("✅ DB CONNECTED");

        // Only create documents after connection is established
        return createTestDocument();
    })
    .then(() => {
        console.log("✅ All operations completed");
        // Optional: close connection if this is a one-time script
        // mongoose.connection.close();
    })
    .catch((error) => {
        console.log("❌ Error:", error);
    });

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

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
