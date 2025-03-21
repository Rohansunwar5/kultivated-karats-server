import { Category } from "../models/categories.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllCategories = asyncHandler( async ( _, res) => {
    const categories = await Category.find().populate("banners");

    if ( !categories )
        throw new ApiError(500, "Internal server error!");

    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully!"));
});

const createACategory = asyncHandler( async (req, res) => {
    try {
        const { category } = req.body;
    
        /* Todo: handle banner images */
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !category )
            throw new ApiError(404, "Category data not found!");
    
        const createdCategory = await Category.create(category);
    
        if ( !createdCategory )
            throw new ApiError(500, "Error while creating the category!");
    
        return res.status(200).json(new ApiResponse(200, createdCategory, "Category successfully created"));
    } catch (error) {
        console.log(error);
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), error, "Category creation failed!"));
    }
});

const updateACategory = asyncHandler( async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { updatedCategoryFromReq } = req.body;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !categoryId || !updatedCategoryFromReq )
            throw new ApiError(400, "Category id or updated category not present!");
    
        console.log(categoryId, updatedCategoryFromReq);        

        let updatedCategory = await Category.findByIdAndUpdate(categoryId, updatedCategoryFromReq).populate("products");

        if ( !updatedCategory )
            throw new ApiError(500, "Error while updating category!");
        
        if ( updatedCategoryFromReq?.banner?.length > 0 )
            updatedCategory = updatedCategory.populate("banners");
    
        
        console.log(updatedCategory);
        
        return res.status(200).json(new ApiResponse(200, updatedCategory, "Category successfully updated!"));

    } catch (error) {
        console.log(error);
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), error, "Category updation failed!"));
    }
});

const deleteACategory = asyncHandler( async (req, res ) => {
    const { categoryId } = req.params;

    if ( !(req?.user?.role === "Admin") )
        throw new ApiError(400, "Unauthorized requrest!");

    if ( !categoryId )
        throw new ApiResponse(400, "Category id not found in the request!")

    const deleteResponse = await Category.deleteOne({ _id: categoryId});

    if ( !deleteResponse ) 
        throw new ApiResponse(500, "Failed to delete category!");

    res.status(200).json(new ApiResponse(200, deleteResponse, "Category successfully deleted!"));
});

export { getAllCategories, createACategory, updateACategory, deleteACategory };