// import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, arrayOfVideosId } = req.body;

  //TODO: create playlist
  if (!name && !description) {
    throw new ApiError(400, "Name and Description are required");
  }

  if (!arrayOfVideosId) {
    throw new ApiError(400, "arrayOfVideoId is missing");
  }

  if (Array.isArray(arrayOfVideosId)) {
    throw new ApiError(400, "Invalid Video Id type");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    video: arrayOfVideosId,
  });

  if (!playlist) {
    throw new ApiError(400, "Something went wrong while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(400, "UserId is missing");
  }

  const playlists = await Playlist.find({
    owner: userId,
  });

  if (!playlists) {
    throw new ApiError(400, "While accessing the playlists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "playlistId is missing");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "While accessing the playlists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId && !videoId) {
    throw new ApiError(400, "playlistId and videoId are required");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        video: playlistId,
      },
    },
    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(400, "While updating the playlists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylist, "Playlist updated successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId && !videoId) {
    throw new ApiError(400, "playlistId and videoId are required");
  }

  await Playlist.findByIdAndUpdate(playlistId, {
    $pull: {
      video: playlistId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "playlistId is missing");
  }

  deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletePlaylist) {
    throw new ApiError(400, "Playlist Id is not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { newName, newDescription } = req.body;
  //TODO: update playlist

  if (!playlistId) {
    throw new ApiError(400, "playlistId is missing");
  }

  if (!newName && !newDescription) {
    throw new ApiError(400, "Name and Description both are required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: newName,
        description: newDescription,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new ApiError(400, "While updating the playlists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updating successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
