const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const AsyncHandler = require('../middleware/async')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')
const asyncHandler = require('../middleware/async')

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = AsyncHandler(async (req, res, next) => {
    const {name, email, password, role} = req.body

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    sendTokenResponse(user, 200, res);
})

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.login = AsyncHandler(async (req, res, next) => {
    const {email, password} = req.body

    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400))
    }

    const user = await User.findOne({email}).select("+password")
    if (!user) {
        return next(new ErrorResponse("Invalid credentials", 401))
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 401))
    }

    sendTokenResponse(user, 200, res);
})

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
})

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse(`There is no user with that email`, 404))
    }

    const resetToken = user.getResetPasswordToken()

    await user.save({validateBeforeSave: false})

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
    const message = `You are receiving this email because you (or someone else) has requested the reset of password.Please make a PUT request to: \n\n ${resetUrl}`
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({ success: true, data: "Email sent" })
    } catch (error) {
        console.log(error)
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;

        await user.save({ validateBeforeSave: false })

        return next(new ErrorResponse(`Email could not been sent`))
    }

    console.log("reset token =>", resetToken)
    res.status(200).json({
        success: true,
        data: user
    });
})

// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorResponse("Invalid Token", 400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res)

})

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const fieldToUpdate = {
        name: req.body.name,
        email: req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async(req, res, next) => {
    // console.log("req.user.id =>", req.user.id)
    const user = await User.findOne({id: req.user.id}).select("+password");

    // console.log("user =>", user)
    const isMatch = await user.matchPassword(req.body.currentPassword)
    if (!isMatch) {
        return next(new ErrorResponse("Password is incorrect", 401))
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res)
})

// @desc Log user out and clear cookie
// @route GET /api/v1/auth/logout
// @access Private
exports.logout = asyncHandler(async(req, res, next) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })


    res.status(200).json({
        success: true,
        data: {}
    })
})

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === "production") {
        options.secure = true
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    })
}