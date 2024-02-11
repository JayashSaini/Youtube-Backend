import mongoose, { mongo } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page,
    limit,
  };
  if (!videoId) {
    throw new ApiError(400, "videoID is missing");
  }
  try {
    const commentAggregate = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
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
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likedBy",
          pipeline: [
            {
              $group: {
                _id: null,
                totalLikes: {
                  $sum: 1,
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalLikes: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          likedBy: {
            $size: "$likedBy",
          },
          owner: {
            $arrayElemAt: ["$owner", 0],
          },
        },
      },
    ]);

    // const comments = await Comment.aggregatePaginate(commentAggregate, options);

    if (!commentAggregate) {
      throw new ApiError(400, "videoID is missing");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, commentAggregate, "Comment fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while accessing the comments"
    );
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { comment } = req.body;
  const { videoId } = req.params;

  if (!comment && !videoId) {
    throw new ApiError(400, "Comment & VideoId is required");
  }
  console.log("comment is : ", comment);
  try {
    const addedcomment = await Comment.create({
      comment: comment,
      owner: req.user._id,
      video: videoId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, addedcomment, "Comment added successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Error while uploading the comment"
    );
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  let { newcomment } = req.body;
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiResponse(400, "comment Id is required!!!");
  }
  if (newcomment) {
    try {
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $set: {
            comment: newcomment,
          },
        },
        {
          new: true,
        }
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedComment, "Comment update successfully")
        );
    } catch (error) {
      throw new ApiError(
        500,
        error.message || "Something went wrong while updating the comment"
      );
    }
  }
  try {
    let updatedComment2 = await Comment.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(commentId),
        },
      },

      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likedBy",
        },
      },
      {
        $addFields: {
          likedBy: {
            $size: "$likedBy",
          },
        },
      },
    ]);
    if (!updatedComment2) {
      throw new ApiError(501, "Comment is not exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedComment: updatedComment2 },
          "Comment update successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Error while updating the comment"
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment id is missing");
  }
  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "While deleting the comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
