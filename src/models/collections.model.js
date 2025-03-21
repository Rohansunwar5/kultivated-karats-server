import mongoose, { Schema } from "mongoose";

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    banners: [
        {
            type: Schema.Types.ObjectId,
            ref: "Banner"
        },
    ],
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ]
}, { timestamps: true });

export const Collection = mongoose.model("Collection", collectionSchema);