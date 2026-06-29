import { Admin } from "../models/admin.model.js";
import { User } from "../models/users.model.js";
import { Order } from "../models/orders.model.js";
import { Product } from "../models/products.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};

const generateAccessAndRefreshTokens = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();
        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens!");
    }
};

const adminLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            throw new ApiError(400, "Email and password are required!");

        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

        if (!admin)
            throw new ApiError(404, "Admin not found!");

        if (!admin.isActive)
            throw new ApiError(403, "Account is deactivated. Contact super-admin.");

        const isPasswordValid = await admin.isPasswordCorrect(password);

        if (!isPasswordValid)
            throw new ApiError(401, "Invalid password!");

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

        const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, {
                admin: loggedInAdmin, accessToken, refreshToken
            }, "Admin logged in successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const adminLogout = asyncHandler(async (req, res) => {
    try {
        await Admin.findByIdAndUpdate(
            req.admin._id,
            { $set: { refreshToken: undefined } },
            { new: true }
        );

        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json(new ApiResponse(200, {}, "Admin logged out successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.admin, "Admin profile fetched successfully!"));
});

const refreshAdminToken = asyncHandler(async (req, res) => {
    try {
        const receivedRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!receivedRefreshToken)
            throw new ApiError(401, "No refresh token received!");

        const decodedToken = jwt.verify(receivedRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        if (decodedToken?.model !== "Admin")
            throw new ApiError(401, "Invalid token!");

        const admin = await Admin.findById(decodedToken._id);

        if (!admin || !admin.isActive)
            throw new ApiError(401, "Invalid refresh token!");

        if (receivedRefreshToken !== admin.refreshToken)
            throw new ApiError(401, "Refresh token expired or used!");

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, { accessToken, refreshToken }));
    } catch (error) {
        return res.status(401).json({ errMsg: error?.message || "Invalid refresh token" });
    }
});

