import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { createAReel, deleteAReel, getAllReels } from "../controllers/reels.controller.js";

const router = Router();

router.route("/get-all-reels").get(getAllReels);

/* Secured routes */
router.route("/delete-a-reel/:reelId").delete(verifyAdminJWT, deleteAReel);
router.route("/create-a-reel").post(verifyAdminJWT, createAReel);

export default router;