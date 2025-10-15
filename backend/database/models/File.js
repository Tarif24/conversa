import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
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

// Compound indexes
fileSchema.index({ name: 1, roomID: 1, timeStamp: -1 }, { name: 'FileNameRoomTimeIndex' });
fileSchema.index({ timeStamp: -1, roomID: 1 }, { name: 'FileTimeRoomIndex' });

// Text search index
fileSchema.index(
    {
        path: 'text',
    },
    { name: 'FilePathTextIndex' }
);

export default mongoose.model('File', fileSchema);
