import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        roomID: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        path: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        user: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        type: {
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
fileSchema.index({ name: 1, roomID: 1, timeStamp: -1 });
fileSchema.index({ timeStamp: -1, roomID: 1 });

// Text search index
fileSchema.index({
    path: "text",
});

export default mongoose.model("File", fileSchema);
