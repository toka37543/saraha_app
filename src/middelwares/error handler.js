const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.cause?.status || err.status || 500;

    res.status(statusCode).json({
        message: "internal server error",
        error: err.message
    });
};

export default errorHandler;