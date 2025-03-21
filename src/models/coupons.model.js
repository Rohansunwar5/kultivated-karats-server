import mongoose, { Schema } from "mongoose";

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true
    },
    validUpto: {
        type: Date,
        default: ""
    },
    validFrom: {
        type: Date,
        default: ""
    },
    usedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: "Users",
        }
    ],
    type: {
        type: String,
        required: true,
        enum: [ "percentage", "fixed" ],
    },
    discount: {
        amount: {
            type: Number,
            required: true
        },
        upperLimit: {
            type: Number,
            required: true,
            default: 0
        }
    },
    customerLogin: {
        type: Boolean,
        required: true,
        default: false,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        // required: true,
    },
    couponCategory: {
        type: String,
        enum: [ "normal", "custom" ],
        default: "normal",    
    }
}, { timestamps: true });

export const Coupon = mongoose.model("Coupon", couponSchema);