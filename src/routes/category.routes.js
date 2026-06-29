import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { createACategory, deleteACategory, getAllCategories, mapProductsToCategories, updateACategory } from "../controllers/category.controller.js";

const router = Router();

router.route("/get-all-categories").get(getAllCategories);
router.route("/map-products-to-categories").patch(mapProductsToCategories);

/* Secured routed */

router.route("/create-a-category").post(verifyAdminJWT, createACategory);
router.route("/update-a-category/:categoryId").patch(verifyAdminJWT, updateACategory);
router.route("/delete-a-category/:categoryId").delete(verifyAdminJWT, deleteACategory);

export default router;