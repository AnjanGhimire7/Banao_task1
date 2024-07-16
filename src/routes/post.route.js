import { Router } from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
} from "../controllers/post.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.use(verifyJwt);

router.route("/createpost").post(upload.single("image"), createPost);
router.route("/updatepost/:postId").patch(upload.single("image"), updatePost);
router.route("/deletepost/:postId").delete(deletePost);
router.route("/").get(getPost);
export default router;
