import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        timeStamp: {
            type: Date,
            default: Date.now,
        },
        iv: {
            type: String,
            default: null,
        },
        authTag: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes
messageSchema.index({ message: 1, roomID: 1, timeStamp: -1 }, { name: 'MessageRoomTimeIndex' });

// Text search index
messageSchema.index(
    {
        message: 'text',
    },
    { name: 'MessageTextIndex' }
);

export default mongoose.model('Message', messageSchema);
