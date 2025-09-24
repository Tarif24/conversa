import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        roomName: {
            type: String,
            required: true,
        },
        message: {
            type: Array,
            required: true,
        },
        users: {
            type: Array,
            default: [],
        },
        type: {
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

export default mongoose.model("Room", roomSchema);
