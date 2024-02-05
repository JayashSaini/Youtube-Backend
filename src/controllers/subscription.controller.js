// import mongoose, { isValidObjectId } from "mongoose";
// import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!channelId) {
    throw new ApiError(400, "channelId is missing");
  }

  const subscribed = await Subscription.findOne({
    subscriber: {
      $in: [channelId],
    },
  });

  if (!subscribed) {
    const updatedsubscribe = await Subscription.findByIdAndUpdate(
      subscribed._id,
      {
        $push: {
          subscriber: channelId,
        },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, updatedsubscribe, "subscribe successfully"));
  }

  const deletedsubscription = await Subscription.findByIdAndDelete(
    subscribed._id
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedsubscription, "Unsubscribe successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel Id is missing");
  }
  try {
    const subscribers = await Subscription.find({
      subscriber: {
        $in: [channelId],
      },
    });

    if (!subscribers) {
      throw new ApiError(400, "While accessing the subscribers");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
      );
  } catch (error) {
    throw new ApiError(400, error.message || "While accessing the subscribers");
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "Channel Id is missing");
  }
  try {
    const subscribed = await Subscription.find({
      channel: {
        $in: [subscriberId],
      },
    });

    if (!subscribed) {
      throw new ApiError(400, "While accessing the subscribed channel");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribed,
          "Subscribed channel fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "While accessing the subscribed Channel"
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
