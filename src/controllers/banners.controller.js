import Banner from "../models/banners.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllBanners = asyncHandler( async (_, res) => {
    try {
        const allBanners = await Banner.find();
    
        if ( !allBanners )
            new ApiError(404, "No banners found!");
    
        return res.status(200).json(new ApiResponse(200, allBanners, "Banners fetched successfully!"));
    } catch (error) {
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), {}, "Unable to fetch banners!!"));
    }

});

const getAllBannersOfAType = asyncHandler( async (req, res) => {
    const { bannerType } = req.params;

    if  ( !bannerType || typeof bannerType !== "string" )
        new ApiError(400, "Banner type not received!");

    const banners = await Banner.find({ bannerType: bannerType });

    if ( !banners )
        new ApiError(500, "Failed to fetch banners!");

    return res.status(200).json(new ApiResponse(200, banners, "Banners successfully fetched!"));
});

const getABannerById = asyncHandler( async (req, res) => {
    try {
        const { bannerId } = req.params;
        if ( !bannerId )
            throw new ApiError(400, "No banner name received!");
    
        const banner = await Banner.findById(bannerId);
        if ( !banner )
            throw new ApiError(404, "No banner with the name "+bannerName+" found");
    
        return res.status(200).json(new ApiResponse(200, banner, "Banner fetched successfully"));    
    } catch (error) {
        res.status(error?.status || 500).json(error);
    }
});

const createABanner = asyncHandler( async (req, res) => {
    
    try {
        const { bannerData } = req.body;
    
        /* Todo: handle images: handle on the banner upload frontend */
        
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !bannerData )
            throw new ApiError(400, "Banner data not found in the request body!");
    
        const bannerCreationResponse = await Banner.create(bannerData);

        
        
        if ( !bannerCreationResponse )
            throw new ApiError(500, "Banner creation failed!");
        
        console.log(bannerCreationResponse);

        return res.status(200).json(new ApiResponse(200, bannerCreationResponse, "Banner created successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.status || 500).json(error);   
    }
});

const updateABanner = asyncHandler( async (req, res) => {
    const { bannerId } = req.params;
    const { updatedBannerDataFromReq } = req.body;

    if ( !(req?.user?.role === "Admin") )
        throw new ApiError(400, "Unauthorized requrest!");

    if  ( !bannerId )
        throw new ApiError(400, "Banner ID not received!");

    const updatedBannerData = await Banner.updateOne({ _id: bannerId }, updatedBannerDataFromReq );

    if ( !updatedBannerData ) 
        throw new ApiError(500, "Banner updation failed!");

    return res.status(200).json(new ApiResponse(200, updatedBannerData, "Banner updated successfully!"));
});

const deleteABanner = asyncHandler( async (req, res) => {
    try {
        const { bannerId } = req.params;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !bannerId )
            throw new ApiError(400, "Banner ID not received!");
    
        const deleteResponse = await Banner.deleteOne({ _id: bannerId }).populate("bannerCategory");
    
        if  ( !deleteResponse )
            throw new ApiError(500, "Unable to delete banner!");
    
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Banner deleted successfully"));
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

export { createABanner, getABannerById, getAllBanners, getAllBannersOfAType, updateABanner, deleteABanner }