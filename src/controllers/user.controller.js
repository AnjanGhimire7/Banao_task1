import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken; /// this would save refresh token on database
    await user.save({
      validateBeforeSave: false,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went worng while genrating refresh token and accesss token!!"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if ([userName, email, password].every((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All the fields are required!!!");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(
      403,
      "User with this username or email already exists!!!"
    );
  }
  const user = await User.create({
    userName,
    email,
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password-refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user!!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered succesfully!!!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;
  if (!userName && !password) {
    throw new ApiError(400, "username and password is required!!!");
  }
  const user = await User.findOne({
    userName,
  });
  if (!user) {
    throw new ApiError(404, "User doesn't exists!!!");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!!!");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully!!!"
      )
    );
});
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.validUser?._id,
    {
      $unset: {
        refreshToken: "", //this will remove refresh token from the documents
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully!!!"));
});
const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordToken = hashToken;
  user.resetPasswordExpires = Date.now() + 1000 * 10; // for 10 min
  await user.save();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "sheldon.wisoky7@ethereal.email",
      pass: "9pkjXfGzgZUY9rqjWZ",
    },
  });

  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Password Reset",
    text: "you have requested it because you have requested to reset password!!!",
    html:
      '<p> Please copy the link and <a href="http://localhost:4000/api/v1/users/reset-password?token=' +
      token +
      '"> and reset your password </a>',
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
    }
    return res.status(200).json(new ApiResponse(200, {}, "Email sent!!!"));
  });
});
const resetPassword = asyncHandler(async (req, res) => {
  const token = crypto
    .createHash("sha256")
    .update(req.query.token)
    .digest("hex");

  const { newPassword, confirmPassword } = req.body;
  if (!token) {
    throw new ApiError(400, "token didn't recieved");
  }
  const tokenData = await User.findOne({
    resetPasswordToken: token,
  });

  if (!tokenData) {
    throw new ApiError(500, "The token has expired!!!");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      402,
      "newPassword and confirm password doesn't match!!!"
    );
  }
  (tokenData.resetPasswordToken = undefined),
    (tokenData.resetPasswordExpires = undefined);
  (tokenData.password = newPassword),
    await tokenData.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully reset password!!!"));
});
export { registerUser, loginUser, logOutUser, forgetPassword, resetPassword };
