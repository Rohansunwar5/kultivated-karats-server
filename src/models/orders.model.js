import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    total: {
        type: Number,
        required: true,
    },
    deliveryAddress: {
        line1: { type: String },
        line2: { type: String },
        company: { type: String },
        city: { type: String },
        postalCode: { type: Number },
        state: { type: String },
    },
    orderStatus: {
        type: String,
        enum: [ "Fulfilled", "Pending", "In-transit" ], /* Order Statuses to be filled */            
        required: true,
        default: "Pending"
    },
    cart: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: Number,
            color: String,
            karat: Number,
            totalPrice: Number,
        },
    ],
    note: {
        type: String,
    }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);