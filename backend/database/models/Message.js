import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        roomID: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        user: {
            type: String,
            required: true,
        },
        timeStamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes
messageSchema.index(
    { message: 1, roomID: 1, timeStamp: -1 },
    { name: "MessageRoomTimeIndex" }
);

// Text search index
messageSchema.index(
    {
        message: "text",
    },
    { name: "MessageTextIndex" }
);

export default mongoose.model("Message", messageSchema);
