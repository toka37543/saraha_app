import {UserService} from "../users/user.service.js";
import {AuthService} from  "./auth.service.js"
import {successResponse, validate} from "../../common/helpers.js"
import {loginSchema, registerSchema, emailSchema, resetPasswordSchema, confirmEmailSchema} from "./auth.validation.js"
export const AuthController = {
    register: async (req, res) => {
        const body = validate(registerSchema, req.body || {});
        const user = await UserService.create(body);
        // the user is already created, a failing email shouldn't fail the registration, they can ask for a new one
        await AuthService.sendEmailConfirmation(user).catch((error) => {
            console.error("Confirmation email failed:", error.message);
        });
        return res.status(201).json(successResponse("User Created Successfully, please check your email to confirm your account", user));
    },
    confirmEmail: async (req, res) => {
        const body = validate(confirmEmailSchema, req.body || {});
        await AuthService.confirmEmail(body);
        return res.status(200).json(successResponse("Email Confirmed Successfully", null));
    },
    resendEmailConfirmation: async (req, res) => {
        const body = validate(emailSchema, req.body || {});
        const result = await AuthService.resendEmailConfirmation(body);
        return res.status(200).json(successResponse("Confirmation Email Sent Successfully", result));
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
        const body = validate(emailSchema, req.body || {});
        const result = await AuthService.forgetPassword(body);
        return res.status(200).json(successResponse("Password Reset Code Sent To Your Email", result));
    },
    resetPassword: async (req, res) => {
        const body = validate(resetPasswordSchema, req.body || {});
        await AuthService.resetPassword(body);
        return res.status(200).json(successResponse("Password Reset Successfully", null));
    }

}
