import express from "express";
import {AuthController} from "./modules/auth/auth.controller.js";
import {MessageController} from "./modules/messages/message.controller.js";
import {UserController} from "./modules/users/user.controller.js";
import {authenticate} from "./middelwares/auth.middleware.js"

const app = express();

// Auth
app.post("/auth/register", AuthController.register);
app.post("/auth/login", AuthController.login);
app.post("/auth/forget-password",AuthController.forgotPassword)
app.post("/auth/reset-password" ,AuthController.resetPassword)

// Messages
app.post("/messages", MessageController.create);


//profile
app.get("/user/profile",authenticate, UserController.profile);

//

export default app;
