const asyncHandler = require('express-async-handler');
const { Center } = require('../Models/CenterModel');
const { Instructor } = require('../Models/InstructorModel');
const { InstructorPayment } = require('../Models/InstructorPaymentModel');
const { InstructorPaymentRecord } = require('../Models/InstructorPaymentRecordModel');
const { Attendance } = require('../Models/AttendanceModel');
const { Transaction } = require('../Models/TransactionsModel');
const { Batch } = require('../Models/BatchModel');
const { Class } = require('../Models/ClassModel');
const { Enrollment } = require('../Models/EnrollmentModel');
const { Student } = require('../Models/StudentModel');
const { Course } = require('../Models/CourseModel');
const { User } = require('../Models/UserModel');
const { StudentAppBanner } = require('../Models/StudentAppBanner');

const crypto = require('crypto');
const { getClosestNextDate, sortClassesByDate } = require('../Utility/helpers');

const { generateToken } = require('../Utility/generateToken');

const {
  ATTENDANCE_PRESENT,
  ATTENDANCE_LEAVE_APPLIED,
  ATTENDANCE_LEAVE_APPROVED,
  ATTENDANCE_LEAVE_REJECTED,
} = require('../Utility/constants');


//@desc ADMIN LOGIN
//@route POST /api/admin/login
//@access Admin
module.exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });
  if (!admin) {
    res.status(401);
    throw new Error('Please enter the correct email');
  }
  if (await admin.matchPassword(password)) {
    res.status(200);
    res.json({
      name: admin.firstName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error('Incorrect password');
  }
});

//@desc get dashborad overview data
//@route GET /api/admin/dashborad
//@access Admin
module.exports.getDashboardData = asyncHandler(async (req, res) => {
  const students = await Student.countDocuments({});
  const instructors = await Instructor.countDocuments({});
  const centers = await Center.countDocuments({});
  const courses = await Course.countDocuments({});

  res.status(200);
  res.json({
    numStudents: students,
    numInstructors: instructors,
    numCenters: centers,
    numCourses: courses,
  });
});


//@desc Get all courses by  instructor
//@route POST /api/users/instructors/getAllCourses
//@access public/InstructorApp
module.exports.markInstructorAttendance = asyncHandler(async (req, res) => {
	
  const { classId, instructorId } = req.body;
  
  const instructor = await Instructor.findById(instructorId);
  

  const attendance = await Attendance.create({
    class: classId,
    instructor: instructor._id,
    attendanceStatus: ATTENDANCE_PRESENT,
  });

  if (attendance) {
    instructor.attendances.push(attendance._id);
    await instructor.save();
    res.status(200);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Failed to mark attendance, Please try again');
  }
});


// Suspend a student
module.exports.suspendStudent = asyncHandler(async (req, res) => {
	
  const userId = req.query.userId; 
  
  const user = await User.findById(userId);
  user.status = 'Suspended';
  user.save();

  res.status(200);
  res.json({
    status: user.status,    
  });
  
});


// Get a student attendance
module.exports.getInstructorAttendance = asyncHandler(async (req, res) => {
	
  const attendances = await Attendance.find({instructor:req.query.id})
     .populate({ 
        path: 'class',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     })
     .populate({ 
        path: 'instructor',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     });
     
     
     const batches = await Batch.find({})
     .populate({ 
        path: 'classes',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     })
     .lean();
     
     
     var classes = [];
     
     for(var i=0;i<batches.length;i++){
         
           for(var j=0;j<batches[i].classes.length;j++){ 
              classes.push(batches[i].classes[j]); 
           }  
     }
     
     

     if (attendances) {
       res.status(200).json({ status: 'success', attendances, classes });
     } else {
       res.status(400);
       throw new Error('Attendances not found');
     }
});




module.exports.getInstructorClassesWithAttendance = asyncHandler(async (req, res) => {
	
  const attendances = await Attendance.find({instructor:req.query.id})
     .populate({ 
        path: 'class',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     })
     .populate({ 
        path: 'instructor',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     });
     
     
     const batches = await Batch.find({})
     .populate({ 
        path: 'classes',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     })
     .lean();
     
     
     var classes = [];
     
     for(var i=0;i<batches.length;i++){
         
           for(var j=0;j<batches[i].classes.length;j++){ 
              classes.push(batches[i].classes[j]); 
           }  
     }
     
     

     if (attendances) {
       res.status(200).json({ status: 'success', attendances, classes });
     } else {
       res.status(400);
       throw new Error('Attendances not found');
     }
});


// Revoke a student suspension
module.exports.revokeStudentSuspension = asyncHandler(async (req, res) => {
	
  const userId = req.query.userId;
  
  const user = await User.findById(userId);
  user.status = 'Active';
  user.save();

  res.status(200);
  res.json({
    status: user.status,    
  });
  
});



