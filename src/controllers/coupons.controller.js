import { Coupon } from "../models/coupons.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyCoupon = asyncHandler( async (req, res) => {
    try {
        const { code, cart } = req.body;
        if ( !code )
            throw new ApiError(404, "No coupon code found!");

        if ( !req?.user ) {
            throw new ApiError(400, "User not found", [ "Log in to use copuons!" ]);
        }

        if ( !cart || cart?.length == 0 ) {
            throw new ApiError(400, "Cart not present or empty", [ "Cannot apply coupons to empty cart!" ]);
        }

        const coupon = await Coupon.findOne({ code : code?.toUpperCase() }).populate("category").populate("usedBy");

        console.log(coupon);

        if ( !coupon )
            throw new ApiError(404, "No such coupon found!", [ "No such coupon found!"]);

        // if ( Date.now() > coupon?.validUpto || Date.now() < coupon?.validFrom )
            // throw new ApiError(404, "Invalid coupon found!", [ "Invalid coupon!"]);

        const couponUsers = coupon?.usedBy?.filter(user => user._id == req?.user?._id);

        if ( couponUsers?.length != 0 )
            throw new ApiError(404, "You have already used this coupon!", [ "You have already used this coupon once!"]);

        if ( code?.toUpperCase() == "AT3000") {
            let ringCount = 0;
            if ( cart?.length > 1 ) 
                for ( let i = 0; i < cart?.length; i++ ) {
                    ringCount += cart[i]?.product?.category?.toLowerCase() == "67fe5da50254f62d3e5fe917" ? cart[i]?.quantity : 0; 
                    console.log("cart: ",cart[i]?.quantity, cart[i]?.product?.category, "cartValid: ", ringCount);
                }
            if ( !(ringCount >= 2) )
                throw new ApiError(400, "Coupon not applicable", [ "Coupon applicable only when buying two rings!" ]);

            return res.status(200).json(new ApiResponse(200, { discount: 3000, type: "fixed", upperLimit: 3000 }))
        }

        return res.status(200).json(new ApiResponse(200, { discount: coupon?.discount, type: coupon?.type, upperLimit: coupon?.upperLimit }, "Coupons validated!"));

    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const getAllCoupons = asyncHandler( async (req, res) => {
    try {
        const coupons = await Coupon.find().populate("category").populate("usedBy");
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !coupons )
            throw new ApiError(404, "No coupons found!");
    
        return res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const createACoupon = asyncHandler( async (req, res) => {
    try {
        const { couponData } = req.body;
    
        // if ( !(req?.user?.role == "Admin") )
            // throw new ApiError(400, "Unauthorized request!");
        
        if ( !couponData )
            throw new ApiError(400, "Coupon data not present in the request!");
    
        const createdCoupon = await Coupon.create(couponData)?.populate("usedBy")?.populate("category");
    
        if ( !createdCoupon )
            throw new ApiError(500, "Failed to create coupon!");
        
        console.log(createdCoupon);

        return res.status(200).json(new ApiResponse(200, createdCoupon, "Coupon created successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const updateACoupon = asyncHandler( async (req, res) => {
    try {
        const { couponId } = req.params;
        const { updatedCouponFromReq } = req.body;
    
        if ( !(req?.user?.role == "Admin") )
            throw new ApiError(400, "Unauthorized request!");
    
        if ( !couponId || !updatedCouponFromReq ) 
            throw new ApiError(400, "Coupon Id or coupon data not found!");
    
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updatedCouponFromReq, { new: true });
    
        if ( !updatedCoupon )
            throw new ApiError(500, "Failed to update coupon!");
    
        return res.status(200).json(new ApiResponse(200, updatedCoupon, "Coupon updated successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const deleteACoupon = asyncHandler( async (req, res) => {
    try {
        const { couponId } = req.params;
    
        if ( !(req?.user?.role == "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if  ( !couponId ) 
            throw new ApiError(400, "Coupon ID not found!");
    
        const deleteResponse = await Coupon.deleteOne({ _id: couponId });
    
        if ( !deleteResponse )
            throw new ApiError(500, "Failed to delete coupon!");
    
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Coupon deleted successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const deleteMultipleCoupon = asyncHandler(async (req, res) => {
    try {
        const { ids } = req.body;
    
        if ( !(req?.user?.role == "Admin") )
            throw new ApiError(400, "Unauthorized request!");
    
        if ( !ids || !(ids instanceof Array) )
            throw new ApiError(400, "Coupon ids either not present or not an array!");
    
        const deleteResponse = await Coupon.deleteMany({ _id: { $in: ids } });

        if ( !deleteResponse )
            throw new ApiError(500, "Failed to delete coupons!");
    
        res.status(200).json(new ApiResponse(200, deleteResponse, "Coupons deleted successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

export { getAllCoupons, createACoupon, updateACoupon, deleteACoupon, deleteMultipleCoupon, verifyCoupon };