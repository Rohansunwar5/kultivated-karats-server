import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createASubCategory, deleteASubCategory, getAllSubCategories, updateASubCategory } from "../controllers/subCategories.controller.js";

const router = Router();

router.route("/get-all-sub-categories").get(getAllSubCategories);

/* Secured routed */

router.route("/create-a-sub-category").post(verifyJWT, createASubCategory);
router.route("/update-a-sub-category/:subCategoryId").patch(verifyJWT, updateASubCategory);
router.route("/delete-a-sub-category/:subCategoryId").delete(verifyJWT, deleteASubCategory);

export default router;