const express = require('express')
const {
    getBootcamps, 
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp,
    getBootcampInRadius
} = require("../controllers/bootcamps")
const courseRouter = require('./courses')
const router = express.Router()

// route
router.use('/:bootcampId/courses', courseRouter)
router.route('/radius/:longitude/:latitude/:distance').get(getBootcampInRadius)
router.route("/").get(getBootcamps).post(createBootcamp)
router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)
module.exports = router