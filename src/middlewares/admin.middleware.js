import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyAdminJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token)
            throw new ApiError(401, "Unauthorized request!");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (decodedToken?.model !== "Admin")
            throw new ApiError(401, "Invalid token for admin access!");

        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken");

        if (!admin || !admin.isActive)
            throw new ApiError(401, "Invalid Access Token!");

        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token!");
    }
});

export const verifySuperAdmin = asyncHandler(async (req, _, next) => {
    if (req.admin?.role !== "super-admin")
        throw new ApiError(403, "Super-admin access required!");
    next();
});

export const hasPermission = (permission) => {
    return asyncHandler(async (req, _, next) => {
        if (!req.admin?.permissions?.[permission])
            throw new ApiError(403, `You do not have permission to access ${permission}`);
        next();
    });
};
