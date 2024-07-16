import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { Like } from "../models/like.model.js";
import { isValidObjectId } from "mongoose";

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(401, "invalid postId!!!");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found!!!!");
  }
  const existinglike = await Like.findOne({
    post: postId,
    likedBy: req?.validUser?._id,
  });
  if (!existinglike) {
    await Like.create({
      post: postId,
      likedBy: req?.validUser?._id,
    });
  } else {
    await Like.findByIdAndDelete(existinglike._id);
  }
  const isLiked = existinglike ? false : true;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        "Successfully toogle the like on post!!!"
      )
    );
});
export { togglePostLike };
