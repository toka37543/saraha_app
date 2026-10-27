export class AppError extends Error {
    constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

export class BadRequestException extends AppError {
    constructor(message = "Bad request", details = null, code = "BAD_REQUEST") {
        super(message, 400, code, details);
    }
}

export class ValidationException extends AppError {
    constructor(details = null, message = "Validation Error") {
        super(message, 400, "VALIDATION_ERROR", details);
    }
}

export class UnauthorizedException extends AppError {
    constructor(message = "Unauthorized", details = null, code = "UNAUTHORIZED") {
        super(message, 401, code, details);
    }
}

export class NotFoundException extends AppError {
    constructor(message = "Not found", details = null, code = "NOT_FOUND") {
        super(message, 404, code, details);
    }
}

export class ConflictException extends AppError {
    constructor(message = "Conflict", details = null, code = "CONFLICT") {
        super(message, 409, code, details);
    }
}
