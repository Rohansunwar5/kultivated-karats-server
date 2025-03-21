import mongoose, { Schema } from "mongoose";

const testimonialSchema = new mongoose.Schema({
    sourceLogo: {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    },
    description: {
        type: String,
        required: true,
        // unique: true
    },
    rating: {
        type: Number,
        required: true,
        // unique: true
    },
    customerName: {
        type: String,
        required: true,
        // unique: true
    },
    // startFrom: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // validUpto: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // usedBy: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    // },
}, { timestamps: true });

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);