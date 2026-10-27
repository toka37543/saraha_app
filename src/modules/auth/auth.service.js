import {User} from "../users/user.repo.js"
import {comparePasswords, hashPassword, generateToken, verifyToken} from "../../common/helpers.js"
import {validateEmail} from "../../common/helpers.js"
import {BadRequestException, NotFoundException, UnauthorizedException} from "../../common/errors.js"
import {TOKEN_TYPES} from "../../common/enums.js"
import {RedisService} from "../../common/redis.js"
import {PasswordReset} from "./password.repo.js"
import * as crypto from "node:crypto";

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

        const isMatched = await comparePasswords(password, user.password);

        if (!isMatched) {
            throw new UnauthorizedException("Invalid email or password", null, "INVALID_CREDENTIALS");
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
    // verify the token with its own secret, make sure it's not revoked and its user still exists
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
    // revoke both tokens by adding their jti to the redis blacklist
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

        const validUntil = new Date();
        validUntil.setMinutes(validUntil.getMinutes() + 10);

        const passwordReset = await PasswordReset.create({
            token: crypto.randomBytes(32).toString("hex"),
            user_id: user.id,
            requested_at: Date.now(),
            valid_until: validUntil,
            used: false,
        });

        return {
            token: passwordReset.token,
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
