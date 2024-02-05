// import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Query } from "mongoose";
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // Define myAggregate & option for aggregate-paginate
  const myAggregate = await Video.aggregate();
  const options = {
    page,
    limit,
  };
  // validations
  if (!sortBy && !sortType && !query) {
    throw new ApiError("SortBy, SortType and Query all are required!!!");
  }
  // Create Custome Aggregate Pipeline
  const customeAggregatePipeline = [
    {
      $match: {
        owner: userId,
      },
    },
    {
      $or: [
        {
          title: {
            $regex: new RegExp(query),
            $options: "si",
          },
        },
        {
          description: {
            $regex: new RegExp(query),
            $options: "si",
          },
        },
      ],
    },
    {
      $sort: {
        sortBy: sortType,
      },
    },
  ];
  const videos = await Video.mongooseAggregatePaginate(
    myAggregate,
    options
  ).aggregate(customeAggregatePipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
