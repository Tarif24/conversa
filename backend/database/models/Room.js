import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        roomName: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        message: {
            type: Array,
            required: true,
        },
        users: {
            type: Array,
            default: [],
            unique: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
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

export default mongoose.model("Room", roomSchema);
