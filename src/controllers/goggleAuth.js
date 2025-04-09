import { OAuth2Client } from 'google-auth-library';
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
);

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();        
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

export const verifyGoogleToken = async (token) => {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        return ticket.getPayload();
    } catch (error) {
        throw new ApiError(400, "Invalid Google token");
    }
};

export const handleGoogleUser = async (payload) => {
    const { email_verified, family_name, given_name, email, picture } = payload;
    
    if (!email_verified) {
        throw new ApiError(403, "Google email not verified");
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
        // Create new user
        const password = await bcrypt.hash(email + process.env.JWT_SECRET, 10);
        user = await User.create({
            firstName: given_name,
            lastName: family_name,
            email,
            password,
            googleId: payload.sub,
            img: {
                link: picture,
                source: 'google'
            },
            verified: true,
            emailVerified: true,
            role: "Customer"
        });
    } else if (!user.googleId) {
        // User exists but not with Google - update with Google ID
        user.googleId = payload.sub;
        user.img = {
            link: picture,
            source: 'google'
        };
        user.verified = true;
        user.emailVerified = true;
        await user.save();
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")
        .populate("wishList.product")
        .populate("cart.product")
        .populate("videoCallCart.product")
        .populate("orders");

    return { user: loggedInUser, accessToken, refreshToken };
};