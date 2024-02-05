// import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on video

  if(!videoId){
    throw new ApiError("Video Id is missing")
  }

  const likedDoc = await Like.findOne({
    likedBy : req.user._id,
    video : videoId
  })

  if(likedDoc){
    await Like.findOneAndDelete({
        likedBy : req.user._id,
        video : videoId
    } )
    return res
    .status(200)
    .json(
      new ApiResponse(
          200,
          {
            likeState : false
          },
          "Unliked successfully"
      )
    )
  }

  await Like.create({
    likedBy : req.user._id,
    video : videoId
  })
  
  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        {
            likeState : true
        },
        "Liked successfully"
    )
  )
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
  
    if(!commentId){
      throw new ApiError("CommentId is missing")
    }
  
    const likedDoc = await Like.findOne({
      likedBy : req.user._id,
      comment : commentId
    })
  
    if(likedDoc){
      await Like.findOneAndDelete({
          likedBy : req.user._id,
          comment : commentId
      } )
      return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {
              likeState : false
            },
            "Unliked successfully"
        )
      )
    }
  
    await Like.create({
      likedBy : req.user._id,
      comment : commentId
    })
    
    return res
    .status(200)
    .json(
      new ApiResponse(
          200,
          {
              likeState : true
          },
          "Liked successfully"
      )
    )
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
  
    if(!tweetId){
      throw new ApiError("TweetId is missing")
    }
  
    const likedDoc = await Like.findOne({
      likedBy : req.user._id,
      tweet : tweetId
    })
  
    if(likedDoc){
      await Like.findOneAndDelete({
          likedBy : req.user._id,
          tweet : tweetId
      } )
      return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {
              likeState : false
            },
            "Unliked successfully"
        )
      )
    }
  
    await Like.create({
      likedBy : req.user._id,
      tweet : tweetId
    })
    
    return res
    .status(200)
    .json(
      new ApiResponse(
          200,
          {
              likeState : true
          },
          "Liked successfully"
      )
    )
});

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideosIds = await Like.find({
        likedBy : req.user._id
    }).select("-likedby -tweet - comment");

    if(!likedVideosIds){
        throw new ApiError(501,"While access the video Id's ");
    }

    // Remove some object that object id has null or undefined
    const filteredArray = likedVideosIds.filter(obj => obj._id !== undefined && obj._id !== null);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            filteredArray,
            "liked video Ids successfully"
        )
    )
    
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
