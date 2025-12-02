import mongoose from 'mongoose';

const roomMemberSchema = new mongoose.Schema(
    {
        roomId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

        // Track where user is in messages
        lastReadMessageId: mongoose.Schema.Types.ObjectId,
        lastReadMessageTimestamp: Date, // Timestamp of the message itself
        lastReadAt: Date, // When the user performed the read action

        // Cached unread count for sidebar
        unreadCount: { type: Number, default: 0 },

        joinedAt: { type: Date, default: Date.now },

        role: { type: String, enum: ['member', 'owner'], default: 'member' },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('RoomMember', roomMemberSchema);
