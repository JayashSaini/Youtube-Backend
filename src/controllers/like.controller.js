// import mongoose, { isValidObjectId } from "mongoose";
import mongoose, { Mongoose } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!videoId) {
    throw new ApiError("Video Id is missing");
  }

  const likedDoc = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  if (likedDoc) {
    await Like.findOneAndDelete({
      likedBy: req.user._id,
      video: videoId,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          likeStatus: false,
        },
        "Unliked successfully"
      )
    );
  }

  await Like.create({
    likedBy: req.user._id,
    video: videoId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likeStatus: true,
      },
      "Liked successfully"
    )
  );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!commentId) {
    throw new ApiError("CommentId is missing");
  }

  const likedDoc = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });

  if (likedDoc) {
    await Like.findOneAndDelete({
      likedBy: req.user._id,
      comment: commentId,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          likeState: false,
        },
        "Unliked successfully"
      )
    );
  }

  await Like.create({
    likedBy: req.user._id,
    comment: commentId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likeState: true,
      },
      "Liked successfully"
    )
  );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!tweetId) {
    throw new ApiError("TweetId is missing");
  }

  const likedDoc = await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  if (likedDoc) {
    await Like.findOneAndDelete({
      likedBy: req.user._id,
      tweet: tweetId,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          likeState: false,
        },
        "Unliked successfully"
      )
    );
  }

  await Like.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likeState: true,
      },
      "Liked successfully"
    )
  );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // get all liked video's
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $ne: null },
        video: { $exists: true },
        video: { $ne: undefined },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "userDetails",
              pipeline: [
                {
                  $project: {
                    _id: 1,
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
                $first: "$userDetails",
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedVideoDetails: {
          $first: "$likedVideoDetails",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "liked video Ids successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
