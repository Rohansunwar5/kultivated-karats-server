import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAnOrder, validatePayment } from "../controllers/payment.controller.js";

/* Todo: Testing and integration */

const router = Router();

/* Secured routed */

router.route("/create-an-order").post(verifyJWT, createAnOrder);
// router.route("/create-an-order").post(verifyJWT, createAnOrder);
router.route("/order/validate").post(verifyJWT, validatePayment);

export default router;