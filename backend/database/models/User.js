// For the status check out enums

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        lastSeen: {
            type: Date,
            default: Date.now,
            index: true,
        },
        rooms: {
            type: Array,
            default: [],
        },
        profile: {
            firstName: {
                type: String,
                default: "John",
            },
            lastName: {
                type: String,
                default: "Doe",
            },
        },
        createdAt: {
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
userSchema.index({ "profile.firstName": 1, "profile.lastName": 1 });
userSchema.index({ email: 1, createdAt: -1 });

// Text search index
userSchema.index({
    username: "text",
    "profile.firstName": "text",
    "profile.lastName": "text",
});

export default mongoose.model("User", userSchema);
