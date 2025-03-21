import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAnOccasion, deleteAnOccasion, getAllOccasions, updateAnOccasion } from "../controllers/occasion.controller.js";

const router = Router();

router.route("/get-all-occasion").get(getAllOccasions);

/* Secured routed */

router.route("/create-a-occasion").post(verifyJWT, createAnOccasion);
router.route("/update-a-occasion/:occasionId").patch(verifyJWT, updateAnOccasion);
router.route("/delete-a-occasion/:occasionId").delete(verifyJWT, deleteAnOccasion);

export default router;