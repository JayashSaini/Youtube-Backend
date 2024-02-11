// import mongoose, { isValidObjectId } from "mongoose";
// import { User } from "../models/user.model.js";
import mongoose from "mongoose";
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
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!subscribed) {
    try {
      const subscribe = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });
      return res
        .status(200)
        .json(new ApiResponse(200, subscribe, "subscribe successfully"));
    } catch (error) {
      throw new ApiError(
        500,
        "Something went worng While subscribing the channel"
      );
    }
  }

  try {
    const deletedsubscription = await Subscription.findByIdAndDelete(
      subscribed._id
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedsubscription, "Unsubscribe successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went worng While Unsubscribing the channel"
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel Id is missing");
  }
  try {
    const subscriberCount = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $group: {
          _id: null,
          subscriberCount: {
            $sum: 1,
          },
        },
      },
      {
        $addFields: {
          subscriberCount: "$subscriberCount",
        },
      },
      {
        $project: {
          _id: 0,
          subscriberCount: 1,
        },
      },
    ]);

    if (!subscriberCount) {
      throw new ApiError(400, "While accessing the subscribers");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscriberCount,
          "Subscribers fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message || "While accessing the subscribers");
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  console.log("id is ", subscriberId);
  if (!subscriberId) {
    throw new ApiError(400, "Subscriber Id is missing");
  }
  try {
    const subscribedChannel = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
                _id: 1,
                fullName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          channel: {
            $first: "$channel",
          },
        },
      },
    ]);

    if (!subscribedChannel) {
      throw new ApiError(400, "While accessing the subscribed channel");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedChannel,
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
