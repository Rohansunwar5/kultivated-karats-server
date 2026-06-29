import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"
import categoryRouter from "./routes/category.routes.js"
import productRouter from "./routes/product.routes.js"
import orderRouter from "./routes/order.routes.js"
import collectionRouter from "./routes/collection.routes.js"
import bannerRouter from "./routes/banner.routes.js"
import blogRouter from "./routes/blog.routes.js"
import cloudinaryRouter from "./routes/cloudinary.routes.js"
import couponRouter from "./routes/coupon.routes.js"
import giftCardsRouter from "./routes/giftCards.routes.js"
import occasionsRouter from "./routes/occasions.routes.js"
import reelsRouter from "./routes/reel.routes.js"
import storesRouter from "./routes/stores.routes.js"
import subCategoryRouter from "./routes/subCategories.routes.js"
import testimonialRouter from "./routes/testimonials.routes.js"
import voucherRouter from "./routes/vouchers.routes.js"
import paymentRouter from "./routes/payment.routes.js";
import emailRouter from "./routes/email.routes.js";
import otpRouter from "./routes/otp.routes.js";
import adminRouter from "./routes/admin.routes.js";
import goldCoinRouter from "./routes/goldCoin.routes.js";

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || process.env.CORS_ORIGIN.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
    },
    methods: [ "GET", "POST", "PUT", "PATCH", "DELETE" ],
    credentials: true,
}));

app.use(express.json({ limit: "50mb" }));

// app.use(errorHandler);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

/* Routes */

app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/collections", collectionRouter);
app.use("/api/v1/banners", bannerRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/cloudinary", cloudinaryRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/giftcards", giftCardsRouter);
app.use("/api/v1/occasions", occasionsRouter);
app.use("/api/v1/reels", reelsRouter);
app.use("/api/v1/stores", storesRouter);
app.use("/api/v1/sub-categories", subCategoryRouter);
app.use("/api/v1/testimonials", testimonialRouter);
app.use("/api/v1/vouchers", voucherRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/email", emailRouter);
app.use("/api/v1/otp", otpRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/gold-coins", goldCoinRouter);

export { app };