import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createABlog, deleteABlog, editABlog, getABlog, getAllBlogs } from "../controllers/blogs.controller.js";

const router = Router();

/* Public routes */

router.route("/get-all-blogs").get(getAllBlogs);
router.route("/get-a-blog/:blogId").get(getABlog);

/* Secured routes */

router.route("/create-a-blog").post(verifyJWT, createABlog);
router.route("/update-a-blog/:blogId").patch(verifyJWT, editABlog);
router.route("/delete-a-blog/:blogId").delete(verifyJWT, deleteABlog);

export default router;