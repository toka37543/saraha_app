import {AuthService} from "../modules/auth/auth.service.js";
import {UnauthorizedException} from "../common/errors.js";
import {TOKEN_TYPES} from "../common/enums.js";

// Authorization: Bearer <accessToken>
export const authenticate = async (req, res, next) => {
    const {authorization} = req.headers;
    if (!authorization) {
        throw new UnauthorizedException("Authorization header is missing", null, "MISSING_TOKEN");
    }

    const [prefix, token] = authorization.split(" ");
    if (prefix !== "Bearer" || !token) {
        throw new UnauthorizedException("Invalid authorization header format, expected: Bearer <token>", null, "INVALID_TOKEN_FORMAT");
    }

    const {user, tokenData} = await AuthService.decodeToken({token, tokenType: TOKEN_TYPES.access});

    req.user = user;
    req.accessTokenData = tokenData;
    next();
}

// refreshtoken: <refreshToken>
export const decodeRefreshToken = async (req, res, next) => {
    const {refreshtoken} = req.headers;
    if (!refreshtoken) {
        throw new UnauthorizedException("Refresh token header is missing", null, "MISSING_REFRESH_TOKEN");
    }

    const {user, tokenData} = await AuthService.decodeToken({token: refreshtoken, tokenType: TOKEN_TYPES.refresh});

    req.user = user;
    req.refreshTokenData = tokenData;
    next();
}
