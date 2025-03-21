import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.service.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



const uploadAnImage = asyncHandler( async (req, res) => {
    try {

        const fileType = req?.headers?.filetype;

        console.log(fileType);

        if ( !fileType ) throw new ApiError(400, "File type missing in the request!", ["File type missing in the request!"]);

        const localFilePath = req.files?.[fileType]?.[0]?.path;
        console.log("file path : " + localFilePath);
        
        if ( !localFilePath ) throw new ApiError(400, "File path missing in the request!", ["File path missing in the request!"]);

        const file = await uploadOnCloudinary(localFilePath, fileType);

        if ( !file ) throw new ApiError(500, "Failed to upload media!", ["Failed to upload media"]);
        console.log(file);
        
        return res.status(200).json(new ApiResponse(200, file, "File uploaded successfully!"));

    } catch (error) {

        console.log(error);
        return res.status(error?.statusCode).json(error);
    
    }
});

const deleteAnImage = asyncHandler( async (req, res) => {
    try {
        const publicId = req?.headers?.publicid;
        
        if ( !publicId ) throw new ApiError(400, "Public Id not present in the request!", ["Public Id not present in the request!"]);
        
        const response = await deleteFromCloudinary(publicId); 

        if ( !response ) throw new ApiError(500, "Error while deleting asset!", ["Error while deleting asset!"]);

        if ( response?.result !== "ok" ) throw new ApiError(404, "File with the provided public id not found!", ["File with the provided public id not found!"]);

        return res.status(200).json(new ApiResponse(200, response, "File deletion successfull!"))

    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

export { deleteAnImage, uploadAnImage };