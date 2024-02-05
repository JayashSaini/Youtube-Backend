import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const {page = 1, limit = 10 } = req.query;
    
    const commentAggregate = await Comment.aggregate();
    const options = {
        page,
        limit
    }

    if(!videoId){
        throw new ApiError(400,"videoID is missing");
    }

    const comments = Comment
    .mongooseAggregatePaginate(commentAggregate,options)
    .find(
        {
            "video" : videoId
        }
    )
    .select("-video");

    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comments,
            "Comment fetched successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { comment } = req.body;
    const { videoId } = req.params;

    if(!comment && videoId){
        throw new ApiError(400,"Comment & VideoId is required")
    }

    try {
        await Comment.create({
            comment,
            owner : req.user._id,
            video : videoId
        })
    } catch (error) {
        throw new ApiError(500,"Error while uploading the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { newcomment } = req.body;
    const { commentId } = req.params

    if(!newcomment && !commentId){
        throw new ApiResponse(400,"new Comment and comment Id is required!!!");
    }

    let updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set : {
                comment : newcomment
            }
        },
        { 
            new : true 
        }
    )

    if(!updatedComment){
        throw new ApiError(501,"Comment is not exist");
    }

    return res
    .status(200),
    json(
        new ApiResponse(
            200,
            updateComment,
            "Comment update successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    
   try {
     await Comment.findByIdAndDelete(
         commentId
     )
   } catch (error) {
    throw new ApiError(500,error.message || "While deleting the comment")
}

   return res
    .status(200),
    json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}