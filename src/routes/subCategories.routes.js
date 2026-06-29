import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { createASubCategory, deleteASubCategory, getAllSubCategories, updateASubCategory } from "../controllers/subCategories.controller.js";

const router = Router();

router.route("/get-all-sub-categories").get(getAllSubCategories);

/* Secured routed */

router.route("/create-a-sub-category").post(verifyAdminJWT, createASubCategory);
router.route("/update-a-sub-category/:subCategoryId").patch(verifyAdminJWT, updateASubCategory);
router.route("/delete-a-sub-category/:subCategoryId").delete(verifyAdminJWT, deleteASubCategory);

export default router;