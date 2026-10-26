import {UserService} from "../users/user.service.js";
import {AuthService} from  "./auth.service.js"
import {successResponse,errorResponse} from "../../common/helpers.js"
import {loginSchema,registerSchema  } from "./auth.validation.js"
export const AuthController = {
    register: async (req, res) => {
        const body = req.body || {};
        const validationResult = registerSchema.safeParse(req.body);
        if (!validationResult.success) {
            throw errorResponse("Validation Error",validationResult.error.issues);
        }
        const user = await UserService.create(body);
        return res.status(201).json(successResponse("User Created Successfully", user));
    },
    login: async (req, res) => {
        const body = req.body || {};
        const validationResult = loginSchema.safeParse(req.body);
        if (!validationResult.success) {
            throw errorResponse("Validation Error",validationResult.error.issues);
        }
        const user = await AuthService.login(body);
        return res.status(200).json(successResponse("User Login Successfully", user));
    },
    forgotPassword: async (req, res) => {
        const body = req.body || {};
        await AuthService.forgetPassword(body);
        return res.status(200).json(successResponse("User Forgot Passwords Successfully", null));
    },
    resetPassword: async (req, res) => {
        const body = req.body || {};
        await AuthService.resetPassword(body);
        return res.status(200).json(successResponse("User Resetd Successfully", null));
    }

}