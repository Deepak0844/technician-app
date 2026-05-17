import fs from "fs";
import path from "path";
import multer from "multer";

// Constants
import {
  ErrorMessages,
  UploadLimits,
} from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";
import { AppError } from "#utils/errorUtils.js";

// Ensure the upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "logos");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const userId = req.user?.id ?? "unknown";
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (UploadLimits.ALLOWED_LOGO_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(ErrorMessages.LOGO_INVALID_TYPE, HttpStatus.BAD_REQUEST),
      false,
    );
  }
}

export const uploadLogoMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: UploadLimits.LOGO_MAX_BYTES },
}).single("logo");
