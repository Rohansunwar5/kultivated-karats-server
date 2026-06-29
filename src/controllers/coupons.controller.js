import { Coupon } from "../models/coupons.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getProductPriceDetails } from "../utils/DiamondPriceCalculation.js";
import { Product } from "../models/products.model.js";

const verifyCoupon = asyncHandler( async (req, res) => {
    try {

        const { code, cart } = req.body;
        
        if ( !code )
            throw new ApiError(404, "No coupon code found!");

        if ( !req?.user ) {
            throw new ApiError(400, "User not found", [ "Log in to use coupons!" ]);
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

        if(coupon?.type === "making_waiver") {
            let totalMakingChargesDiscount = 0;

            for(let i = 0; i< cart?.length; i++) {
                const cartItem = cart[i];

                const product = await Product.findById(cartItem?.product?._id || cartItem?.product);

                if(product) {
                    const priceDetails = getProductPriceDetails({
                        isGemStoneProduct: product?.containsGemstone || cartItem?.containsGemstone || false,
                        isChainAdded: cartItem?.addChain || false,
                        chainKarat: cartItem?.chainGoldCarat || 14,
                        isColouredDiamond: cartItem?.isGemStone || false,
                        karat: cartItem?.karat || 14,
                        pointersWeight: product?.pointersWeight || 0,
                        solitareWeight: product?.solitareWeight || 0,
                        gemStonePointerWeight: product?.gemStoneWeightPointer || 0,
                        gemStoneSolWeight: product?.gemStoneWeightSol || 0,
                        multiDiaWeight: product?.multiDiamondWeight || 0,
                        netWeight: product?.netWeight || 0
                    });

                    const itemMakingCharges = priceDetails?.makingCharges || 0;
                    const totalItemMakingCharges = itemMakingCharges * (cartItem?.quantity || 1);

                    totalMakingChargesDiscount += totalItemMakingCharges * 0.5;

                    console.log(`Product: ${product?.name}, Making Charges: ${itemMakingCharges}, Quantity: ${cartItem?.quantity}, Total: ${totalItemMakingCharges}`);
                    
                }
            } 

            if(coupon?.discount?.upperLimit > 0 && totalMakingChargesDiscount > coupon?.discount?.upperLimit) {
                totalMakingChargesDiscount = coupon?.discount?.upperLimit;
            }

            totalMakingChargesDiscount = Math.round(totalMakingChargesDiscount * 100) / 100;

            return res.status(200).json(new ApiResponse(200, {
                discount: totalMakingChargesDiscount,
                type: "making_waiver",
                upperLimit: coupon?.discount?.upperLimit || 0,
               message: "50% off on making charges for KK Anniversary celebration!"
    }, "Coupon validated!"));
        }

        if ( code?.toUpperCase() == "AT3000") {
            let ringCount = 0;
            if ( cart?.length > 1 ) 
                for ( let i = 0; i < cart?.length; i++ ) {
                    ringCount += cart[i]?.product?.category == "67fe5da50254f62d3e5fe917" ? cart[i]?.quantity : 0; 
                    // () == "67fe5da50254f62d3e5fe917" ? cart[i]?.quantity : 0; 
                    console.log("cart: ",cart[i]?.quantity, cart[i]?.product?.category, "cartValid: ", ringCount);
                }
            if ( !(ringCount >= 2) )
                throw new ApiError(400, "Coupon not applicable", [ "Coupon applicable only when buying two rings!" ]);

            return res.status(200).json(new ApiResponse(200, { discount: 3000, type: "fixed", upperLimit: 3000 }))
        }

        return res.status(200).json(new ApiResponse(200, { 
            discount: coupon?.discount, 
            type: coupon?.type, 
            upperLimit: coupon?.upperLimit 
        }, "Coupons validated!"));

    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode).json(error);
    }
});

const createAnniversaruMakingWaiverCoupon = asyncHandler(async (req,res) => {
    try {
        const anniversaryCouponData = {
            name: "Kultivated Karats FESTIVE SALE",
            code: "KKFESTIVESALE", // You can change this code
            type: "making_waiver",
            discount: {
                amount: 0, // Not used for making_waiver but required field
                upperLimit: 15000 // Optional: Maximum discount limit (e.g., ₹15,000)
            },
            customerLogin: true, // Require user login
            validFrom: new Date("2025-01-20"), // Start date
            validUpto: new Date("2026-02-20"), // End date  
            couponCategory: "custom"
        };

        const existingCoupon = await Coupon.findOne({ code: anniversaryCouponData.code });
        if (existingCoupon) {
            throw new ApiError(400, "Coupon with this code already exists!");
        }
        
        const createdCoupon = await Coupon.create(anniversaryCouponData);
        
        if ( !createdCoupon )
            throw new ApiError(500, "Failed to create anniversary coupon!");
        
        console.log("Anniversary making waiver coupon created:", createdCoupon);

        return res.status(200).json(new ApiResponse(200, createdCoupon, "Anniversary making waiver coupon created successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode || 500).json(error);

    }
})

const getAllCoupons = asyncHandler( async (req, res) => {
    try {
        const coupons = await Coupon.find().populate("category").populate("usedBy");
    
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

export { getAllCoupons, createACoupon, updateACoupon, deleteACoupon, deleteMultipleCoupon, verifyCoupon, createAnniversaruMakingWaiverCoupon };
