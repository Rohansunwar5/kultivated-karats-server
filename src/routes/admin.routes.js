import { Router } from "express";
import { verifyAdminJWT, verifySuperAdmin, hasPermission } from "../middlewares/admin.middleware.js";
import {
    adminLogin,
    adminLogout,
    adminSignup,
    getCurrentAdmin,
    refreshAdminToken,
    updateAdminProfile,
    updateAdminPassword,
    createAdmin,
    getAllAdmins,
    getAnAdmin,
    updateAdmin,
    deleteAdmin,
    getDashboardStats,
    getRevenueOverview,
    getRecentOrders,
    getTopProducts,
    getLowStockProducts,
} from "../controllers/admin.controller.js";
import {
    getGoldRate,
    updateGoldRate,
    recalculateAllPrices,
} from "../controllers/goldRate.controller.js";

const router = Router();

/* Public routes */
router.route("/signup").post(adminSignup);
router.route("/login").post(adminLogin);
router.route("/generate-tokens").post(refreshAdminToken);

/* Secured routes */
router.route("/logout").post(verifyAdminJWT, adminLogout);
router.route("/profile").get(verifyAdminJWT, getCurrentAdmin);
router.route("/update-profile").patch(verifyAdminJWT, updateAdminProfile);
router.route("/update-password").patch(verifyAdminJWT, updateAdminPassword);

/* Super-admin only routes */
router.route("/create").post(verifyAdminJWT, verifySuperAdmin, createAdmin);
router.route("/get-all").get(verifyAdminJWT, verifySuperAdmin, getAllAdmins);
router.route("/get/:adminId").get(verifyAdminJWT, verifySuperAdmin, getAnAdmin);
router.route("/update/:adminId").patch(verifyAdminJWT, verifySuperAdmin, updateAdmin);
router.route("/delete/:adminId").delete(verifyAdminJWT, verifySuperAdmin, deleteAdmin);

/* Gold rate routes */
router.route("/gold-rate").get(verifyAdminJWT, getGoldRate);
router.route("/gold-rate").patch(verifyAdminJWT, hasPermission("products"), updateGoldRate);
router.route("/recalculate-prices").post(verifyAdminJWT, hasPermission("products"), recalculateAllPrices);

/* Dashboard routes */
router.route("/dashboard/stats").get(verifyAdminJWT, hasPermission("dashboard"), getDashboardStats);
router.route("/dashboard/revenue-overview").get(verifyAdminJWT, hasPermission("dashboard"), getRevenueOverview);
router.route("/dashboard/recent-orders").get(verifyAdminJWT, hasPermission("dashboard"), getRecentOrders);
router.route("/dashboard/top-products").get(verifyAdminJWT, hasPermission("dashboard"), getTopProducts);
router.route("/dashboard/low-stock-products").get(verifyAdminJWT, hasPermission("dashboard"), getLowStockProducts);

export default router;
