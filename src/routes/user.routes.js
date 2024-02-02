import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAcessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAcessToken);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/update-account").patch(verifyJwt, updateAccountDetails);

router.route("/update-avatar").patch(
  verifyJwt,
  upload.single("avatar"), // multer
  updateUserAvatar
);

router.route("/update-coverImage").patch(
  verifyJwt,
  upload.single("coverImage"), // multer
  updateUserCoverImage
);

router.route("/channel/:username").get(verifyJwt, getUserChannelProfile);
router.route("/history").get(verifyJwt, getWatchHistory);

export default router;
