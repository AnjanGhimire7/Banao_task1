import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(401, "Content is required!!!");
  }
  const imagePath = req?.file.path;
  if (!imagePath) {
    throw new ApiError(402, "image path is required!!!");
  }
  const image = await uploadOnCloudinary(imagePath);
  if (!image) {
    throw new ApiError(401, "image file is required!!!");
  }
  const post = await Post.create({
    content,
    owner: req?.validUser?._id,
    image: {
      url: image?.url,
      public_id: image?.public_id,
    },
  });
  if (!post) {
    throw new ApiError(400, "Failed to publish the post!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, post, "Successfully created the post!!!"));
});
const updatePost = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  const { postId } = req.params;
  const updateImagePath = req.file.path;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id!!!!");
  }
  if (!updateImagePath) {
    throw new ApiError(400, "imagepath is missing!!!");
  }
  const post = await Post.findById(postId);
  if (!req?.validUser?._id.equals(post?.owner?._id)) {
    throw new ApiError(400, "your are not  the owner of the post!!!");
  }
  if (newContent) {
    post.content = newContent;
  }
  if (updateImagePath) {
    const newImagePath = await uploadOnCloudinary(updateImagePath);
    if (!newImagePath?.url) {
      throw new ApiError(401, "Failed to upload the image!!!");
    }
    const imageToDelete = post.image.public_id;
    await deleteOnCloudinary(imageToDelete);
    post.image = newImagePath;
  }
  await post.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, { post }, "Successfully updating post!!!"));
});
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "postId not found!!!");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(400, "Something went wrong while fetching the post!!!");
  }
  if (!req.validUser?._id?.equals(post?.owner?._id)) {
    throw new ApiError(400, "You are not the owner of the post!!!");
  }
  const deleteImage = await deleteOnCloudinary(post.image.public_id);
  await Post.findByIdAndDelete(postId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully deleted the post!!!"));
});
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    owner: req.validUser?._id,
  });
  if (!post) {
    throw new ApiError(400, "failed to fetch all the post");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, post, "successfully fetched the post!!!"));
});
export { createPost, updatePost, deletePost, getPost };
