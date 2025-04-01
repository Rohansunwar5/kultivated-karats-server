import fs from "fs";
import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const uploadBulkImagesToCloudinary = asyncHandler(async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new ApiError(400, "No images uploaded.");
        }

        const imageDir = path.join(process.cwd(), "public", "temp", "images");

        const imageMapping = {};

        for (const file of req.files) {
            const filePath = path.join(imageDir, file.originalname);

            // Extract productId from the file name (e.g., "21_1.jpg" -> productId = "21")
            const productId = file.originalname.split("_")[0];

            const cloudinaryResponse = await uploadOnCloudinary(filePath, "product-images");
            if (!cloudinaryResponse) {
                console.warn(`Failed to upload image: ${file.originalname}`);
                continue;
            }

            if (!imageMapping[productId]) {
                imageMapping[productId] = [];
            }
            imageMapping[productId].push({
                url: cloudinaryResponse.url,
                publicId: cloudinaryResponse.public_id,
            });

            console.log(`Uploaded image: ${file.originalname}`);
        }

        return res
            .status(200)
            .json(new ApiResponse(200, imageMapping, "Images uploaded successfully."));
    } catch (error) {
        console.error("Error uploading bulk images:", error);
        throw new ApiError(500, error.message || "Internal Server Error");
    }
});

export { uploadBulkImagesToCloudinary };