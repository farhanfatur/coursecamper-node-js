const mongoose = require('mongoose')
const Courses = require('../models/Courses')
const AsyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = AsyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Courses.find({bootcamp: req.params.bootcampId});

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    }else {
        res.status(200).json(res.advanceResults)
    }

   
})

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = AsyncHandler(async (req, res, next) => {
    const course = await Courses.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    })

    if (!course) {
        return next(new ErrorResponse(`No course find with id ${req.params.id}`), 400)
    }


    res.status(200).json({
        success: true,
        count: course.length,
        data: course
    })
})

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = AsyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp find with id ${req.params.bootcampId}`), 400)
    }

    const course = await Courses.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Update course
// @route   PUT /api/v1/course/:id
// @access  Private
exports.updateCourse = AsyncHandler(async (req, res, next) => {
    let course = await Courses.findById(req.params.id)

    if (!course) {
        return next(new ErrorResponse(`No course find with id ${req.params.id}`), 404)
    }

    course = await Courses.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Delete a course
// @route   DELETE /api/v1/course/:id
// @access  Private
exports.deleteCourse = AsyncHandler(async (req, res, next) => {
    const course = await Courses.findById(req.params.id)

    if (!course) {
        return next(new ErrorResponse(`No course find with id ${req.params.id}`), 404)
    }

    await course.remove()

    res.status(200).json({
        success: true,
        data: {}
    })
})