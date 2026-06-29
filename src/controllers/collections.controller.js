import { Collection } from "../models/collections.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllCollections = asyncHandler( async ( _, res) => {
    const collections = await Collection.find().populate("banners").populate("products");

    if ( !collections )
        throw new ApiError(500, "Internal server error!");

    return res.status(200).json(new ApiResponse(200, collections, "collections fetched successfully!"));
});

const createACollection = asyncHandler( async (req, res) => {
    try {
        const collection = req.body;
    
        /* Todo: handle banner images */
    
        if ( !collection || Object.keys(collection).length === 0 )
            throw new ApiError(404, "Collection data not found!");
    
        const createdCollection = await Collection.create(collection);
    
        if ( !createdCollection )
            throw new ApiError(500, "Error while creating the collection!");
    
        return res.status(200).json(new ApiResponse(200, createdCollection, "Collection successfully created!"));
    } catch (error) {
        console.log(error)
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), error, "Collection updation failed!"));
    }
});

const updateACollection = asyncHandler( async (req, res) => {
    try {
        const { categoryId } = req.params;
        const updates = req.body;
    
        if ( !categoryId || !updates || Object.keys(updates).length === 0 )
            throw new ApiError(400, "Collection id or updated data not present!");
    
        let updatedCategory = await Collection.findByIdAndUpdate(categoryId, updates).populate("products");

        if ( !updatedCategory )
            throw new ApiError(500, "Error while updating category!");
        
        if ( updatedCategoryFromReq?.banner?.length > 0 )
            updatedCategory = updatedCategory.populate("banners");
    
        
        console.log(updatedCategory);
        
        return res.status(200).json(new ApiResponse(200, updatedCategory, "Collection successfully updated!"));

    } catch (error) {
        console.log(error);
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), error, "Collection updation failed!"));
    }
});

const deleteACollection = asyncHandler( async (req, res ) => {
    const { categoryId } = req.params;

    if ( !categoryId )
        throw new ApiResponse(400, "Collection id not found in the request!")

    const deleteResponse = await Collection.deleteOne({ _id: categoryId});

    if ( !deleteResponse ) 
        throw new ApiResponse(500, "Failed to delete category!");

    res.status(200).json(new ApiResponse(200, deleteResponse, "Collection successfully deleted!"));
});

export { getAllCollections, createACollection, updateACollection, deleteACollection };