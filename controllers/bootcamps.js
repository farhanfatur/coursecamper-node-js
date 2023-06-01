const { default: mongoose } = require('mongoose')
const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const AsyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
// const openGeocoder = require('node-open-geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = AsyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResults);
});

// @desc    Get one bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = AsyncHandler(async (req, res, next) => {

        // const id = mongoose.Types.ObjectId(req.params.id.trim())
        
        const bootcamp = await Bootcamp.findById(req.params.id)

        if (!bootcamp) {
            next(new ErrorResponse(`Data of id ${req.params.id} is not found`), 404)       
        }

        res.status(200).json({
            success: true, 
            data: bootcamp, 
            msg: ""
        })
});

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
        success: true,
        data: bootcamp,
        msg: "Success create new bootcamps"
    })
    
})

// @desc    Update data bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!bootcamp) {
        return res.status(400).json({
            success: false, 
            data: [], 
            msg: `Error update data with id: ${req.params.id}`
        })
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
        msg: `Success update bootcamps with id ${req.params.id}`
    })
})

// @desc    Delete single bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    bootcamp.remove()

    res.status(200).json({
        success: true,
        data: bootcamp,
        msg: `Success delete bootcamps with id ${req.params.id}`
    })
})

// @desc    Get bootcamp within radius
// @route   GET /api/v1/bootcamps/radius/:longitude/:latitude/:distance
// @access  Public
exports.getBootcampInRadius = AsyncHandler(async (req, res, next) => {
    const { longitude, latitude, distance } = req.params

    // divide distance and radius earth
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], 100/6378.1] } }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = AsyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const fileOpt = req.files.file
    
    console.log(fileOpt)
    if (!fileOpt.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`), 400)
    }

    if (!fileOpt.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload file less then 1MB`, 400))
    }

    fileOpt.name = `photo_${bootcamp.id}${path.parse(fileOpt.name).ext}`

    fileOpt.mv(`${process.env.FILE_UPLOAD_PATH}/${fileOpt.name}`, async err => {
        if (err) {
            console.log(err)
            return next(new ErrorResponse(`Problem with upload file`), 500)
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: fileOpt.name})

        res.status(200).json({
            success: true,
            data: fileOpt.name
        })
    })
})