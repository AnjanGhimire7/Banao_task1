import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { togglePostLike } from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJwt);
router.route("/togglelike/:postId").post(togglePostLike);
export default router;
