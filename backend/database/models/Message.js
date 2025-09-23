import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        roomID: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        user: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        timeStamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes
messageSchema.index({ message: 1, roomID: 1, timeStamp: -1 });

// Text search index
messageSchema.index({
    message: "text",
});

export default mongoose.model("Message", messageSchema);
