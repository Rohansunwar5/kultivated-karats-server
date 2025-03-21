import { Router } from "express";
import { deleteAnImage, uploadAnImage } from "../controllers/cloudinary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/upload").post(verifyJWT, upload.fields([{ name: "productImages", maxCount: 6 }, { name: "bannerImage", maxCount: 1 }, { name: "bannerElement", maxCount: 1 }, { name: "blogCover", maxCount: 1 }]), uploadAnImage);
router.route("/delete").delete(verifyJWT, deleteAnImage);

export default router;