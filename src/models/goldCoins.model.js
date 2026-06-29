import mongoose from "mongoose";

const goldCoinSchema = new mongoose.Schema({
    name: { type: String, required: true },
    weight: { type: Number, required: true, unique: true }, // grams; also the public _id the order flow keys on
    karats: { type: Number, required: true, default: 24 },
    imageUrl: [
        {
            url: { type: String },
            publicId: { type: String, default: "" },
        },
    ],
    premiumPercent: { type: Number, required: true, default: 16 }, // markup over spot gold rate, was hardcoded 16 in the frontend
}, { timestamps: true });

export const GoldCoin = mongoose.model("GoldCoin", goldCoinSchema);
