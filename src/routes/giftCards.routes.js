import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { createAGiftCard, deleteAGiftCard, deleteMultipleGiftCard, getAllGiftCards, updateAGiftCard, verifyGiftCard } from "../controllers/giftCards.controller.js";

/* Todo: Testing and integration */

const router = Router();

router.route("/verify-giftCard").get(verifyAdminJWT, verifyGiftCard);

/* Secured routed */

router.route("/get-all-gift-card").get(verifyAdminJWT, getAllGiftCards);
router.route("/create-a-gift-card").post(verifyAdminJWT, createAGiftCard);
router.route("/update-a-gift-card/:giftCardId").patch(verifyAdminJWT, updateAGiftCard);
router.route("/delete-a-gift-card/:giftCardId").delete(verifyAdminJWT, deleteAGiftCard);
router.route("/delete-multiple-gift-cards").delete(verifyAdminJWT, deleteMultipleGiftCard);

export default router;