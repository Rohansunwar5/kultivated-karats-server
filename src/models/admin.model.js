import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    phoneNumber: {
        type: Number,
    },
    role: {
        type: String,
        enum: ["super-admin", "admin"],
        default: "admin",
    },
    permissions: {
        products: { type: Boolean, default: true },
        categories: { type: Boolean, default: true },
        orders: { type: Boolean, default: true },
        customers: { type: Boolean, default: true },
        coupons: { type: Boolean, default: true },
        vouchers: { type: Boolean, default: true },
        giftCards: { type: Boolean, default: true },
        banners: { type: Boolean, default: true },
        blogs: { type: Boolean, default: true },
        reels: { type: Boolean, default: true },
        stores: { type: Boolean, default: true },
        testimonials: { type: Boolean, default: true },
        occasions: { type: Boolean, default: true },
        collections: { type: Boolean, default: true },
        admins: { type: Boolean, default: false },
        dashboard: { type: Boolean, default: true },
    },
    refreshToken: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            model: "Admin",
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
};

adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id, model: "Admin" },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

adminSchema.set("toJSON", {
    transform: function (_doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    },
});

export const Admin = mongoose.model("Admin", adminSchema);