module.exports.addInstructorPayment = asyncHandler(async (req, res) => {
	

	
  const instructorId = req.body.instructorId;
  const classId = req.body.classId;
  const amount = req.body.amount;
  const penaltyAmount = req.body.penaltyAmount;
  
  const { ObjectId } = require('mongodb');

  
  InstructorPayment.create({ instructor: ObjectId(instructorId), theClass: ObjectId(classId), amount:amount, penaltyAmount:penaltyAmount  }, 
     function (err, instructorPayment) {
     	
     if (err) {
     	  //return handleError(err);
     	  console.log(err);
     }
       
     res.send(instructorPayment)  
  });  
  
  
});


module.exports.getInstructorPayments = asyncHandler(async (req, res) => {
	
	  const instructorId = req.query.instructorId;
  
     const instructorPayments = await InstructorPayment.find({instructor:Object(instructorId)}).populate('class')
     .populate({ 
        path: 'instructor',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     })
     .populate({ 
        path: 'theClass',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     })
     .lean();
     

     
     res.send(instructorPayments);    
     
  
});


module.exports.getInstructorPaymentsBatchwise = asyncHandler(async (req, res) => {
	
	  const instructorId = req.query.instructorId;  
	  
  
     const instructorPayments = await InstructorPayment.find({instructor:Object(instructorId)}).populate('class')
     .populate({ 
        path: 'instructor',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     })
     .populate({ 
        path: 'theClass',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     })
     .lean();
     

     
     res.send(instructorPayments);
     
     
  
});


module.exports.deleteAllClasses = asyncHandler(async (req, res) => {
	
	 Class.deleteMany({}).then(function(){
        console.log("Data deleted"); // Success
    }).catch(function(error){
        console.log(error); // Failure
    });
	
});	



module.exports.getAllEnrollments = asyncHandler(async (req, res) => {
	
	  const enrollments = await Enrollment.find({}).populate('batch course transaction')
     .populate({ 
        path: 'student',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     })     
     .lean();
	
	
	  res.send(enrollments);
});	




// Get all students and enroll-able batches for them
module.exports.getStudentsAndBatches = asyncHandler(async (req, res) => {
	
	  const students = await Student.find({}).populate('userId').lean();
	  
	  for(var i=0;i<students.length;i++){
         
         const batches = await Batch.find({center:students[i].center});
         students[i].batches = batches;
	  }	
	
	  res.send(students);
});


// Admin- enrolls a student
module.exports.enrollStudent = asyncHandler(async (req, res) => {
	
  const {
    batch,
    student,
  } = req.body;
  

  
  const theBatch = await Batch.findById(batch).populate('courses');
  

  
  const joiningDate = theBatch.startDate;  
  const couponCode = "";  
  const fees = theBatch.fees;
  const registrationFees = theBatch.registrationFees;
  const course = theBatch.courses[0]._id;
  
  const orderCreationId = '';
  const razorpayPaymentId = '';
  const razorpayOrderId = '';
  const razorpaySignature = '';

  /*const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);

  hmac.update(`${orderCreationId}|${razorpayPaymentId}`);

  const digest = hmac.digest('hex');
  if (digest !== razorpaySignature) {
    res.status(400);
    throw new Error('Transaction Failed!');
  }*/

  const batchDB = await Batch.findById(batch).populate({
    path: 'classes',
    model: 'Class',
    select: 'date',
  });

  

  const studentUser = await Student.findById(student).populate('userId');
  


  const transaction = await Transaction.create({
    transactionAmount: fees,
    transactionType: 'enroll',
    paymentMode: 'Razorpay',
    isPaid: true,
    paymentDetails: {
      razorpayPaymentId,
      razorpayOrderId,
    },
  });
  


  const enrollment = await Enrollment.create({
    student,
    course,
    batch,
    freezeLimit: batchDB.classFreezeLimit,
    startDate: joiningDate,
    transaction: transaction._id,
  });
  

  
  transaction.enrollmentId = enrollment._id;
  await transaction.save();
  //expiring coupons after 10 days




  //enrollment done
  if (enrollment) {
  	

    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode });
      coupon.isApplied = true;

      //calculate exire data
      const expireDate = new Date();
      const numberOfDaysToAdd = 10;
      expireDate.setDate(expireDate.getDate() + numberOfDaysToAdd);

      coupon.expire_at = expireDate;
      coupon.expireAfterSeconds = 0;
      coupon.save();
      transaction.discountAmount = coupon.couponAmount;
      await transaction.save();
    }
    

          	
          	
    //getting the required classes from batch and adding to student enrollment
    {
    	


      const sortedClasses = await sortClassesByDate(batchDB.classes);

          	
      const closestDate = await getClosestNextDate(joiningDate, sortedClasses);
      
      


      let indexOfFirstBatchClass = 0;

      sortedClasses.find((c, i) => {
        if (c.date.toString() === closestDate.toString()) {
          indexOfFirstBatchClass = i;
        }
      });      


      for (let i = indexOfFirstBatchClass; i < batchDB.numClasses; i++) {
      	
        const classObj = sortedClasses[i]; 
        
        if(typeof classObj !=='undefined'){
           enrollment.classes.push(classObj._id);
        }
      }                	          	
                	          	
      await enrollment.save();
    }
    
    
                  

    studentUser.isRegistrationFeePaid = true;
    
    if (registrationFees) {
      studentUser.registrationTransctionId = transaction._id;
    }
    
    batchDB.students.push(studentUser._id);
    await batchDB.save();
    studentUser.enrollments.push(enrollment._id);
    studentUser.batches.push(batch);
    await studentUser.save();
    
    const user = await User.findById(studentUser.userId);
    


    res.status(200).json({
      status: 'success',
      student: {
        isRegistrationFeePaid: studentUser.isRegistrationFeePaid,
        enrollments: studentUser.enrollments,
        _id: studentUser._id,
        center: studentUser.center,
        batches: studentUser.batches,
        token: generateToken(studentUser._id),
        userId: {
          firstName: user.firstName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePic: user.profilePic,
          qrCode: user.qrCode,
          dob: user.dob,
          gender: user.gender,
          _id: user._id,
        },
      },
    });
  } else {
    res.status(400);
    throw new Error('Student could not be enrolled');
  }
});


