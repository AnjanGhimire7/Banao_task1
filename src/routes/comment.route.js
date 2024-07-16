import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createComment,
  updateComment,
  deleteComment,
  getPostComment,
} from "../controllers/comment.controller.js";
const router = Router();
router.use(verifyJwt);
router.route("/:postId").post(createComment);
router.route("/updatecomment/:commentId").patch(updateComment);
router.route("/deletecomment/:commentId").delete(deleteComment);
router.route("/getallcomment/:postId").get(getPostComment);
export default router;
