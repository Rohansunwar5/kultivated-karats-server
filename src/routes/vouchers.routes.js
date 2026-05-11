import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createAVoucher, 
    getAllVouchers, 
    editAVoucher, 
    deleteAVoucher, 
    validateVoucher,
    validateAndApplyVoucher,
    createBulkVouchers 
} from "../controllers/voucher.controller.js";

const router = Router();

/* Public routes - No authentication required */
router.route("/validate-voucher").get(validateVoucher); // Simple validation
router.route("/apply-voucher").post(validateAndApplyVoucher); // Apply with cart calculation

/* Secured routes - Requires authentication */
router.route("/get-all-vouchers").get(verifyJWT, getAllVouchers);
router.route("/create-a-voucher").post(createAVoucher); // Fixed: Added verifyJWT
router.route("/create-bulk-vouchers").post(verifyJWT, createBulkVouchers);
router.route("/update-a-voucher/:voucherId").patch(verifyJWT, editAVoucher);
router.route("/delete-a-voucher/:voucherId").delete(verifyJWT, deleteAVoucher);

export default router;
