import {User} from "../users/user.repo.js"
import {comparePasswords, hashPassword, generateToken, verifyToken} from "../../common/helpers.js"
import {validateEmail} from "../../common/helpers.js"
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    TooManyRequestsException,
    UnauthorizedException
} from "../../common/errors.js"
import {TOKEN_TYPES} from "../../common/enums.js"
import {RedisService} from "../../common/redis.js"
import {MailService} from "../../common/mail.js"
import {PasswordReset} from "./password.repo.js"
import {EmailConfirmation} from "./confirmation.repo.js"
import {confirmEmailTemplate, resetPasswordTemplate} from "./auth.emails.js"
import * as crypto from "node:crypto";

const CONFIRMATION_VALID_MINUTES = 10;
const RESET_PASSWORD_VALID_MINUTES = 10;
const EMAIL_COOLDOWN_SECONDS = 60;

// one email of each type per user every EMAIL_COOLDOWN_SECONDS, protects the smtp account from spam
const emailCooldownKey = (type, userId) => `email_cooldown_${type}_${userId}`;

const checkEmailCooldown = async (type, userId) => {
    const ttl = await RedisService.ttl(emailCooldownKey(type, userId));
    if (ttl > 0) {
        throw new TooManyRequestsException(`Please wait ${ttl} seconds before requesting another email`, {retry_after: ttl}, "EMAIL_COOLDOWN");
    }
}

const startEmailCooldown = async (type, userId) => {
    await RedisService.set({key: emailCooldownKey(type, userId), value: "true", ttl: EMAIL_COOLDOWN_SECONDS});
}

// revoked tokens are stored as bl_<tokenType>_<jti> (bl = blacklist)
const blacklistKey = (tokenType, jti) => `bl_${tokenType}_${jti}`;

// ttl = token expiration - current time, so redis drops the key by itself once the token would have expired anyway
const revokeToken = async (tokenType, tokenData) => {
    const ttl = RedisService.calculateTTL(tokenData.exp);
    // an already expired token can't be used anymore, nothing to revoke
    if (ttl > 0) {
        await RedisService.set({key: blacklistKey(tokenType, tokenData.jti), value: "true", ttl: ttl});
    }
    return ttl;
}

