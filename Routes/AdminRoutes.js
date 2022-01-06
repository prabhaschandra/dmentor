const express = require('express');
const upload = require('../Config/muterUpload');
const { adminLogin, getDashboardData, enrollStudent, loadAppBannersInfo, suspendStudent, updateStudentAppBanners, uploadStudentAppBanner1, uploadStudentAppBanner2, uploadStudentAppBanner3, addInstructorPaymentRecord, getInstructorPaymentRecords, getStudentsAndBatches, getAllEnrollments, deleteAllClasses, addInstructorPayment, getInstructorPaymentsBatchwise, getInstructorPayments, revokeStudentSuspension, getInstructorAttendance, markInstructorAttendance, getInstructorClassesWithAttendance } = require('../Controllers/AdminControllers');
const { protectAdmin } = require('../Middleware/AuthMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/dashboard', protectAdmin, getDashboardData);
router.post('/suspendStudent', protectAdmin, suspendStudent);
router.post('/revokeStudentSuspension', protectAdmin, revokeStudentSuspension);
router.get('/getInstructorAttendance', protectAdmin, getInstructorAttendance);

router.post('/markInstructorAttendance', protectAdmin, markInstructorAttendance);

router.post('/addInstructorPayment', protectAdmin, addInstructorPayment);
router.get('/getInstructorPayments', getInstructorPayments);
router.get('/getInstructorPaymentsBatchwise', getInstructorPaymentsBatchwise);
router.get('/getInstructorClassesWithAttendance', getInstructorClassesWithAttendance);

router.get('/getAllEnrollments', getAllEnrollments);
router.get('/getStudentsAndBatches', getStudentsAndBatches);

router.post('/addEnrollment', enrollStudent);

router.post('/updateStudentAppBanners', updateStudentAppBanners);
router.get('/loadAppBannersInfo', loadAppBannersInfo);


router.post('/uploadStudentAppBanner1', upload.single('image'), uploadStudentAppBanner1);
router.post('/uploadStudentAppBanner2', upload.single('image'), uploadStudentAppBanner2);
router.post('/uploadStudentAppBanner3', upload.single('image'), uploadStudentAppBanner3);


router.get('/deleteAllClasses', deleteAllClasses);

router.post('/addInstructorPaymentRecord', protectAdmin, addInstructorPaymentRecord);
router.get('/getInstructorPaymentRecords', getInstructorPaymentRecords);


module.exports = router;
