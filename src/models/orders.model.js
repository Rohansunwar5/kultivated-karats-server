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
            // Real products: stored as an ObjectId ref, resolved via populate.
            // Gold coins: NOT DB documents (ids "1"/"2"/"5"), so they go in the
            // separate Mixed `goldCoin` field — keeping them out of `product`
            // prevents populate from $in-casting them and throwing. The toJSON
            // transform re-exposes goldCoin as product on the way out.
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            goldCoin: {
                type: Schema.Types.Mixed,
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

// Expose gold-coin cart items under `product` when serialized to JSON, so
// clients read cart.product.* uniformly. Runs after casting, so it can't throw.
orderSchema.set("toJSON", {
    transform: function (_doc, ret) {
        if ( Array.isArray(ret.cart) ) {
            ret.cart = ret.cart.map((item) => {
                if ( item && item.goldCoin && !item.product )
                    return { ...item, product: item.goldCoin };
                return item;
            });
        }
        return ret;
    }
});

export const Order = mongoose.model("Order", orderSchema);