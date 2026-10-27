import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import {
    AppError,
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
    ValidationException
} from "../common/errors.js";
import {errorResponse} from "../common/helpers.js";

// convert any thrown error (ours, jwt, mongoose, multer, express) into an AppError
const normalizeError = (err) => {
    if (err instanceof AppError) {
        return err;
    }

    // TokenExpiredError extends JsonWebTokenError so it must be checked first
    if (err instanceof jwt.TokenExpiredError) {
        return new UnauthorizedException("Token is expired", null, "TOKEN_EXPIRED");
    }
    if (err instanceof jwt.JsonWebTokenError) {
        return new UnauthorizedException("Token is invalid", null, "INVALID_TOKEN");
    }

    if (err instanceof multer.MulterError) {
        return new BadRequestException(err.message, {field: err.field}, err.code);
    }

    if (err instanceof mongoose.Error.ValidationError) {
        return new ValidationException(Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message,
        })));
    }
    if (err instanceof mongoose.Error.CastError) {
        return new BadRequestException(`Invalid value for ${err.path}`, null, "INVALID_ID");
    }
    if (err.code === 11000) {
        return new ConflictException("Duplicate value", err.keyValue, "DUPLICATE_KEY");
    }

    // express.json() errors, e.g. malformed JSON body
    if (err.type === "entity.parse.failed") {
        return new BadRequestException("Invalid JSON body", null, "INVALID_JSON");
    }
    if (err.expose && err.status < 500) {
        return new AppError(err.message, err.status, "BAD_REQUEST");
    }

    return new AppError("Internal server error");
}

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const error = normalizeError(err);

    // only unexpected errors are logged, client errors are part of the normal flow
    if (error.statusCode >= 500) {
        console.error(err);
    }

    res.status(error.statusCode).json(errorResponse(error.message, {
        code: error.code,
        details: error.details,
    }));
};

export const notFoundHandler = (req, res) => {
    throw new NotFoundException(`Route ${req.method} ${req.originalUrl} not found`, null, "ROUTE_NOT_FOUND");
};

export default errorHandler;
