import { Blog } from "../models/blogs.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Reel } from "../models/reels.model.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
};

const getAllReels = asyncHandler( async ( _, res ) => {
    try {
        const response = await Reel.find();
        
        if ( !response ) throw new ApiError(500, "Failed to fetch reels!");
        
        return res.status(200).json(new ApiResponse(200, response, "reels fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
});

const createAReel = asyncHandler( async (req, res) => {
    try {
        const { reelData } = req.body; 
        
        if ( !reelData ) throw new ApiError(400, "Reel data missing in the req body!!");
        
        const response = await Reel.create(reelData);

        console.log(response);

        if ( !response ) throw new ApiError(500, "Response error!!");

        return res.status(200).json(new ApiResponse(200, response, "Reel created successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.status || 500).json(error);
    }
});

const deleteAReel = asyncHandler( async (req, res) => {
    try {
        const { reelId } = req.params;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !reelId )
            throw new ApiError(400, "reel ID not received!");
    
        const deleteResponse = await Reel.deleteOne({ _id: reelId });
    
        console.log(deleteResponse);

        if  ( !deleteResponse )
            throw new ApiError(500, "Unable to delete reel!");
    
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Reel deleted successfully"));
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

export { getAllReels, createAReel, deleteAReel };