import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // Get total video views
  const totalViewsAggregatePipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalViews: 1,
      },
    },
  ];
  const totalViews = await Video.aggregate(totalViewsAggregatePipeline);

  if (!totalViews) {
    throw new ApiError(400, "Something went wrong While accessing total views");
  }
  // Total Subscriber

  const totalSubscriberAggregatePipeline = [
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        subscribers: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 1,
      },
    },
  ];
  const totalSubscriber = await Subscription.aggregate(
    totalSubscriberAggregatePipeline
  );

  if (!totalSubscriber) {
    throw new ApiError(
      400,
      "Something went wrong While accessing total Subscriber"
    );
  }
  // Total Videos

  const totalVideoAggregatePipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0, // Excluding _id field from the output
        totalVideos: 1, // Including totalVideos field in the output
      },
    },
  ];

  const totalVideo = await Video.aggregate(totalVideoAggregatePipeline);

  if (!totalVideo) {
    throw new ApiError(
      400,
      "Something went wrong While accessing total Video count"
    );
  }
  // Get total likes

  const totalLikeAggregatePipeline = [
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
        totalTweetLikes: {
          $sum: {
            $cond: {
              if: {
                $eq: [{ $type: "$tweet" }, "missing"],
              }, //
              then: 0,
              else: 1,
            },
          },
        },
        totalCommentLikes: {
          $sum: {
            $cond: {
              if: {
                $eq: [{ $type: "$comment" }, "missing"],
              },
              then: 0,
              else: 1,
            },
          },
        },
        totalVideoLikes: {
          $sum: {
            $cond: {
              if: {
                $eq: [{ $type: "$video" }, "missing"],
              },
              then: 0,
              else: 1,
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalLikes: 1,
        totalTweetLikes: 1,
        totalVideoLikes: 1,
        totalCommentLikes: 1,
      },
    },
  ];

  const totalLikes = await Like.aggregate(totalLikeAggregatePipeline);

  if (!totalLikes) {
    throw new ApiError(
      400,
      "Something went wrong While accessing total like count"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideo,
        totalSubscriber,
        totalViews,
        totalLikes,
      },
      "channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  console.log(req.user._id);
  try {
    const channelVideosAggregatePipeline = [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const videos = await Video.aggregate(channelVideosAggregatePipeline);

    if (!videos) {
      throw new ApiError(400, "Videos not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while accessing the videos"
    );
  }
});

export { getChannelStats, getChannelVideos };
