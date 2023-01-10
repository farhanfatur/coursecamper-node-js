const ErrorResponse = require('../utils/errorResponse')
const AsyncHandler = require('../middleware/async')
const User = require('../models/User')

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

    const token = user.getSignedJwtToken()
    
    res.status(200).json({
        success: true,
        token
    })
})

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.login = AsyncHandler(async (req, res, next) => {
    
})