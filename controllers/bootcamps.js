const { default: mongoose } = require('mongoose')
const Bootcamp = require('../models/Bootcamp')
const AsyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const openGeocoder = require('node-open-geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = AsyncHandler(async (req, res, next) => {
        let query;
        const reqQuery = {...req.query};
        const removeField = ['select', 'sort'];
        let queryStr = JSON.stringify(reqQuery);

        removeField.forEach(param => delete reqQuery[param]);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, match => `$${match}`);
        query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
        
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.sort) {
            const fields = req.query.sort.split(',').join(' ');
            query = query.sort(fields);
        }else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 15;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();

        query = query.skip(startIndex).limit(limit)

        const bootcamps = await query;
        const count = bootcamps.length;
        const pagination = {}

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.previous = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({
            success: true,
            count: count,
            pagination,
            data: bootcamps,
        });
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