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
const router = express.Router()

// route
router.use('/:bootcampId/courses', courseRouter)
router.route('/:id/photo').put(bootcampPhotoUpload)
router.route('/radius/:longitude/:latitude/:distance').get(getBootcampInRadius)
router.route("/").get(advanceResults(Bootcamp, 'courses'), getBootcamps).post(createBootcamp)
router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)
module.exports = router