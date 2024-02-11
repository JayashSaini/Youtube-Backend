import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteImageonCloudinary,
  deleteVideoonCloudinary,
} from "../utils/cloundinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // validations
  if (!sortBy && !sortType && !query) {
    throw new ApiError("SortBy, SortType and Query all are required!!!");
  }

  // Create Custome Aggregate Pipeline
  const customeAggregatePipeline = [
    {
      $match: {
        $or: [
          { title: { $regex: new RegExp(query, "si") } },
          { description: { $regex: new RegExp(query, "si") } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videoOwner",
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
        videoOwner: {
          $arrayElemAt: ["$videoOwner", 0],
        },
      },
    },
    {
      $sort: {
        sortBy: sortType === "asc" ? 1 : -1,
      },
    },
  ];

  // Define myAggregate & option for aggregate-paginate
  const videos = await Video.aggregate(customeAggregatePipeline);

  // const options = {
  //   page,
  //   limit,
  // };

  // const videos = await Video.aggregatePaginate(myAggregate, options);
  if (!videos) {
    throw new ApiError(400, "No video found");
  }
  // console.log(videos);
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;
  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  //validations
  if (!title && !description) {
    throw new ApiError(400, "Title and Description both are required");
  }

  if (!videoLocalPath && !thumbnailLocalPath) {
    throw new ApiError(
      400,
      "videoLocalPath and thumbnailLocalPath both are required"
    );
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // validations
  if (!video) {
    throw new ApiError(500, "Failed to upload video on Cloudinary");
  }
  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail on Cloudinary");
  }

  const videoResponse = await Video.create({
    videoFile: {
      asset_id: video.asset_id,
      url: video.url,
      public_id: video.public_id,
      resource_type: video.resource_type,
    },
    thumbnail: {
      asset_id: thumbnail.asset_id,
      url: thumbnail.url,
      public_id: thumbnail.public_id,
      resource_type: thumbnail.resource_type,
    },
    duration: video.duration,
    owner: req.user._id,
    title,
    description,
  });

  if (!videoResponse) {
    throw new ApiError(
      500,
      "Something went wrong on MongoDb while uploading a video"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoResponse, "Videos uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "VideoId is missing");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid videoId");
  }
  const video = await Video.findOne({ _id: videoId });

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  let deletedthumbnailStatus;
  //TODO: update video details like title, description, thumbnail

  //validations

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid videoId");
  }

  if (!(title || description || req.file)) {
    throw new ApiError(
      400,
      "Please provide at least one field (title, description, or file) for the request. "
    );
  }

  // set updated Feilds
  let updateFields = {};
  if (title) {
    updateFields.title = title;
  }
  if (description) {
    updateFields.description = description;
  }

  //get updated thumbnail file url
  if (req.file) {
    try {
      const updatedThumbanil = await uploadOnCloudinary(req?.file.path);
      updateFields.thumbnail = updatedThumbanil;

      const video = await Video.findById(videoId);

      deletedthumbnailStatus = await deleteAssetonCloudinary(
        video.thumbnail.public_id
      );
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong While updating a video on clodinary"
      );
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateFields,
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(400, "VideoId is not found");
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        updatedVide: updatedVideo,
        deletedthumbnailStatus: deletedthumbnailStatus,
      },
      "Video updated successfully"
    )
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "VideoId is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid videoId");
  }

  try {
    const deletedVideo = await Video.findByIdAndDelete(videoId, { new: true });

    let deletedVideoResult = await deleteVideoonCloudinary(
      deletedVideo.videoFile.public_id
    );

    let deletedThumbnailResult = await deleteImageonCloudinary(
      deletedVideo.thumbnail.public_id
    );

    if (!deletedVideo) {
      throw new ApiError(400, "Video not found");
    }
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          deletedVideo,
          deletedVideoResult: deletedVideoResult,
          deletedThumbnailResult: deletedThumbnailResult,
        },
        "Video deleted successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "Error : While Deleteing a video on Database"
    );
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is missing");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const togglePublishAggregatePipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $set: {
        PublishedId: {
          $cond: {
            if: { $eq: ["$isPublished", true] }, // If isPublished is true
            then: false, // Set it to false
            else: true, // Otherwise, set it to true
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        owner: 1,
        PublishedId: 1,
        title: 1,
      },
    },
  ];
  const updatedVideo = await Video.aggregate(togglePublishAggregatePipeline);

  if (!updatedVideo) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
