import express from "express";
import {AuthController} from "./modules/auth/auth.controller.js";
import {MessageController} from "./modules/messages/message.controller.js";
import {UserController} from "./modules/users/user.controller.js";
import {authenticate, decodeRefreshToken} from "./middelwares/authentication.js";
import {uploadPhoto} from "./middelwares/upload.js";

const router = express.Router();

// Auth
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.post("/auth/refresh-token", decodeRefreshToken, AuthController.refreshToken);
router.post("/auth/logout", authenticate, decodeRefreshToken, AuthController.logout);
router.post("/auth/forget-password",AuthController.forgotPassword)
router.post("/auth/reset-password" ,AuthController.resetPassword)

// Messages
router.post("/messages", MessageController.create);


//profile
router.get("/user/profile", authenticate, UserController.profile);
router.patch("/user/profile/photo", authenticate, uploadPhoto, UserController.uploadPhoto);

//

export default router;
