import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    blogName: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    blogImgUrl: {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        }
    },
    blogContent: {
        design: {
            type: Object,
            required: true,
        },
        markup: {
            type: String,
            required: true,
        }
    },
}, { timestamps: true });

export const Blog = mongoose.model("Blog", blogSchema);