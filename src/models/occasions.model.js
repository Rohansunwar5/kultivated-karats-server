import mongoose, { Schema } from "mongoose";

const occasionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    banners: [
        {
            type: Schema.Types.ObjectId,
            ref: "Banners"
        },
    ],
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },
    ]
}, { timestamps: true });

export const Occasion = mongoose.model("Occasion", occasionSchema);