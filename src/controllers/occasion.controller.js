import { Occasion } from "../models/occasions.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllOccasions = asyncHandler( async ( _, res) => {
    const occasions = await Occasion.find().populate("banners").populate("products");

    if ( !occasions )
        throw new ApiError(500, "Internal server error!");

    return res.status(200).json(new ApiResponse(200, occasions, "Categories fetched successfully!"));
});

const createAnOccasion = asyncHandler( async (req, res) => {
    try {
        const { occasion } = req.body;
    
        /* Todo: handle banner images */
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !occasion )
            throw new ApiError(404, "Occasion data not found!");
    
        const createdOccasion = await Occasion.create(occasion);
    
        if ( !createdOccasion )
            throw new ApiError(500, "Error while creating the occasion!");
    
        return res.status(200).json(new ApiResponse(200, createdOccasion, "Occasion successfully created"));
    } catch (error) {
        
    }
});

const updateAnOccasion = asyncHandler( async (req, res) => {
    try {
        const { occasionId } = req.params;
        const { updatedOccasionFromReq } = req.body;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !occasionId || !updatedOccasionFromReq )
            throw new ApiError(400, "Occasion id or updated occasion not present!");
    
        console.log(occasionId, updatedOccasionFromReq);        

        let updatedOccasion = await Occasion.findByIdAndUpdate(occasionId, updatedOccasionFromReq).populate("products").populate("banners");

        if ( !updatedOccasion )
            throw new ApiError(500, "Error while updating occasion!");
        
        if ( updatedOccasionFromReq?.banner?.length > 0 )
            updatedOccasion = updatedOccasion.populate("banners");
    
        
        console.log(updatedOccasion);
        
        return res.status(200).json(new ApiResponse(200, updatedOccasion, "Occasion successfully updated!"));

    } catch (error) {
        console.log(error);
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), error, "Occasion updation failed!"));
    }
});

const deleteAnOccasion = asyncHandler( async (req, res ) => {
    const { occasionId } = req.params;

    if ( !(req?.user?.role === "Admin") )
        throw new ApiError(400, "Unauthorized requrest!");

    if ( !occasionId )
        throw new ApiResponse(400, "Occasion id not found in the request!")

    const deleteResponse = await Occasion.deleteOne({ _id: occasionId});

    if ( !deleteResponse ) 
        throw new ApiResponse(500, "Failed to delete occasion!");

    res.status(200).json(new ApiResponse(200, deleteResponse, "Occasion successfully deleted!"));
});

export { getAllOccasions, createAnOccasion, updateAnOccasion, deleteAnOccasion };