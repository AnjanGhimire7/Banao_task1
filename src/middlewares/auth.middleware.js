import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header["authorization"]?.split("Bearer ")[1];
  if (!token) {
    throw new ApiError(402, "unauthorized user!!!");
  }
  const decodeToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const validUser = await User.findById(decodeToken?._id).select(
    "-refreshToken -password"
  );
  if (!validUser) {
    throw new ApiError(401, "Invalid token!!!");
  }
  req.validUser = validUser;
  next();
});
export { verifyJwt };
