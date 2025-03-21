import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createACategory, deleteACategory, getAllCategories, updateACategory } from "../controllers/category.controller.js";

const router = Router();

router.route("/get-all-categories").get(getAllCategories);

/* Secured routed */

router.route("/create-a-category").post(verifyJWT, createACategory);
router.route("/update-a-category/:categoryId").patch(verifyJWT, updateACategory);
router.route("/delete-a-category/:categoryId").delete(verifyJWT, deleteACategory);

export default router;