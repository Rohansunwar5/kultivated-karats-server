import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAVoucher, getAVoucher, getAllVouchers, editAVoucher, deleteAVoucher, validateVoucher } from "../controllers/voucher.controller.js";

/* Todo: Testing and integration */

const router = Router();

router.route("/validate-voucher").get(validateVoucher);

/* Secured routed */

router.route("/get-all-vouchers").get(verifyJWT, getAllVouchers);
router.route("/create-a-voucher").post(verifyJWT, createAVoucher);
router.route("/update-a-voucher/:voucherId").patch(verifyJWT, editAVoucher);
router.route("/delete-a-voucher/:voucherId").delete(verifyJWT, deleteAVoucher);
// router.route("/delete-multiple-voucher").delete(verifyJWT, deleteMultipleCoupon);

export default router;