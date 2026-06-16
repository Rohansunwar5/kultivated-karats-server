import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        // required: true,
        // unique: true
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
            // Mixed (not a strict ObjectId ref) so an order can contain both real
            // Product references AND synthetic gold-coin items (non-ObjectId ids
            // like "1"/"2"/"5"). Real products are normalised to their ObjectId
            // before saving so .populate("cart.product") still works for them.
            product: {
                type: Schema.Types.Mixed,
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