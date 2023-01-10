const express = require('express')
const {getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/Courses')
const Courses = require('../models/Courses')
const advanceResults = require('../middleware/advanceResults')

const router = express.Router({mergeParams: true});

router.route('/').get(advanceResults(Courses, {
    path: "bootcamp",
    select: "name description"
}), getCourses).post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;