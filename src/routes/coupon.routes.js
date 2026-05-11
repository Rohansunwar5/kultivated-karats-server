import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createACoupon, createAnniversaruMakingWaiverCoupon, deleteACoupon, deleteMultipleCoupon, getAllCoupons, updateACoupon, verifyCoupon } from "../controllers/coupons.controller.js";

/* Todo: Testing and integration */

const router = Router();

router.route("/verify-coupon").post(verifyJWT, verifyCoupon);

/* Secured routed */

router.route("/get-all-coupons").get(verifyJWT, getAllCoupons);
router.route("/create-a-coupon").post(createACoupon);
router.route("/update-a-coupon/:couponId").patch(verifyJWT, updateACoupon);
router.route("/delete-a-coupon/:couponId").delete(verifyJWT, deleteACoupon);
router.route("/delete-multiple-coupons").delete(verifyJWT, deleteMultipleCoupon);
router.route("/create-anniversary-coupon").post(createAnniversaruMakingWaiverCoupon)

export default router;
