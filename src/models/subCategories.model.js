import mongoose, { Schema } from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
    },
    parentCategory: {
        type: String,
        required: true
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    description: {
        type: String,
        required: true
    },
    banners: [
        {
            type: Schema.Types.ObjectId,
            ref: "Banners"
        },
    ]
}, { timestamps: true });

export const SubCategory = mongoose.model("SubCategory", subCategorySchema);