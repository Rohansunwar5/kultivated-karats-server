import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/* Important : fix and update code for guest user */

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();        
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false }); /* To stop the validation, as we are not passing in all the fields */        
        
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh tokens!");
    }
};

const registerUser = asyncHandler( async (req, res) => {
    try {
        let createUserResponse;
        
        const { role } = req.body;

        // if ( role ) {
        //     createUserResponse = await User.create();
        //     return res.status(201).json(new ApiResponse(200, createUserResponse, "Guest session Registered successfully!"));
        // } else
        // {
            
            const { email, phoneNumber} = req.body.userData;
            const userData = req.body.userData;

            if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))) throw new ApiError(400, "Invalid email address!");
            
            console.log("inside register user > ");
            
            const existingUserEmail = await User.findOne({ email });
            
            const existingUserPhone = await User.findOne({ phoneNumber });
            
            // console.log(existingUser);
            
            if ( existingUserEmail && existingUserPhone ) {
                const error = new ApiError(409, "Email or phone number already exists!", [ { type: "phoneNumber", message: "Phone no already exists!"}, { type: "email", message: "Email already exists!"} ]);
                console.log(error);
                throw error;
            }
            
            if ( existingUserEmail ) {
                const error = new ApiError(409, "Email already exists!", [ { type: "email", message: "Email already exists!"} ]);
                console.log(error);
                throw error;
            }
            
            if ( existingUserPhone ) {
                const error = new ApiError(409, "Phone number already exists!", [ { type: "phoneNumber", message: "Phone no already exists!"} ]);
                console.log(error);
                throw error;
            }

            createUserResponse = await User.create(userData);
        
            const user = await User.findById(createUserResponse._id).select("-password -refreshToken");
            if ( !user ) throw new ApiError(500, "Internal server error!");
            console.log(user);
            return res.status(201).json(new ApiResponse(200, user, "User Registered successfully!"));
        // }
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode || null).json(error);
    }
});

const loginUser = asyncHandler( async(req, res) => {
    console.log(mongoose.models);
    try {
        const { email, phoneNumber, password } = req.body;
    
        if ( !email && !phoneNumber )
            throw new ApiError(400, "Email or phone number required!");
    
        const user = await User.findOne({$or: [ { email }, { phoneNumber } ]});
    
        if ( !user ) 
            throw new ApiError(404, "User not found!", [{type: "email", errMsg: "User not found!"}]);
    
        const isPasswordValid = await user.isPasswordCorrect(password);
    
        if  ( !isPasswordValid )
            throw new ApiError(401, "Invalid password!", [{type: "password", errMsg: "Invalid password!"}]);
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken").populate("wishList.product").populate("cart.product").populate("videoCallCart.product").populate("orders");

        console.log(loggedInUser);
        
        return res.status(200).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User logged in successfully!"));
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode).json(error);
    }

});

const logoutUser = asyncHandler( async (req, res) => {
    const currentUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    );

    if ( !currentUser )
        throw new ApiError(404, "User not logged in or found in the database!");

    return res.status(200).clearCookie("accessToken", cookieOptions).clearCookie("refreshToken", cookieOptions).json(new ApiResponse(200, {}, "User logged out successfully!"));
});

const getCurrentUser = asyncHandler( async(req, res) => {
    try {

        console.log(req.user);

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            req?.user,
            "User fetched successfully! : "+req?.user?.firstName
        ));

        const user = await User.findById(req?.user?._id).select("-password -refreshToken").pupulate("wishList.product").populate("cart.product").populate("orders");

        if ( !user ) throw ApiError(404, "No user present!");

        console.log(req.user);
        return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully!"));
    } catch (error) {
        console.log(error);
        
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), {req}, "Failed to fetch user!"));       
    }
});

const refreshAccessToken = asyncHandler( async (req, res) => {
    try {
            const recievedRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        
            if ( !recievedRefreshToken )
                throw new ApiError(401, "Unauthorized request. No refresh token recieved!");
        
            const decodedToken = jwt.verify(recievedRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
            const currentUser = await User.findById(decodedToken?._id);
        
            if ( !currentUser )
                throw ApiError(401, "Invalid refresh token!");
        
            if ( recievedRefreshToken !== currentUser?.refreshToken)
                throw new ApiError(401, "Refresh token expired or is used!");
        
            const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(currentUser?._id);
        
            return res.status(200).cookie("refreshToken", refreshToken, cookieOptions).cookie("accessToken", accessToken, cookieOptions).json(new ApiResponse(200, { accessToken, refreshToken }));
    } catch (error) {
        res.status(401).json({ errMsg: error?.message || "Invalid refresh token"});
    }        
});

const updateAccountDetails = asyncHandler( async(req, res) => {
    try {
        const { user } = req.body;

        const updateType = req.headers["update-type"]; 
    
        console.log(user);
        
        let currentUser;
    
        if ( updateType == "self")
            currentUser = await User.findByIdAndUpdate(req.user?._id, {...user}, { new: true }).select("-password -refreshToken").pupulate("wishList.product").populate("cart.product").populate("orders");
    
        else if ( updateType == "other")
            currentUser = await User.findByIdAndUpdate(user?._id, {...user}, { new: true }).select("-password -refreshToken").pupulate("wishList.product").populate("cart.product").populate("orders");
    
        console.log(updateType, currentUser);
    
        if ( !currentUser ) throw new ApiError(404, "User not found!");
    
        return res.status(200).json(new ApiResponse(200, currentUser, "Account details updated successfully!"));    
    
    } catch (error) {
        console.log(error);
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), {}, "Account updation failed!"));
    }
});

