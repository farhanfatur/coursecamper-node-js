const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect route to authorize first
exports.protect = asyncHandler(async(req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }else if (req.cookies.token) {
        token = req.cookies.token
    }
    // TODO: check token by cookies

    if (!token) {
        return next(new ErrorResponse('Not authorize to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // make own request
        req.user = await User.findById(decoded.id)
        next()
    }catch(err) {
        return next(new ErrorResponse('Not authorize to access this route', 401));
    }
});

// Grant access
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorize to access this route`, 403));
        }
        next();
    }
}