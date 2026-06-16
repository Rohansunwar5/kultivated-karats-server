import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addGemstoneField, addNineKaratToAllProducts, createAProduct, deleteAProduct, deleteMultipleProducts, getAProduct, getAllProducts, getAllProductsInACategory, getProducts, mapImagesToProducts, mapProductsToCategories, searchProducts, setBasePrice, updateAProduct, updatePendantField, uploadProductsFromExcel } from "../controllers/product.controller.js";
import { uploadXLSX } from "../middlewares/multer.middleware.js";

const router = Router();

/* Todo: integrante product creation with category updation */

/* Public routes */

router.route("/search").get(searchProducts);
router.route("/get-all-products").get(getAllProducts);
router.route("/get-product/:id").get(getAProduct);
router.route("/get-products/:category").get(getAllProductsInACategory);
router.route("/upload-products-from-excel").post(uploadXLSX.single('file'), uploadProductsFromExcel);
router.route("/fix-gemstones").patch(addGemstoneField);
router.route("/add-nine-karat").patch(addNineKaratToAllProducts);
router.route("/set-base-price").patch(setBasePrice);
router.route("/update-pendants").patch(updatePendantField);

/* Secured routes */

router.route("/get-products").post(getProducts);
router.route("/add-product").post(verifyJWT, createAProduct);
router.route("/edit-product/:id").patch(verifyJWT, updateAProduct);
router.route("/delete-a-product/:id").delete(verifyJWT, deleteAProduct);
router.route("/delete-multiple-products").delete(verifyJWT, deleteMultipleProducts);
router.route("/map-images-to-products").patch(verifyJWT, mapImagesToProducts);
router.route("/map-products-to-categories").patch(verifyJWT, mapProductsToCategories);

export default router;