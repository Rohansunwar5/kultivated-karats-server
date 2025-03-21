import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    imageUrl: {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        }
    },
    bannerName: {
        type: String,
        required: true
    },
    // bannerText: {
    //     type: String,
    //     // required: true
    // },
    bannerType: {
        type: String,
        required: true,
        enum: [ "hero-section-banner", "category-banner", "collection-banner" ],
    },
    validFrom: {
        type: String,
    },
    validUpto: {
        type: String
    }
}, { timestamps: true });

// export const Banner = mongoose.model("Banner", bannerSchema);

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);

export default Banner;