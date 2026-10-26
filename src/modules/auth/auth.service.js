import {User} from "../users/user.repo.js"
import {comparePasswords, hashPassword,generateToken} from "../../common/helpers.js"
import {validateEmail} from "../../common/helpers.js"
import {PasswordReset} from "./password.repo.js"
import * as crypto from "node:crypto";
import jwt from 'jsonwebtoken'
import config from "../../config.js"
export const AuthService = {
    login: async (data) => {
        const {
            email,
            password
        } = data;

        if (!email || !password) {
            throw new Error("Email and password are required")
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new Error("Email is not exist");
        }

        const isMatched = await comparePasswords(password, user.password);

        if (!isMatched) {
            throw new Error("Passwords don't match");
        }

        const accessToken = generateToken({
            id: user._id,
            email: user.email
        })
        return {
            accessToken: accessToken,
            user: user
        };
    },
    forgetPassword: async (data) => {
        const {email} = data;

        if (!email) {
            throw new Error("Email is required");
        }

        if (!validateEmail(email)) {
            throw new Error("Email is invalid");
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new Error("Email is not exist");
        }

        const validUntil = new Date();
        validUntil.setMinutes(validUntil.getMinutes() + 5);

        await PasswordReset.create({
            token: crypto.randomBytes(32).toString("hex"),
            user_id: user.id,
            requested_at: Date.now(),
            valid_until: validUntil,
            used: false,
        });

        return true;
    },
    resetPassword: async (data) => {
        const {token, email, password} = data;
        if (!token || !email || !password) {
            throw new Error("token and email,password are required")
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new Error("Email is not exist");
        }

        const tokenDb = await PasswordReset.findOne({
            token: token,
            user_id: user.id,
            used: false,
            valid_until: {$gt: new Date()}
        });

        if (!tokenDb) {
            throw new Error("Token is invalid");
        }

        const newPassword = await hashPassword(password);
        await User.updateOne({
            email: email,
        }, {
            password: newPassword
        })

        await PasswordReset.updateOne({
            _id: tokenDb.id
        }, {
            used: true
        })

        return true;
    }

}