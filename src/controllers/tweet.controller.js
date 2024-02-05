import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  try {
    const tweet = await Tweet.create({
      content,
      owner: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Internal Server Error While uploading the tweet"
    );
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.params;

  if (!userId) {
    throw new ApiError(400, "UserId is missing");
  }
  try {
    const userTweets = await Tweet.find({
      owner: userId,
    }).select("-owner");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userTweets,
          "User tweets were successfully accessed."
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Internal Server Error: An error occurred while accessing the tweet."
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  // Validation
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is missing");
  }
  if (!content) {
    throw new ApiError(400, "new Content is requirede");
  }

  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedTweet, "User tweets updated successfully .")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Internal Server Error: An error occurred while updating the tweet."
    );
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  // Validation
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is missing");
  }

  try {
    const DeletedTweet = await Tweet.findByIdAndDelete(tweetId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, DeletedTweet, "User tweets Deleted successfully .")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Internal Server Error: An error occurred while deleted the tweet."
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
