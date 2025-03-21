import mongoose, { Schema } from "mongoose";

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    iFrameUrl: {
        type: String,
        required: true,
    },
    storeTiming: {
        type: String,
        required: true,
    },
    redirectionLink: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export const Store = mongoose.model("Store", storeSchema);