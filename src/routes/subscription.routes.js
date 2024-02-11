import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId").post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);
router.route("/c/:channelId").get(getUserChannelSubscribers);

export default router;
