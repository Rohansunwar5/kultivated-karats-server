import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createACollection, deleteACollection, getAllCollections, updateACollection } from "../controllers/collections.controller.js";


const router = Router();

router.route("/get-all-collections").get(getAllCollections);

/* Secured routed */

router.route("/create-a-collection").post(verifyJWT, createACollection);
router.route("/update-a-collection/:collectionId").patch(verifyJWT, updateACollection);
router.route("/delete-a-collection/:collectionId").delete(verifyJWT, deleteACollection);

export default router;