import config from '../config.js';

import argon2 from "argon2";
import jwt from "jsonwebtoken";
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
    message, data
) {
    return  {
        success: true,
        message: message,
        data: data
    }
}

export function errorResponse(
    message, error
) {
    return  {
        success: false,
        message: error,
        error: error,
    }
}

export function generateToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, config.jwtSecret, {expiresIn: expiresIn});
}
export function decodeToken(token) {
    return jwt.verify(token, config.jwtSecret)
}