const updateUserCart = asyncHandler( async (req, res) => {
    try {
        const { updatedCart } = req.body;
    
        if ( !updatedCart || !req?.user?._id )
            throw new ApiError(400, "user._id or updatedCart not received!");
    
        const updatedUser = await User.findOneAndUpdate({ _id: req?.user?._id }, { $set : { cart: updatedCart } }, { new: true }).select("-password -refreshToken").populate("wishList.product").populate("cart.product").populate("videoCallCart.product").populate("orders.product");
        console.log(updatedUser);

        if ( !updatedUser )
            throw new ApiError(500, "Something went wrong!");
    
        return res.status(200).json(new ApiResponse(200, updatedUser, "Cart updated successfully!"))
    
    } catch (error) {
        console.log(error);        
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), {}, "Account updation failed!"));   
    }
});

const updateUserVideoCallCart = asyncHandler( async (req, res) => {
    try {
        const { updatedCart } = req.body;
    
        if ( !updatedCart || !req?.user?._id )
            throw new ApiError(400, "user._id or updatedCart not received!");
    
        const updatedUser = await User.findOneAndUpdate({ _id: req?.user?._id }, { $set : { videoCallCart: updatedCart } }, { new: true }).select("-password -refreshToken").populate("wishList.product").populate("cart.product").populate("orders").populate("videoCallCart.product");
        console.log(updatedUser);

        if ( !updatedUser )
            throw new ApiError(500, "Something went wrong!");
    
        return res.status(200).json(new ApiResponse(200, updatedUser, "Video call cart updated successfully!"))
    
    } catch (error) {
        console.log(error);        
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), {}, "Account updation failed!"));   
    }
});

const updateUserWishList = asyncHandler( async (req, res) => {
    const { updatedWishList } = req.body;

    try {
        
        if ( !updatedWishList || !req?.user?._id )
            throw new ApiError(400, "user._id or updateWishList not received!");

        const updatedUser = await User.findOneAndUpdate({ _id: req?.user?._id }, { $set : { wishList: updatedWishList } }, { new: true }).select("-password -refreshToken").populate("wishList.product").populate("cart.product").populate("orders");
        console.log(updatedUser);
        if ( !updatedUser )
            throw new ApiError(500, "Something went wrong!");
        
        return res.status(200).json(new ApiResponse(200, updatedUser, "Wishlist updated successfully!"))
    } catch (error) {
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), {}, "Wishlist not updated!"));
    }
});

const getAllCustomers = asyncHandler( async ( _, res ) => {
    try {
        const customers = await User.find({ role: "Customer" }).select("-password -refreshToken");
        
        if ( !customers ) throw new ApiError(500, "Coundn't find customers!");
        
        return res.status(200).json(new ApiResponse(200, customers, "Customers fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
}); 

const deleteACustomer = asyncHandler( async (req, res) => {
    try {
        const { id } = req.params;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized request!");

        if ( !id )
            throw new ApiError(400, "No id found!");

        const deleteResponse = await User.deleteOne({ _id: id });

        if ( !deleteResponse )
            throw new ApiError(400, "Customer deletion unsuccessfull!");
        
        console.log(deleteResponse);
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Customer deletion successfull!"));
    } catch (error) {
        console.log(error);        
        return res.json(error);
    }
});

const deleteMultipleCustomers = asyncHandler( async(req, res) => {
    try {
        const { ids } = req.body;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !ids ) 
            throw new ApiError(404, "No ids found!");
    
        if ( !(ids instanceof Array) )
            throw new ApiError(400, "No array provided!");
    
        const deleteResponse = await User.deleteMany({ _id: { $in: ids } });

        console.log(deleteResponse);
        

        if ( !deleteResponse )  
            throw new ApiError(400, "Customers deletion unsuccessfull!");

        res.status(200).json(new ApiResponse(200, deleteResponse, "Customers deleted successfully!"));
    
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

// const getOrders = asyncHandler( async (req, res) => {
//     const { email } = req.body;

//     if ( !email ) 
//         throw new ApiError(400, "Email is required!");

//     const user = await User.findOne({ email: email });

//     if ( !user ) 
//         throw new ApiError(404, "User not found!");

//     const orders = user?.orders;
// });

// const getCartItems = asyncHandler( async (req, res) => {
//     const { email } = req.body;

//     if ( !email ) 
//         throw new ApiError(400, "Email is required!");

//     const user = await User.findOne({ email: email });

//     if ( !user ) 
//         throw new ApiError(404, "User not found!");

//     const orders = user?.orders;
// });

export { getAllCustomers, registerUser, loginUser, logoutUser, refreshAccessToken, updateAccountDetails, getCurrentUser, updateUserCart, updateUserWishList, updateUserVideoCallCart, deleteACustomer, deleteMultipleCustomers };