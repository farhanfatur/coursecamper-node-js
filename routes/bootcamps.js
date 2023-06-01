const express = require('express')
const {
    getBootcamps, 
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} = require("../controllers/bootcamps")
const Bootcamp = require('../models/Bootcamp')
const advanceResults = require('../middleware/advanceResults')
const courseRouter = require('./courses')
const {protect} = require('../middleware/auth')
const router = express.Router()

// route
router.use('/:bootcampId/courses', courseRouter)
router.route('/:id/photo').put(protect, bootcampPhotoUpload)
router.route('/radius/:longitude/:latitude/:distance').get(getBootcampInRadius)
router.route("/").get(advanceResults(Bootcamp, 'courses'), getBootcamps).post(protect, createBootcamp)
router.route("/:id").get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp)
module.exports = router