export const AuthService = {
    login: async (data) => {
        const {
            email,
            password
        } = data;

        if (!email || !password) {
            throw new BadRequestException("Email and password are required")
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new UnauthorizedException("Invalid email or password", null, "INVALID_CREDENTIALS");
        }
        await checkEmailCooldown("login",user._id)
        const isMatched = await comparePasswords(password, user.password);

        if (!isMatched) {
            await startEmailCooldown("login",user._id)
            throw new UnauthorizedException("Invalid email or password", null, "INVALID_CREDENTIALS");
        }

        if (!user.email_confirmed) {
            throw new ForbiddenException("Please confirm your email first", null, "EMAIL_NOT_CONFIRMED");
        }

        const payload = {
            id: user.id,
            email: user.email
        }
        const accessToken = generateToken(payload, TOKEN_TYPES.access)
        const refreshToken = generateToken(payload, TOKEN_TYPES.refresh)
        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: user
        };
    },
    decodeToken: async ({token, tokenType}) => {
        const tokenData = verifyToken(token, tokenType);

        if (!tokenData.jti) {
            throw new UnauthorizedException("Token is invalid", null, "INVALID_TOKEN");
        }

        const isRevoked = await RedisService.get(blacklistKey(tokenType, tokenData.jti));
        if (isRevoked) {
            throw new UnauthorizedException("Token is revoked, please login again", null, "TOKEN_REVOKED");
        }

        const user = await User.findById(tokenData.id);
        if (!user) {
            throw new UnauthorizedException("User not found", null, "USER_NOT_FOUND");
        }

        return {user, tokenData};
    },
    refreshToken: async (user) => {
        const accessToken = generateToken({
            id: user.id,
            email: user.email
        }, TOKEN_TYPES.access)
        return {
            accessToken: accessToken
        };
    },
    logout: async (accessTokenData, refreshTokenData) => {
        if (accessTokenData.id !== refreshTokenData.id) {
            throw new UnauthorizedException("Tokens don't belong to the same user", null, "TOKENS_MISMATCH");
        }

        const [accessTTL, refreshTTL] = await Promise.all([
            revokeToken(TOKEN_TYPES.access, accessTokenData),
            revokeToken(TOKEN_TYPES.refresh, refreshTokenData),
        ]);

        return {accessTTL, refreshTTL};
    },
    sendEmailConfirmation: async (user) => {
        if (user.email_confirmed) {
            throw new BadRequestException("Email is already confirmed", null, "EMAIL_ALREADY_CONFIRMED");
        }

        await checkEmailCooldown("confirmation", user.id);

        // only the latest code should work
        await EmailConfirmation.updateMany({
            user_id: user.id,
            used: false
        }, {
            used: true
        })

        const validUntil = new Date();
        validUntil.setMinutes(validUntil.getMinutes() + CONFIRMATION_VALID_MINUTES);

        const confirmation = await EmailConfirmation.create({
            token: crypto.randomBytes(32).toString("hex"),
            user_id: user.id,
            requested_at: Date.now(),
            valid_until: validUntil,
            used: false,
        });

        await MailService.send({
            to: user.email,
            ...confirmEmailTemplate({
                name: user.first_name,
                token: confirmation.token,
                validMinutes: CONFIRMATION_VALID_MINUTES,
            })
        });
        await startEmailCooldown("confirmation", user.id);

        return {
            valid_until: confirmation.valid_until
        };
    },
    resendEmailConfirmation: async (data) => {
        const {email} = data;

        if (!email) {
            throw new BadRequestException("Email is required");
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new NotFoundException("Email does not exist");
        }

        return await AuthService.sendEmailConfirmation(user);
    },
    confirmEmail: async (data) => {
        const {token, email} = data;
        if (!token || !email) {
            throw new BadRequestException("token and email are required")
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new NotFoundException("Email does not exist");
        }

        if (user.email_confirmed) {
            throw new BadRequestException("Email is already confirmed", null, "EMAIL_ALREADY_CONFIRMED");
        }

        const confirmation = await EmailConfirmation.findOne({
            token: token,
            user_id: user.id,
            used: false,
            valid_until: {$gt: new Date()}
        });

        if (!confirmation) {
            throw new BadRequestException("Code is invalid or expired", null, "INVALID_CONFIRMATION_TOKEN");
        }

        await User.updateOne({
            _id: user.id
        }, {
            email_confirmed: true
        })

        await EmailConfirmation.updateOne({
            _id: confirmation.id
        }, {
            used: true
        })

        return true;
    },
    forgetPassword: async (data) => {
        const {email} = data;

        if (!email) {
            throw new BadRequestException("Email is required");
        }

        if (!validateEmail(email)) {
            throw new BadRequestException("Email is invalid");
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new NotFoundException("Email does not exist");
        }

        await checkEmailCooldown("reset_password", user.id);

        const validUntil = new Date();
        validUntil.setMinutes(validUntil.getMinutes() + RESET_PASSWORD_VALID_MINUTES);

        const passwordReset = await PasswordReset.create({
            token: crypto.randomBytes(32).toString("hex"),
            user_id: user.id,
            requested_at: Date.now(),
            valid_until: validUntil,
            used: false,
        });

        // the token is only sent by email, returning it in the response would let anyone reset any account
        await MailService.send({
            to: user.email,
            ...resetPasswordTemplate({
                name: user.first_name,
                token: passwordReset.token,
                validMinutes: RESET_PASSWORD_VALID_MINUTES,
            })
        });
        await startEmailCooldown("reset_password", user.id);

        return {
            valid_until: passwordReset.valid_until
        };
    },
    resetPassword: async (data) => {
        const {token, email, password} = data;
        if (!token || !email || !password) {
            throw new BadRequestException("token and email,password are required")
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            throw new NotFoundException("Email does not exist");
        }

        const tokenDb = await PasswordReset.findOne({
            token: token,
            user_id: user.id,
            used: false,
            valid_until: {$gt: new Date()}
        });

        if (!tokenDb) {
            throw new BadRequestException("Token is invalid or expired", null, "INVALID_RESET_TOKEN");
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
