const express = require('express');

const upload = require('../Config/muterUpload');

const { protectInstructor, protectAdmin } = require('../Middleware/AuthMiddleware');

const {
  registerInstructor,
  getAllInstructors,
  getAllInstructorsName,
  editInstructor,
  deleteInstructor,
  getAnInstructor,
  getAllInstructorsNameByFilters,
  loginInstructor,
  addStudentAssessment,
  getAllAttendances,
  applyForLeave,
  markAttendanceInstructor,
  markAttendanceStudemt,
  getAllBatchesWith30Mins,
  uploadProfileImage,
  getAllInstructorBatches,
  getAllInstructorCourses,
  getAllLeaveRequest,
  updateLeaveRequest,
} = require('../Controllers/InstructorController');

const router = express.Router();

const {
  sendOtpController,
  verifyOTPController,
  registerStudent,
  getStarted,
  sendOTPLogin,
  verifyOTPLogin,
  editStudent,
  getAllStudents,
  addReview,
  getAllReviews,
  updateProfilePic,
  getAStudent,
  getPackages,
  getCoupons,
  getAttendance,
  getProgress,
  getPayments,
  getDemoRequests,
  getDemoRequestsOfSelf,
  getAllBatchesWithDemo,
  postDemoRequest,
  getAllPaymentsHistory,
  getAllAttendancesStudent,
  freezeClass,
} = require('../Controllers/StudentControllers');

//*******************students routes*************************
//send otp for non register users
router.post('/sendOTP', sendOtpController);

//verify otp for non register users
router.post('/verifyOTP', verifyOTPController);


router.post('/students/sendOTPLogin', sendOTPLogin);  

router.post('/students/verifyOTPLogin', verifyOTPLogin);

//get all students
router.get('/students/getAll', getAllStudents);

//get a  student
router.get('/students/?', getAStudent);

// Get a student packages
router.get('/students/getPackages', getPackages);

// Get a student coupons
router.get('/students/getCoupons', getCoupons);

// Get a student attendance
router.get('/students/getAttendance', getAttendance);

// Get a student progress
router.get('/students/getProgress', getProgress);

// Get a student payments
router.get('/students/getPayments', getPayments);

// Get all demo requests
router.get('/students/getDemoRequests', getDemoRequests);

// Student - Get own demo requests
router.get('/students/getDemoRequestsOfSelf', getDemoRequestsOfSelf);

// Get all batches with demo
router.get('/students/getAllBatchesWithDemo', getAllBatchesWithDemo);

// Post a demo request
router.post('/students/postDemoRequest', postDemoRequest);

//get all reviews
router.get('/students/getAllReviews?', getAllReviews);

//get all reviews
router.get('/students/allPaymentHistory?', getAllPaymentsHistory);

//updated email, phoneNumber
//get student attendances
router.get('/students/getAllAttendances?', getAllAttendancesStudent);

//student freeze class
router.post('/students/freezeClass', freezeClass);
router.put('/students/edit?', editStudent);

//upload profile image
router.post('/students/upload-profile-image?', upload.single('image'), updateProfilePic);

//add instructor
router.post('/students/register', registerStudent);
router.post('/students/getStarted', getStarted);
router.post('/students/addReview/?', addReview);



// ********************instructor routes***********************************
//get all intructors Admin
router.get('/instructors/getAll', getAllInstructors);

//get all intructorsName
router.get('/instructors/getAllName', getAllInstructorsName);

//get a intructor
router.get('/instructors/getAnInstructorr?', getAnInstructor);

//get instructors attendances
router.get('/instructors/getAllAttendances', protectInstructor, getAllAttendances);

//get all batches for instructor
router.get('/instructors/getAllBatches', protectInstructor, getAllInstructorBatches);

//get all course for instructor
router.get('/instructors/getAllCourses', protectInstructor, getAllInstructorCourses);

//getAll Batches/calsses Within 30Mins
router.get('/instructors/getAllBatchesWithin30Mins?', protectInstructor, getAllBatchesWith30Mins);

//get all leave request for instructor by (Admin)
router.get('/instructors/all-leave-request?', protectAdmin, getAllLeaveRequest);

//get all leave request for instructor by (Admin)
router.put('/instructors/update-leave-Request?', protectAdmin, updateLeaveRequest);

//mark instructor attendance
router.post('/instructors/markMyAttendance', protectInstructor, markAttendanceInstructor);

//apply for leave
router.post('/instructors/applyLeave', protectInstructor, applyForLeave);

//mark instructor attendance
router.post('/instructors/markStudentAttendance', markAttendanceStudemt);

//register
router.post('/instructors/add', registerInstructor);

//
router.post('/instructors/upload-profile-image', upload.single('image'), uploadProfileImage);

//login
router.post('/instructors/login', loginInstructor);

//get all instructors by course/batch/center
router.post('/instructors/getAllNameByFilters', getAllInstructorsNameByFilters);

//add student review/assessment
router.post('/instructors/addStudentAssessment', protectInstructor, addStudentAssessment);

//getcourses for the current instructor

router.delete('/instructors/?', deleteInstructor);

router.put('/instructors/edit?', editInstructor);

module.exports = router;
