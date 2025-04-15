import mongoose, { Schema } from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    subCategories: [
        {
            type: Schema.Types.ObjectId,
            // required: true,
            ref: "SubCategory"
        }
    ],
    products: [
        {
            type: Schema.Types.ObjectId,
            // required: true,
            ref: "Product"
        }
    ],
    banners: [
        {
            type: Schema.Types.ObjectId,
            ref: "Banner"
        },
    ],
    description: {
        type: String,
        // required: true
    },
}, { timestamps: true });

export const Category = mongoose.model("Category", categorySchema);