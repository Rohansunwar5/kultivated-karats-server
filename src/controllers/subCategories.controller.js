import { SubCategory } from "../models/subCategories.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllSubCategories = asyncHandler( async ( _, res) => {
    const subCategories = await SubCategory.find().populate("banners");

    if ( !subCategories )
        throw new ApiError(500, "Internal server error!");

    return res.status(200).json(new ApiResponse(200, subCategories, "Categories fetched successfully!"));
});

const createASubCategory = asyncHandler( async (req, res) => {
    try {
        const { subCategory } = req.body;
    
        /* Todo: handle banner images */
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !subCategory )
            throw new ApiError(404, "SubCategory data not found!");
    
        const createdSubCategory = await SubCategory.create(subCategory);
    
        if ( !createdSubCategory )
            throw new ApiError(500, "Error while creating the category!");
    
        return res.status(200).json(new ApiResponse(200, createdSubCategory, "SubCategory successfully created"));
    } catch (error) {
        
    }
});

const updateASubCategory = asyncHandler( async (req, res) => {
    try {
        const { subCategoryId } = req.params;
        const { updatedCategoryFromReq } = req.body;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !subCategoryId || !updatedCategoryFromReq )
            throw new ApiError(400, "SubCategory id or updated category not present!");
    
        console.log(subCategoryId, updatedCategoryFromReq);        

        let updatedCategory = await SubCategory.findByIdAndUpdate(subCategoryId, updatedCategoryFromReq).populate("products");

        if ( !updatedCategory )
            throw new ApiError(500, "Error while updating subcategory!");
        
        if ( updatedCategoryFromReq?.banner?.length > 0 )
            updatedCategory = updatedCategory.populate("banners");
    
        
        console.log(updatedCategory);
        
        return res.status(200).json(new ApiResponse(200, updatedCategory, "SubCategory successfully updated!"));

    } catch (error) {
        console.log(error);
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), error, "SubCategory updation failed!"));
    }
});

const deleteASubCategory = asyncHandler( async (req, res ) => {
    const { subCategoryId } = req.params;

    if ( !(req?.user?.role === "Admin") )
        throw new ApiError(400, "Unauthorized requrest!");

    if ( !subCategoryId )
        throw new ApiResponse(400, "SubCategory id not found in the request!")

    const deleteResponse = await SubCategory.deleteOne({ _id: subCategoryId});

    if ( !deleteResponse ) 
        throw new ApiResponse(500, "Failed to delete category!");

    res.status(200).json(new ApiResponse(200, deleteResponse, "SubCategory successfully deleted!"));
});

export { getAllSubCategories, createASubCategory, updateASubCategory, deleteASubCategory };