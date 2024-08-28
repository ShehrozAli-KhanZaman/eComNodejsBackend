import { Router } from "express";
import {
  deleteUserAccount,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateAccountDetails,
  changeCurrentPassword,
} from "../../controllers/userControllers/user.controllers.js";
import upload from "../../middlewares/multer.middleware.js";
import verifyJwt from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

// Authentication routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/current-user").post(verifyJwt, getCurrentUser);
router.route("/delete-account").post(verifyJwt, deleteUserAccount);
router.route("/update-account").post(verifyJwt, updateAccountDetails);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);

export default router;
