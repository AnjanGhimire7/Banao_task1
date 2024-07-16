import multer from "multer";
import path from "path";
import crypto from "crypto";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(14, function (err, bytes) {
      const fn = bytes.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

export const upload = multer({
  storage,
});