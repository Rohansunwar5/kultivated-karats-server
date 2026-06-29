import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";
import { createATestimonial, deleteATestimonial, getAllTestimonials } from "../controllers/testimonials.controller.js";

const router = Router();

router.route("/get-all-testimonial").get(getAllTestimonials);

/* Secured routes */
router.route("/delete-a-testimonial/:testimonialId").delete(verifyAdminJWT, deleteATestimonial);
router.route("/create-a-testimonial").post(verifyAdminJWT, createATestimonial);

export default router;