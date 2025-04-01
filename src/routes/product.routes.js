import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAProduct, deleteAProduct, deleteMultipleProducts, getAProduct, getAllProducts, getAllProductsInACategory, mapImagesToProducts, setBasePrice, updateAProduct, uploadProductsFromExcel } from "../controllers/product.controller.js";
import { uploadXLSX } from "../middlewares/multer.middleware.js";

const router = Router();

/* Todo: integrante product creation with category updation */

/* Public routes */

router.route("/get-all-products").get(getAllProducts);
router.route("/get-product/:id").get(getAProduct);
router.route("/get-products/:category").get(getAllProductsInACategory);
router.route("/upload-products-from-excel").post(uploadXLSX.single('file'), uploadProductsFromExcel);

/* Secured routes */

router.route("/add-product").post(createAProduct);
router.route("/edit-product/:id").patch(verifyJWT, updateAProduct);
router.route("/delete-a-product/:id").delete(verifyJWT, deleteAProduct);
router.route("/delete-multiple-products").delete(verifyJWT, deleteMultipleProducts);
router.route("/map-images-to-products").patch(mapImagesToProducts);
router.route("/set-base-price").patch(setBasePrice);

export default router;