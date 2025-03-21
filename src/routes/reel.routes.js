import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAReel, deleteAReel, getAllReels } from "../controllers/reels.controller.js";

const router = Router();

router.route("/get-all-reels").get(getAllReels);

/* Secured routes */
router.route("/delete-a-reel/:reelId").delete(verifyJWT, deleteAReel);
router.route("/create-a-reel").delete(verifyJWT, createAReel);

export default router;