import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAGiftCard, deleteAGiftCard, deleteMultipleGiftCard, getAllGiftCards, updateAGiftCard, verifyGiftCard } from "../controllers/giftCards.controller.js";

/* Todo: Testing and integration */

const router = Router();

router.route("/verify-giftCard").get(verifyGiftCard);

/* Secured routed */

router.route("/get-all-gift-card").get(verifyJWT, getAllGiftCards);
router.route("/create-a-gift-card").post(verifyJWT, createAGiftCard);
router.route("/update-a-gift-card/:giftCardId").patch(verifyJWT, updateAGiftCard);
router.route("/delete-a-gift-card/:giftCardId").delete(verifyJWT, deleteAGiftCard);
router.route("/delete-multiple-gift-cards").delete(verifyJWT, deleteMultipleGiftCard);

export default router;