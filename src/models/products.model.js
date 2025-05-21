import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        // required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        // required: true,
        ref: "Category",
        index: true
    },
    subCategories: [
        {
            type: Schema.Types.ObjectId,
            // required: true,
            ref: "SubCategories"
        },
    ],
    collections: [
        {
            type: Schema.Types.ObjectId,
            // required: true,
            ref: "Collection",
            index: true
        },
    ],
    goldWeight: {
        type: Number,
        // required: true,
    },
    diamondWeight: {
        type: Number,
        // required: true
    },
    netWeight: {
        type: Number,
        // required: true
    },
    solitareWeight: {
        type: Number,
        // required: true
    },
    grossWeight: {
        type: Number,
        // required: true
    },
    noOfSolitares: {
        type: Number,
        // required: true
    },
    noOfMultiDiamonds: {
        type: Number,
        // required: true
    },
    multiDiamondWeight: {
        type: Number,
        // required: true
    },
    totalKarats: [{
        type: Number,
        // required: true,
    }],
    gender: {
        type: String,
        // required: true,
        enum: [ "Male", "Female", "Unisex" ]
    },
    shapeOfSolitare: {
        type: String,
        // required: true,
    },
    shapeOfMultiDiamonds: {
        type: String,
        // required: true,
    },
    shapeOfPointers: {
        type: String,
    },
    noOfPointers: {
        type: Number
    },
    gemStoneColour: [{
        type: String,
    }],
    description: {
        type: String,
        default: ""
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        // required: true,
        index: true
    },
    quantitySold: {
        type: Number,
        default: 0
    },
    imageUrl: [
        {
            url: {
                type: String,
                // required: true
            },
            publicId: {
                type: String,
                // required: true
            }
        }
    ],
    isPendantFixed: {
        type: Boolean,
    },    
    containsGemstone: {
        type: Boolean,
        // required: true,
        default: false
    },
    gemStoneWeightSol: {
        type: Number,
        default: 0
    },
    isMrpProduct: {
        type: Boolean,
        default: false
    },
    pointersWeight: {
        type: Number,
        default: 0
    },
    gemStoneWeightPointer: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);