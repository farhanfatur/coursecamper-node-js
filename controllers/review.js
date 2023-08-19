const ErrorResponse = require("../utils/errorResponse");
const AsyncHandler = require("../middleware/async");
const Reviews = require("../models/Reviews");
const Bootcamp = require("../models/Bootcamp")

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = AsyncHandler(async(req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Reviews.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    }else {
        res.status(200).json(res.advanceResults);
    }
});

// @desc    Get spesific Reviews
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = AsyncHandler(async(req, res, next) => {
    const review = await Reviews.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    })

    if (!review) {
        return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: review
    })
})

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.addReview = AsyncHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    console.log(req.params.bootcampId)
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(new ErrorResponse(`No found bootcamp with id ${req.params.bootcampId}`, 404))
    }

    const review = await Reviews.create(req.body)

    res.status(201).json({
        success: true,
        data: review
    })
})

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = AsyncHandler(async(req, res, next) => {
    let review = await Reviews.findById(req.params.id)

    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`, 404))
    }

    // check review belongs to user and user is admin role
    if (review.user.toString() !== req.user.id && req.user.role != "admin") {
        return next(new ErrorResponse(`Not authorize to update review `, 401))
    }

    review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: review
    })
})

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = AsyncHandler(async(req, res, next) => {
    let review = await Reviews.findById(req.params.id)

    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`, 404))
    }

    // check review belongs to user and user is admin role
    if (review.user.toString() !== req.user.id && req.user.role != "admin") {
        return next(new ErrorResponse(`Not authorize to delete review `, 401))
    }

    await review.remove()

    res.status(200).json({
        success: true,
        data: {}
    })
})