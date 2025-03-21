import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAStore, deleteAStore, getAllStores } from "../controllers/stores.controller.js";

const router = Router();

router.route("/get-all-stores").get(getAllStores);

/* Secured routes */
router.route("/delete-a-store/:storeId").delete(verifyJWT, deleteAStore);
router.route("/create-a-store").delete(verifyJWT, createAStore);

export default router;