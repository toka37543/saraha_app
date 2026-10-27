import config from '../config.js';
import {TOKEN_TYPES} from "./enums.js";
import {BadRequestException, ValidationException} from "./errors.js";

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import * as crypto from "node:crypto";
export const validateEmail = (email) => {
    const allowedEmails = [
        "gmail.com",
        "outlook.com",
        "hotmail.com",
        "apple.com",
        "yahoo.com",
    ];

    // toka124345@gmail.com
    const lastPart = email.split("@")[1]
    return allowedEmails.includes(lastPart)
}


export const validateUsername = (username) => {
    const usernameRegex = /^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$/;
    return usernameRegex.test(username);
}

export async function hashPassword(password) {
    return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 1,
    });
}



export async function comparePasswords(plainPassword, hashedPassword) {
    try {
        return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
        console.error("Password verification failed:", error);
        return false;
    }
}

export function successResponse(
    message, data = null
) {
    return  {
        success: true,
        message: message,
        data: data
    }
}

export function errorResponse(
    message, error = null
) {
    return  {
        success: false,
        message: message,
        error: error,
    }
}

// parse data with a zod schema, throws a ValidationException with readable issues on failure
export function validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new ValidationException(result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        })));
    }
    return result.data;
}

// each token type is signed with its own secret, so an access token can never be used as a refresh token
function getTokenConfig(tokenType) {
    switch (tokenType) {
        case TOKEN_TYPES.access:
            return {secret: config.jwtSecret, expiresIn: config.jwtExpiresIn};
        case TOKEN_TYPES.refresh:
            return {secret: config.jwtRefreshSecret, expiresIn: config.jwtRefreshExpiresIn};
        default:
            throw new BadRequestException("Invalid token type", null, "INVALID_TOKEN_TYPE");
    }
}

export function generateToken(payload, tokenType = TOKEN_TYPES.access) {
    const {secret, expiresIn} = getTokenConfig(tokenType);
    // jwtid (jti) is a unique id per token, used as the key when revoking it in redis
    return jwt.sign(payload, secret, {expiresIn: expiresIn, jwtid: crypto.randomUUID()});
}

export function verifyToken(token, tokenType = TOKEN_TYPES.access) {
    const {secret} = getTokenConfig(tokenType);
    return jwt.verify(token, secret)
}
