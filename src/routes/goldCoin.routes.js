import { Router } from "express";
import { getAllGoldCoins } from "../controllers/goldCoins.controller.js";

const router = Router();

router.route("/get-all-gold-coins").get(getAllGoldCoins);

export default router;
