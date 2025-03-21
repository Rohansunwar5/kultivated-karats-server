import mongoose, { Schema } from "mongoose";

const giftCardSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    occasion: {
        type: String,
        required: true
    },
    recipientName: {
        type: String,
        required: true
    },
    recipientEmail: {
        type: String,
        required: true
    },
    recipientPhone: {
        type: Number,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
    },
    validUpto: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        required: true,
        default: false
    },
    imageUrl: [
        {
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true });

export const GiftCard = mongoose.model("GiftCard", giftCardSchema);