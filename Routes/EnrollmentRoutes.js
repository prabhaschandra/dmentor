const express = require('express');

const { protectAdmin } = require('../Middleware/AuthMiddleware');
const {
  createPayment,
  enrollStudent,
  getEnrolledCourses,
  getEnrolledStudents,
  renewEnrollment,
  getAllPaymentsAdmin,
  enrollStudentDemo,
  deleteAnEnrollment,
} = require('../Controllers/EnrollmentControllers');

const router = express.Router();
// base route http://app-backend.dmentors.in/api/enrollments/

router.route('/enrollStudent').post(enrollStudent);
router.route('/enrollStudentDemo').post(enrollStudentDemo);

router.route('/renewEnrollment?').post(renewEnrollment);
router.route('/createPayment').post(createPayment);
router.route('/getEnrolledCourses').post(getEnrolledCourses);

router.delete('/?', deleteAnEnrollment);

//payment history
router.get('/transactions/all', getAllPaymentsAdmin);

module.exports = router;
