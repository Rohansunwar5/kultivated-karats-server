import { createAnOrder, deleteAnOrder, getAllOrders, updateAnOrder, deleteMultipleOrders } from "../controllers/orders.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { Router } from "express";

const router = Router();

/* Secured routed */

router.route("/get-all-orders").get(verifyAdminJWT, getAllOrders);
// router.route("/get-orders/:custormerId").get(verifyJWT, getAnOrder);
router.route("/create-an-order").post(verifyAdminJWT, createAnOrder);
router.route("/update-an-order/:orderId").patch(verifyAdminJWT, updateAnOrder);
router.route("/delete-an-order/:orderId").delete(verifyAdminJWT, deleteAnOrder);
router.route("/delete-multiple-orders").delete(verifyAdminJWT, deleteMultipleOrders);

export default router;