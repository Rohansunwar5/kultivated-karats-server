import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { createACoupon, createAnniversaruMakingWaiverCoupon, deleteACoupon, deleteMultipleCoupon, getAllCoupons, updateACoupon, verifyCoupon } from "../controllers/coupons.controller.js";

/* Todo: Testing and integration */

const router = Router();

router.route("/verify-coupon").post(verifyAdminJWT, verifyCoupon);

/* Secured routed */

router.route("/get-all-coupons").get(verifyAdminJWT, getAllCoupons);
router.route("/create-a-coupon").post(verifyAdminJWT, createACoupon);
router.route("/update-a-coupon/:couponId").patch(verifyAdminJWT, updateACoupon);
router.route("/delete-a-coupon/:couponId").delete(verifyAdminJWT, deleteACoupon);
router.route("/delete-multiple-coupons").delete(verifyAdminJWT, deleteMultipleCoupon);
router.route("/create-anniversary-coupon").post(verifyAdminJWT, createAnniversaruMakingWaiverCoupon)

export default router;
