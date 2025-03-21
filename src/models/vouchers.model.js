import mongoose, { Schema } from "mongoose";

const voucherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        unique: true
    },
    minimumValue: {
        type: Number,
        required: true,
        unique: true,
    },
    used: {
        type: Boolean,
        required: true,
        unique: true
    },
    startFrom: {
        type: String,
        required: true,
        unique: true
    },
    validUpto: {
        type: String,
        required: true,
        unique: true
    },
    usedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

export const Voucher = mongoose.model("Voucher", voucherSchema);