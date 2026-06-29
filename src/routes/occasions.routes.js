import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { createAnOccasion, deleteAnOccasion, getAllOccasions, updateAnOccasion } from "../controllers/occasion.controller.js";

const router = Router();

router.route("/get-all-occasion").get(getAllOccasions);

/* Secured routed */

router.route("/create-a-occasion").post(verifyAdminJWT, createAnOccasion);
router.route("/update-a-occasion/:occasionId").patch(verifyAdminJWT, updateAnOccasion);
router.route("/delete-a-occasion/:occasionId").delete(verifyAdminJWT, deleteAnOccasion);

export default router;