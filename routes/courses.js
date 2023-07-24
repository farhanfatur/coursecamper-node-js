const express = require('express')
const {getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/Courses')
const Courses = require('../models/Courses')
const {protect, authorize} = require('../middleware/auth')
const advanceResults = require('../middleware/advanceResults')

const router = express.Router({mergeParams: true});

router.route('/').get(advanceResults(Courses, {
    path: "bootcamp",
    select: "name description"
}), getCourses).post(protect, authorize('publisher', 'admin'), addCourse);
router.route('/:id').get(getCourse).put(protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;