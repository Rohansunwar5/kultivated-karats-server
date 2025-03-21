import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Store } from "../models/stores.model.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
};

const getAllStores = asyncHandler( async ( _, res ) => {
    try {
        const response = await Store.find();
        
        if ( !response ) throw new ApiError(500, "Failed to fetch stores!");
        
        return res.status(200).json(new ApiResponse(200, response, "Store fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
});

const createAStore = asyncHandler( async (req, res) => {
    try {
        const { storeData } = req.body; 
        
        if ( !storeData ) throw new ApiError(400, "Store data missing in the req body!!");
        
        const response = await Store.create(storeData);

        console.log(response);

        if ( !response ) throw new ApiError(500, "Response error!!");

        return res.status(200).json(new ApiResponse(200, response, "Store created successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.status || 500).json(error);
    }
});

const deleteAStore = asyncHandler( async (req, res) => {
    try {
        const { storeId } = req.params;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !storeId )
            throw new ApiError(400, "ID not received!");
    
        const deleteResponse = await Store.deleteOne({ _id: storeId });
    
        console.log(deleteResponse);

        if  ( !deleteResponse )
            throw new ApiError(500, "Unable to delete store!");
    
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Store deleted successfully"));
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

export { getAllStores, createAStore, deleteAStore };