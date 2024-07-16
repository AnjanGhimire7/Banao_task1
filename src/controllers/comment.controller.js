import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { isValidObjectId,Types } from "mongoose";
import { PostComment } from "../models/postComment.model.js";
const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId!!!");
  }
  if (!content) {
    throw new ApiError(400, "Content is missing!!!");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "post not found!!!");
  }
  //check if the currnet user is allowded to comment or not
  if (!req?.validUser?._id.equals(post?.owner?._id)) {
    throw new ApiError(403, "Not allowded to comment on the this post!!!");
  }
  const comment = await PostComment.create({
    content,
    post: postId,
    owner: req?.validUser?._id,
  });
  if (!createComment) {
    throw new ApiError(500, "failed to comment on post!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Successfully commenting on the post!!!")
    );
});
const updateComment = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id!!");
  }
  if (!newContent) {
    throw new ApiError(400, "Content is required!!!");
  }
  const comment = await PostComment.findById(commentId);
  if (!req?.validUser?._id.equals(comment.owner?._id)) {
    throw new ApiError(403, "You are not allowded to update the comment!!!");
  }
  if (newContent) {
    comment.content = newContent;
  }
  await comment.save({
    validateBeforeSave: false,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Successfully updating comment!!!"));
});
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id!!");
  }
  const comment = await PostComment.findById(commentId);
  if (!req?.validUser?._id.equals(comment.owner?._id)) {
    throw new ApiError(403, "You are not allowded to update the comment!!!");
  }
  const deletePostComment = await PostComment.findByIdAndDelete(commentId);
  if (!deletePostComment) {
    throw new ApiError(400, "Failed to delete the comment!!!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Successfully deleted the comment from the post!!!!"
      )
    );
});
const getPostComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 3, sortType } = req.query;
  const pageLimit = parseInt(limit);
  const pageSkip = (page - 1) * pageLimit;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId!!!");
  }
  const aggregate = PostComment.aggregate([
    {
      $match: {
        post: new Types.ObjectId(postId),
      },
    },
    {
      $sort: { createdAt: sortType === "new" ? -1 : 1 }, //sorting in  descending order
    },
    {
      $skip: pageSkip,
    },
    {
      $limit: pageLimit,
    },
  ]);
  console.log(aggregate);
  return res
    .status(200)
    .json(
      new ApiResponse(200, aggregate, "Successfuly fetching all the comment!!!")
    );
});
export { createComment, updateComment, deleteComment, getPostComment };
