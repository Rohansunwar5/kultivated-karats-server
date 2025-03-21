import { createAnOrder, deleteAnOrder, getAllOrders, updateAnOrder, deleteMultipleOrders } from "../controllers/orders.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

/* Secured routed */

router.route("/get-all-orders").get(getAllOrders);
// router.route("/get-orders/:custormerId").get(verifyJWT, getAnOrder);
router.route("/create-an-order").post(createAnOrder);
router.route("/update-an-order/:orderId").patch(verifyJWT, updateAnOrder);
router.route("/delete-an-order/:orderId").delete(verifyJWT, deleteAnOrder);
router.route("/delete-multiple-orders").delete(verifyJWT, deleteMultipleOrders);

export default router;