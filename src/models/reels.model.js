import mongoose, { Schema } from "mongoose";

const reelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
        // unique: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    }
}, { timestamps: true });

export const Reel = mongoose.model("Reel", reelSchema);