import { GiftCard } from "../models/giftCards.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyGiftCard = asyncHandler( async () => {
    try {
        
    } catch (error) {
        
    }
});

const getAllGiftCards = asyncHandler( async (req, res) => {
    try {
        const coupons = await GiftCard.find();
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !coupons )
            throw new ApiError(404, "No coupons found!");
    
        return res.status(200).json(new ApiResponse(200, coupons, "GiftCards fetched successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const createAGiftCard = asyncHandler( async (req, res) => {
    try {
        const { giftCardData } = req.body;
    
        if ( !(req?.user?.role == "Admin") )
            throw new ApiError(400, "Unauthorized request!");
        
        if ( !giftCardData )
            throw new ApiError(400, "GiftCard data not present in the request!");
    
        const createdGiftCard = await GiftCard.create(couponData);
    
        if ( !createdGiftCard )
            throw new ApiError(500, "Failed to create coupon!");
        
        console.log(createdGiftCard);

        return res.status(200).json(new ApiResponse(200, createdGiftCard, "GiftCard created successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const updateAGiftCard = asyncHandler( async (req, res) => {
    try {
        const { giftCardId } = req.params;
        const { updatedGiftCardFromReq } = req.body;
    
        if ( !(req?.user?.role == "Admin") )
            throw new ApiError(400, "Unauthorized request!");
    
        if ( !giftCardId || !updatedGiftCardFromReq ) 
            throw new ApiError(400, "GiftCard Id or coupon data not found!");
    
        const updatedGiftCard = await GiftCard.findByIdAndUpdate(giftCardId, updatedGiftCardFromReq, { new: true });
    
        if ( !updatedGiftCard )
            throw new ApiError(500, "Failed to update coupon!");
    
        return res.status(200).json(new ApiResponse(200, updatedGiftCard, "GiftCard updated successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const deleteAGiftCard = asyncHandler( async (req, res) => {
    try {
        const { giftCardId } = req.params;
    
        if ( !(req?.user?.role == "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if  ( !giftCardId ) 
            throw new ApiError(400, "GiftCard ID not found!");
    
        const deleteResponse = await GiftCard.deleteOne({ _id: couponId });
    
        if ( !deleteResponse )
            throw new ApiError(500, "Failed to delete coupon!");
    
        return res.status(200).json(new ApiResponse(200, deleteResponse, "GiftCard deleted successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const deleteMultipleGiftCard = asyncHandler(async (req, res) => {
    try {
        const { ids } = req.body;
    
        if ( !(req?.user?.role == "Admin") )
            throw new ApiError(400, "Unauthorized request!");
    
        if ( !ids || !(ids instanceof Array) )
            throw new ApiError(400, "GiftCard ids either not present or not an array!");
    
        const deleteResponse = await GiftCard.deleteMany({ _id: { $in: ids } });

        if ( !deleteResponse )
            throw new ApiError(500, "Failed to delete coupons!");
    
        res.status(200).json(new ApiResponse(200, deleteResponse, "GiftCards deleted successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

export { getAllGiftCards, createAGiftCard, updateAGiftCard, deleteAGiftCard, deleteMultipleGiftCard, verifyGiftCard };