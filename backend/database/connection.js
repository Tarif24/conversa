import mongoose from "mongoose";
import "./models/index.js"; // Import all models to register schemas

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("Connected to MongoDB with Mongoose");

        // Ensure all schema indexes are created
        await Promise.all(
            Object.values(mongoose.models).map((model) => model.ensureIndexes())
        );

        console.log("All model indexes ensured");

        return mongoose.connection.db;
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};
