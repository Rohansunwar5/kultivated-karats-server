import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler( async (req, _ , next) => { /* "_" is "res": production grade practice */
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if ( !token ) 
            throw new ApiError(401, "Unauthorized request!", [{type: "email", errMsg: "Unauthorized request!"}]);
    
        const decodedTokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedTokenData?._id).populate("wishList.product").populate("videoCallCart.product").populate("cart.product").populate("orders.product").select("-password -refreshToken");
        if ( !user ) 
            new ApiError(401, "Invalid Access Token!", [{type: "email", errMsg: "Invalid access token!"}]);
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error || "Invalid Access Token!");
    }
});