export default class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}


// now create middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    if (err.name === "CastError") {
        err.message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400)
    }

    if (err.name === "JsonWebTokenError") {
        err.message = `Json web token is invalid`;
        err = new ErrorHandler(message, 400)
    }

    if (err.name === "TokenExpiredError") {
        err.message = `Json web token is Expired`;
        err = new ErrorHandler(message, 400)
    }

    if (err.code === 1000) {
        err.message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400)
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
} 

