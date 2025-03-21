import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createATestimonial, deleteATestimonial, getAllTestimonials } from "../controllers/testimonials.controller.js";

const router = Router();

router.route("/get-all-testimonial").get(getAllTestimonials);

/* Secured routes */
router.route("/delete-a-reel/:testimonial").delete(verifyJWT, deleteATestimonial);
router.route("/create-a-testimonial").delete(verifyJWT, createATestimonial);

export default router;