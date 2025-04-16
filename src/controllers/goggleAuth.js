import { OAuth2Client } from 'google-auth-library';
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

export const handleGoogleUser = async (payload) => {
    const { email_verified, email, sub, given_name, family_name, picture } = payload;
   
    if (!email_verified) {
        throw new ApiError(403, "Google email not verified");
    }
    let user = await User.findOne({
        $or: [
            { googleId: sub },
            { email }
        ]
    });

    if (!user) {
        user = await User.create({
            firstName: given_name || 'Google',
            lastName: family_name || 'User',
            email,
            password: await bcrypt.hash(sub + process.env.JWT_SECRET, 10),
            googleId: sub,
            provider: 'google',
            img: {
                link: picture,
                source: 'google'
            },
            verified: true,
            emailVerified: true,
            role: "Customer"
        });
    } else if (!user.googleId) {
        user.googleId = sub;
        user.provider = 'google';
        user.img = {
            link: picture,
            source: 'google'
        };
        user.verified = true;
        user.emailVerified = true;
        await user.save();
    }

    const tokens = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")
        .populate([
            "wishList.product",
            "cart.product",
            "videoCallCart.product",
            "orders"
        ]);

    return { user: loggedInUser, ...tokens };
};

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const payload = await verifyGoogleToken(token);
        const { user, accessToken, refreshToken } = await handleGoogleUser(payload);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };

        res.cookie('refreshToken', refreshToken, options);

        return res.status(200).json({
            success: true,
            data: {
                user,
                accessToken
            }
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Google login failed'
        });
    }
};  

