import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createABanner, getAllBanners, getABannerById, getAllBannersOfAType, updateABanner, deleteABanner } from "../controllers/banners.controller.js";

/* Todo: handle images */

const router = Router();

/* Public routes */

router.route("/get-all-banners").get(getAllBanners);
router.route("/get-all-banners-from-a-type/:bannerType").get(getAllBannersOfAType);
router.route("/get-a-banner-by-id/:bannerId").get(getABannerById);

/* Secured routes */

router.route("/create-a-banner").post(verifyJWT, createABanner);
router.route("/update-a-banner/:bannerId").patch(verifyJWT, updateABanner);
router.route("/delete-a-banner/:bannerId").delete(verifyJWT, deleteABanner);

export default router;