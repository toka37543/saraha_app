import multer from "multer";
import {BadRequestException} from "../common/errors.js";

export const USERS_UPLOAD_DIR = "uploads/users";

// the extension comes from the mimetype, never from the uploaded file name
const PHOTO_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
    destination: USERS_UPLOAD_DIR, // multer creates it if it doesn't exist
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${PHOTO_EXTENSIONS[file.mimetype]}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!PHOTO_EXTENSIONS[file.mimetype]) {
        return cb(new BadRequestException("Only jpeg, png and webp images are allowed", null, "INVALID_FILE_TYPE"));
    }
    cb(null, true);
}

// expects a multipart/form-data body with the image in the "photo" field
export const uploadPhoto = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_PHOTO_SIZE,
        files: 1,
    }
}).single("photo");
