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

const storage = multer.memoryStorage();

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
