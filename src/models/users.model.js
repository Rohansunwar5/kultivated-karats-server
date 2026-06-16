import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    img: {
        link: {
            type: String,
            default: ""
        },
        source: {
            type: String,
            default: ""
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true,
        index: true,
        default: "Guest"
    },
    lastName: {
        type: String,
        required: true,
        index: true,
        default: "User"
    },
    phoneNumber: {
        type: Number,
        // unique: true,
        // sparse: true,
        required: false
    },
    phoneNumberVerified: {
        type: Boolean,
        // required: true,
        default: false
    },
    email: {
        type: String,
        required: true,
        index: true,
        lowercase: true,
        trim: true,
        unique: true,
        default: ""
    },
    emailVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    wishList: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            // quantity: Number,
            color: String,
            karat: Number,
        },
    ],
    address: {
        line1: { type: String },
        line2: { type: String },
        company: { type: String },
        city: { type: String },
        postalCode: { type: Number },
        state: { type: String },
    },
    cart: [
        {
            // Real products are stored here as an ObjectId ref and resolved via
            // .populate("cart.product"). Gold coins are NOT DB documents (their
            // ids are "1"/"2"/"5", not ObjectIds), so they must never live in
            // this field — populate would try to $in-cast them and throw. They
            // go in `goldCoin` below instead. A post-init hook on the schema
            // copies goldCoin -> product after load so the frontend can keep
            // reading cartItem.product.* uniformly for both.
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            // Synthetic gold-coin payload (full object, not a DB ref).
            goldCoin: {
                type: Schema.Types.Mixed,
            },
            quantity: Number,
            color: String,
            karat: Number,
            totalPrice: Number,
            containsGemstone: Boolean,
            addChain: Boolean,
            isGemStone: Boolean,
            chainGoldCarat: Number,
            totalPrice: Number,
            ringSize: Number
        },
    ],
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: "Order",
        }
    ],
    totalOrderAmount: {
        type: Number,
        required: true,
        default: 0
    },
    role: {
        type: String,
        enum: [ "Customer", "Admin", "Guest" ],
        required: true,
        default: "Guest"
    },
    password: {
        type: String,
        required: [ true, "Password is required" ],
        default: ""
    },
    comment: {
        type: String,
        max: [140, "Comment cannot be more than 140 characters long!"],
    },
    refreshToken: {
        type: String,
    },
    giftCards : [
        {
            type: Schema.Types.ObjectId,
            ref: "GiftCard",
        }
    ],
    videoCallCart: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: Number,
            color: String,
            karat: Number,
        },
    ],
    videoCalls: [
        {
            name: String,
            phoneNo: Number,
            status: {
                type: String,
                enum: [ "Pending", "Concluded" ],
            },
            email: String,
            videoCallCart: [
                {
                    product: {
                        type: Schema.Types.ObjectId,
                        ref: "Product"
                    },
                    quantity: Number,
                    color: String,
                    karat: Number,
                },
            ], 
            // createdAt: String,
        }
    ],
    creditPoints: {
        type: Number,
        required: true,
        default: 0
    },
    gender: {
        type: String,
        // enum
    },
    birthdate: {
        type: Date
    },
    aniversary: {
        type: Date
    },
    spouseBirthday: {
        type: Date
    },
    // montlySubscriptionPlan: {},
    // videoCalls: {}
    // occasions: {} 
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if ( !this.isModified("password") ) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next(); 
});

userSchema.methods.isPasswordCorrect = async function ( password ) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        phoneNumber: this.phoneNumber
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
};

/* Didn't work */

// userSchema.path("role").validate(function(value) {
//     return ["Admin", "Guest", "Customer"].includes(value);
// }, "Invalid role value");

// When a user is serialized to JSON (i.e. sent to the frontend), expose gold-coin
// cart items under `product` too, so the client keeps reading cartItem.product.*
// uniformly for both products and coins. This runs at serialization time — after
// all schema casting — so surfacing the coin object here never triggers an
// ObjectId cast. (Gold coins are stored in `goldCoin` because they are not
// populatable DB refs; see the cart schema above.)
userSchema.set("toJSON", {
    transform: function (_doc, ret) {
        if ( Array.isArray(ret.cart) ) {
            ret.cart = ret.cart.map((item) => {
                if ( item && item.goldCoin && !item.product )
                    return { ...item, product: item.goldCoin };
                return item;
            });
        }
        return ret;
    }
});

export const User = mongoose.model("User", userSchema);