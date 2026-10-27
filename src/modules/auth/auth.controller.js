import {UserService} from "../users/user.service.js";
import {AuthService} from  "./auth.service.js"
import {successResponse, validate} from "../../common/helpers.js"
import {loginSchema,registerSchema  } from "./auth.validation.js"
export const AuthController = {
    register: async (req, res) => {
        const body = validate(registerSchema, req.body || {});
        const user = await UserService.create(body);
        return res.status(201).json(successResponse("User Created Successfully", user));
    },
    login: async (req, res) => {
        const body = validate(loginSchema, req.body || {});
        const result = await AuthService.login(body);
        return res.status(200).json(successResponse("User Login Successfully", result));
    },
    // req.user is set by the decodeRefreshToken middleware
    refreshToken: async (req, res) => {
        const result = await AuthService.refreshToken(req.user);
        return res.status(200).json(successResponse("Token Refreshed Successfully", result));
    },
    // req.accessTokenData and req.refreshTokenData are set by the authenticate and decodeRefreshToken middlewares
    logout: async (req, res) => {
        const result = await AuthService.logout(req.accessTokenData, req.refreshTokenData);
        return res.status(200).json(successResponse("User Logged Out Successfully", result));
    },
    forgotPassword: async (req, res) => {
        const body = req.body || {};
        const result = await AuthService.forgetPassword(body);
        return res.status(200).json(successResponse("Password Reset Token Created Successfully", result));
    },
    resetPassword: async (req, res) => {
        const body = req.body || {};
        await AuthService.resetPassword(body);
        return res.status(200).json(successResponse("Password Reset Successfully", null));
    }

}
