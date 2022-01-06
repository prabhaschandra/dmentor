const express = require('express');

// const { protect } = require('../Middleware/AuthMiddleware');
const router = express.Router();

const {
  getAllCourses,
  getAllCoursesByCenter,
  getACourse,
  addCourse,
  getAllCoursesName,
  deleteACourse,
  editACourse,
} = require('../Controllers/CourseControllers');

router.get('/getAll', getAllCourses);
router.get('/getAllName', getAllCoursesName);
router.get('/getAllByCenter', getAllCoursesByCenter);
router.get('/getACourse', getACourse);

router.post('/add', addCourse);
router.delete('/?', deleteACourse);
router.put('/edit?', editACourse);
module.exports = router;
