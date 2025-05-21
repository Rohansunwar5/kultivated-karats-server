import { Router } from "express";
import { getAllCustomers, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserCart, updateUserWishList, deleteACustomer, deleteMultipleCustomers, updateUserVideoCallCart, googleLogin, googleSSO, sendOtp, updateUserPhone } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOtp } from "../middlewares/otp.middleware.js";

const router = Router();

router.route("/register").post(verifyOtp, registerUser);
router.route("/login").post(verifyOtp, loginUser);
router.route("/send-otp").post(sendOtp);
router.route('/google/login').post(googleLogin);
router.route('/google/sso').post(googleSSO);
router.route("/get-all-customers").get(getAllCustomers);

/* Secured routes */
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/generate-tokens").post(refreshAccessToken);
router.route("/update-user-phone").patch(verifyJWT, updateUserPhone);
router.route("/update-user-cart").patch(verifyJWT, updateUserCart);
router.route("/update-user-video-call-cart").patch(verifyJWT, updateUserVideoCallCart);
router.route("/update-user-details").patch(verifyJWT, updateAccountDetails);
router.route("/update-user-wishlist").patch(verifyJWT, updateUserWishList);
router.route("/delete-a-customer/:id").delete(verifyJWT, deleteACustomer);
router.route("/delete-multiple-customers").delete(verifyJWT, deleteMultipleCustomers);


export default router;