const updateAdminProfile = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.admin._id,
            { $set: updateData },
            { new: true }
        ).select("-password -refreshToken");

        if (!updatedAdmin)
            throw new ApiError(404, "Admin not found!");

        return res
            .status(200)
            .json(new ApiResponse(200, updatedAdmin, "Profile updated successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const updateAdminPassword = asyncHandler(async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            throw new ApiError(400, "Current password and new password are required!");

        if (newPassword.length < 6)
            throw new ApiError(400, "New password must be at least 6 characters!");

        const admin = await Admin.findById(req.admin._id);

        const isPasswordValid = await admin.isPasswordCorrect(currentPassword);

        if (!isPasswordValid)
            throw new ApiError(401, "Current password is incorrect!");

        admin.password = newPassword;
        await admin.save();

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password updated successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const adminSignup = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, signupSecret } = req.body;

        if (!firstName || !lastName || !email || !password)
            throw new ApiError(400, "firstName, lastName, email, and password are required!");

        if (password.length < 6)
            throw new ApiError(400, "Password must be at least 6 characters!");

        const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });

        if (existingAdmin)
            throw new ApiError(409, "An admin with this email already exists!");

        const adminCount = await Admin.countDocuments();

        // First admin gets super-admin; subsequent signups require a secret key
        if (adminCount > 0) {
            const expectedSecret = process.env.ADMIN_SIGNUP_SECRET;
            if (!expectedSecret)
                throw new ApiError(403, "Admin signup is currently disabled.");
            if (!signupSecret || signupSecret !== expectedSecret)
                throw new ApiError(403, "Invalid signup secret key.");
        }

        const admin = await Admin.create({
            firstName,
            lastName,
            email: email.toLowerCase().trim(),
            password,
            phoneNumber,
            role: adminCount === 0 ? "super-admin" : "admin",
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

        const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(201, {
                admin: createdAdmin, accessToken, refreshToken
            }, "Admin registered successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const createAdmin = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, role } = req.body;

        if (!firstName || !lastName || !email || !password)
            throw new ApiError(400, "firstName, lastName, email, and password are required!");

        const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });

        if (existingAdmin)
            throw new ApiError(409, "An admin with this email already exists!");

        const admin = await Admin.create({
            firstName,
            lastName,
            email: email.toLowerCase().trim(),
            password,
            phoneNumber,
            role: role || "admin",
        });

        const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

        if (!createdAdmin)
            throw new ApiError(500, "Something went wrong while creating admin!");

        return res
            .status(201)
            .json(new ApiResponse(201, createdAdmin, "Admin created successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getAllAdmins = asyncHandler(async (req, res) => {
    try {
        const admins = await Admin.find().select("-password -refreshToken").sort({ createdAt: -1 });

        return res
            .status(200)
            .json(new ApiResponse(200, admins, "Admins fetched successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getAnAdmin = asyncHandler(async (req, res) => {
    try {
        const { adminId } = req.params;

        const admin = await Admin.findById(adminId).select("-password -refreshToken");

        if (!admin)
            throw new ApiError(404, "Admin not found!");

        return res
            .status(200)
            .json(new ApiResponse(200, admin, "Admin fetched successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const updateAdmin = asyncHandler(async (req, res) => {
    try {
        const { adminId } = req.params;
        const { firstName, lastName, phoneNumber, role, isActive, permissions } = req.body;

        if (req.admin._id.toString() === adminId && role === "admin" && req.admin.role === "super-admin")
            throw new ApiError(400, "You cannot demote yourself!");

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (role) updateData.role = role;
        if (typeof isActive === "boolean") updateData.isActive = isActive;
        if (permissions) updateData.permissions = permissions;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: updateData },
            { new: true }
        ).select("-password -refreshToken");

        if (!updatedAdmin)
            throw new ApiError(404, "Admin not found!");

        return res
            .status(200)
            .json(new ApiResponse(200, updatedAdmin, "Admin updated successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const deleteAdmin = asyncHandler(async (req, res) => {
    try {
        const { adminId } = req.params;

        if (req.admin._id.toString() === adminId)
            throw new ApiError(400, "You cannot delete yourself!");

        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: { isActive: false } },
            { new: true }
        ).select("-password -refreshToken");

        if (!admin)
            throw new ApiError(404, "Admin not found!");

        return res
            .status(200)
            .json(new ApiResponse(200, admin, "Admin deactivated successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        const [totalRevenueResult, totalOrders, totalCustomers, totalProducts, ordersByStatus] =
            await Promise.all([
                Order.aggregate([
                    { $match: { orderStatus: { $ne: "Pending" } } },
                    { $group: { _id: null, total: { $sum: "$total" } } },
                ]),
                Order.countDocuments(),
                User.countDocuments({ role: "Customer" }),
                Product.countDocuments(),
                Order.aggregate([
                    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
                ]),
            ]);

        const totalRevenue = totalRevenueResult[0]?.total || 0;
        const statusCounts = ordersByStatus.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        return res.status(200).json(new ApiResponse(200, {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            orderStatusCounts: statusCounts,
        }, "Dashboard stats fetched successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getRevenueOverview = asyncHandler(async (req, res) => {
    try {
        const { period } = req.query;
        const groupBy = period === "weekly" ? { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } }
            : period === "daily" ? { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }
            : { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };

        const revenue = await Order.aggregate([
            { $match: { orderStatus: { $ne: "Pending" } } },
            { $group: { _id: groupBy, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 },
        ]);

        return res.status(200).json(new ApiResponse(200, revenue, "Revenue overview fetched successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getRecentOrders = asyncHandler(async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .populate("customerId", "firstName lastName email phoneNumber")
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json(new ApiResponse(200, recentOrders, "Recent orders fetched successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getTopProducts = asyncHandler(async (req, res) => {
    try {
        const topProducts = await Product.find()
            .sort({ quantitySold: -1 })
            .limit(10)
            .populate("category", "name");

        return res.status(200).json(new ApiResponse(200, topProducts, "Top products fetched successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const getLowStockProducts = asyncHandler(async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 5;

        const lowStockProducts = await Product.find({ stock: { $lte: threshold } })
            .populate("category", "name")
            .sort({ stock: 1 });

        return res.status(200).json(new ApiResponse(200, lowStockProducts, "Low stock products fetched successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

export {
    adminLogin,
    adminLogout,
    adminSignup,
    getCurrentAdmin,
    refreshAdminToken,
    updateAdminProfile,
    updateAdminPassword,
    createAdmin,
    getAllAdmins,
    getAnAdmin,
    updateAdmin,
    deleteAdmin,
    getDashboardStats,
    getRevenueOverview,
    getRecentOrders,
    getTopProducts,
    getLowStockProducts,
};
