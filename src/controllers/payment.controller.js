import Razorpay from "razorpay";
import { GiftCard } from "../models/giftCards.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createHmac } from 'crypto';
// import { app } from "../../../../backend/src/app.js";

console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET 
});

// app.use(express.urlencoded({ extended: false }));

const verifyGiftCard = asyncHandler( async () => {
    try {
        
    } catch (error) {
        
    }
});

const validatePayment = asyncHandler( async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
        if ( !razorpay_order_id | !razorpay_payment_id | !razorpay_signature)
            throw new ApiError(400, "Requestes parameters not present!");

        const sha = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest("hex");
        if ( digest !== razorpay_signature ) 
            throw new ApiError(400, { isValid: false }, "Transaction not legit!");
        return res.status(200).json(new ApiResponse(200, { isValid: true }, "Transaction valid"));
    } catch (error) {
        console.log(error);        
        return res.status(error?.statusCode).json(error);
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

const createAnOrder = asyncHandler( async (req, res) => {
    try {
        const { options } = req.body;
    
        // if ( !(req?.user?.role == "Admin") )
        //     throw new ApiError(400, "Unauthorized request!");

        if ( !options )
            throw new ApiError(400, "options data not present in the request!");
    
        const order = await razorpay.orders.create(options);
    
        if ( !order )
            throw new ApiError(500, "Failed to facilitate payment!");
        
        console.log(order);

        return res.status(200).json(new ApiResponse(200, order, "razorpay order created successfully!"));
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

export { createAnOrder, validatePayment };