// Admin- add instructor payment record
module.exports.addInstructorPaymentRecord = asyncHandler(async (req, res) => {
	
  const {
    batch,
    instructor,
    month,
    amount,
    penaltyDeducted,
    comments,
  } = req.body;
  
  
  
  const instructorPaymentRecord = await InstructorPaymentRecord.create({
  	
      batch: batch,
      paymentDate: new Date(),
      instructor: instructor,
      penaltyDeducted: penaltyDeducted,
      amount:amount,
      comments:comments,  
      month:month,  
   });
  
  
   res.send(instructorPaymentRecord); 
  


});


// Admin- get instructor payment records
module.exports.getInstructorPaymentRecords = asyncHandler(async (req, res) => {  
  
  const instructorPaymentRecords = await InstructorPaymentRecord.find({instructor:req.query.instructorId}).populate('batch')     
     .populate({ 
        path: 'instructor',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     });
  
  res.send(instructorPaymentRecords);

});

// Admin- Update student app banners
module.exports.updateStudentAppBanners = asyncHandler(async (req, res) => {  

  var banner1Title = req.body.banner1Title;
  var banner2Title = req.body.banner2Title;
  var banner3Title = req.body.banner3Title;
  
  var image1Uploaded = req.body.image1Uploaded;
  var image2Uploaded = req.body.image2Uploaded;
  var image3Uploaded = req.body.image3Uploaded;
  
  const studentAppBanner1 = await StudentAppBanner.findById("6115b77ba865d7fb9d496188");  
  studentAppBanner1.title = banner1Title;
  studentAppBanner1.imageUrl = 'https://app-backend.dmentors.in/images/appbanner1.jpg';
  studentAppBanner1.save();
  
  const studentAppBanner2 = await StudentAppBanner.findById("6115b795150ba41a4478799c");  
  studentAppBanner2.title = banner2Title;
  studentAppBanner2.imageUrl = 'https://app-backend.dmentors.in/images/appbanner2.jpg';
  studentAppBanner2.save();
  
  const studentAppBanner3 = await StudentAppBanner.findById("6115b79a150ba41a4478799d");  
  studentAppBanner3.title = banner3Title; 
  studentAppBanner3.imageUrl = 'https://app-backend.dmentors.in/images/appbanner3.jpg';
  studentAppBanner3.save();
  
  res.send({status:"updated"});

});


module.exports.uploadStudentAppBanner1 = asyncHandler(async (req, res) => {
	
  if (req.file) {
    res.status(201);
    res.json({ message: 'success' });
  } else {
    res.status(300);
    throw new Error('Failed to upload image');
  }
});

module.exports.uploadStudentAppBanner2 = asyncHandler(async (req, res) => {
	
  if (req.file) {
    res.status(201);
    res.json({ message: 'success' });
  } else {
    res.status(300);
    throw new Error('Failed to upload image');
  }
});

module.exports.uploadStudentAppBanner3 = asyncHandler(async (req, res) => {
	
  if (req.file) {
    res.status(201);
    res.json({ message: 'success' });
  } else {
    res.status(300);
    throw new Error('Failed to upload image');
  }
});



module.exports.loadAppBannersInfo = asyncHandler(async (req, res) => {	
	
  	  const studentAppBanner1 = await StudentAppBanner.findById("6115b77ba865d7fb9d496188");  
     const studentAppBanner2 = await StudentAppBanner.findById("6115b795150ba41a4478799c");  
     const studentAppBanner3 = await StudentAppBanner.findById("6115b79a150ba41a4478799d");   
     
     res.send({studentAppBanner1, studentAppBanner2, studentAppBanner3});
    
});







	
