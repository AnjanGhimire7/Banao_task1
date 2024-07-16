import { Router } from "express";
const router = Router();
import {
  registerUser,
  loginUser,
  logOutUser,
  forgetPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
router.route("/userregister").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logOutUser);
router.route("/forget-password").post(verifyJwt, forgetPassword);
router.route("/reset-password").patch(verifyJwt, resetPassword);
export default router;
