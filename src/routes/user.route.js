import { Router } from "express";
import {
  deleteUserAccount,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateAccountDetails,
  changeCurrentPassword,
  updateUserAvatar,
  refreshAccessToken,
} from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router();

// unauthorized routes
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
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/delete-account").delete(verifyJwt, deleteUserAccount);
router.route("/update-account").patch(verifyJwt, updateAccountDetails);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);

export default router;
