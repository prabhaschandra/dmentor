const asyncHandler = require('express-async-handler');

const { User } = require('../Models/UserModel');
const { Student } = require('../Models/StudentModel');
const { DemoRequest } = require('../Models/DemoRequest');
const { Class } = require('../Models/ClassModel');
const { Enrollment } = require('../Models/EnrollmentModel');
const { Transaction } = require('../Models/TransactionsModel');
// const { generateToken } = require('../Utility/generateToken');
const { sendOtp, verifyOTP } = require('../Utility/otp');
const { Review } = require('../Models/ReviewModel');
const { qrCode } = require('../Utility/qrCode');
const { Instructor } = require('../Models/InstructorModel');
const { Batch } = require('../Models/BatchModel');
const { StudentReview } = require('../Models/StudentReviewModel');
const { generateToken } = require('../Utility/generateToken');
const { Attendance } = require('../Models/AttendanceModel');
const { sortClassesByDate, getClosestNextDate } = require('../Utility/helpers');
const { ATTENDANCE_CLASS_FROZEN } = require('../Utility/constants');


//@desc Send OTP
//@route POST /api/users/sentOTP
//@access public
module.exports.sendOtpController = asyncHandler(async (req, res) => {
  
  const { phoneNumber } = req.body;
  try {
    const data = await sendOtp(phoneNumber);
    res.status(200).json(data);
  } catch (error) {
    res.status(400);
    throw new Error('Could not send the OTP, Please try again');
  }
});


//@desc Verify OTP
//@route POST /api/users/verifyOTP
//@access public
module.exports.verifyOTPController = asyncHandler(async (req, res) => {
  const { otp, details } = req.body;
  try {
    const data = await verifyOTP(otp, details);
    res.status(200);
    res.json({
      status: 'success',
      message: 'OTP Matched',
    });
  } catch (error) {
    if (error.response && error.response.data.Details === 'OTP Mismatch') {
      res.status(400);
      throw new Error('OTP does not match, Please enter the correct OTP');
    } else {
      res.status(400);
      throw new Error('Could not verify the OTP, Please try again');
    }
  }
});

//@desc Register user
//@route POST /api/users/register
//@access public
module.exports.registerStudent = asyncHandler(async (req, res) => {
  const { phoneNumber, name, gender } = req.body;

  const userExists = await await User.findOne({ phoneNumber });

  if (userExists) {
    res.status(400);
    throw new Error('A User already exists with this phone number');
  }

  const user = await User.create({
    firstName: name,
    gender,
    phoneNumber,
  });

  const student = await Student.create({
    userId: user._id,
  });

  const [data, error] = await qrCode(student._id, user.firstName);

  user.qrCode = data.path;
  user.student = student._id;
  await user.save();
  await student.save();
  student.populate({
    path: 'userId',
    modle: 'User',
  });

  if (user) {
    user.populate('student');
    res.status(201);
    res.json({
      status: 'success',
      student: {
        isRegistrationFeePaid: student.isRegistrationFeePaid,
        enrollments: [],
        _id: student._id,
        token: generateToken(student._id),
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
    res.status(401);
    throw new Error('User registration failed, Please try again');
  }
});

//@desc get started Student
//@route POST /api/users/student/getStarted
//@access public
module.exports.getStarted = asyncHandler(async (req, res) => {
	
  const { dob, center } = req.body;

  const student = await Student.findById(req.query.id).populate('userId');

  const user = await User.findById(student.userId);
  if (user) {
    user.dob = dob;
    await user.save();
    student.center = center;
    await student.save();
    res.status(201);
    res.json({
      status: 'success',
      student: {
        isRegistrationFeePaid: student.isRegistrationFeePaid,
        enrollments: [],
        _id: student._id,
        center: student.center,
        token: generateToken(student._id),
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
    res.status(401);
    throw new Error('User not found');
  }
});

//@desc edit Student
//@route POST /api/users/student/edit?id=
//@access public
module.exports.editStudent = asyncHandler(async (req, res) => {
  const { email, phoneNumber } = req.body;

  const student = await Student.findById(req.query.id).populate('userId').populate('enrollments');

  const user = await User.findById(student.userId);
  if (user) {
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    await user.save();
    res.status(201);
    res.json({
      status: 'success',
      student: {
        isRegistrationFeePaid: student.isRegistrationFeePaid,
        enrollments: student.enrollments,
        _id: student._id,
        center: student.center,
        batches: student.batches,
        token: generateToken(student._id),
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
    res.status(401);
    throw new Error('User not found');
  }
});

//@desc Authenticate user
//@route POST /api/users/login
//@access public
module.exports.sendOTPLogin = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await User.findOne({ phoneNumber });
  
  if (!user) {
    res.status(400);
    throw new Error(
      'Sorry, we couldn not find an account with this phone number, Please create an account first'
    );
  }
  
  
  try {
    const data = await sendOtp(phoneNumber);
    res.status(200).json(data);
  } catch (error) {
    res.status(400);
    throw new Error('Could not send the OTP, Please try again');
  }
});

//@desc Authenticate user
//@route POST /api/users/login
//@access public
module.exports.verifyOTPLogin = asyncHandler(async (req, res) => {
  const { phoneNumber, otp, details } = req.body;
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    res.status(400);
    throw new Error(
      'Sorry, we could not find an account with this phone number, Please create an account first'
    );
  }

  const student = await Student.findById(user.student).populate('userId').populate('enrollments');
  
  if(student){

  try {
  	
    const data = await verifyOTP(otp, details);
    
    console.log(student.userId.status);
    
    if(student.userId.status == 'Suspended'){
    	
    	res.status(200);
    	
    	res.json({
    	   status: 'success',
         message: 'Your account is suspended. Please contact DMentors Admin',
      });
    
    }else{
    
      res.status(200);
    
      res.json({
        status: 'success',
        message: 'OTP Matched',
        student: {
          isRegistrationFeePaid: student.isRegistrationFeePaid,
          enrollments: student.enrollments,
          _id: student._id,
          center: student.center,
          batches: student.batches,
          token: generateToken(student._id),
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
    
    }
  } catch (error) {
    if (error.response && error.response.data.Details === 'OTP Mismatch') {
      res.status(400);
      throw new Error('OTP does not match, Please enter the correct OTP');
    } else {
      res.status(400);
      console.log(error);
      throw new Error('Could not verify the OTP, Please try again');
    }
  }
  
  }else{
  	
  	 const instructor = await Instructor.findById(user.instructor).populate('userId');
  	 
  	 if(instructor){
       res.status(400);
       throw new Error('This mobile number is already registered with an instructor account.'); 
    } 
  }
  
  
  
});

//@desc get all  students
//@route Get /api/users/students/getAll
//@access Private/Admin
module.exports.getAllStudents = asyncHandler(async (req, res) => {
	
  const students = await Student.find({})
    .populate('userId', 'firstName status')
    .populate({
      path: 'enrollments',
      model: 'Enrollment',
      select: 'batch course',
      populate: {
        path: 'batch',
        model: 'Batch',
        populate: {
          path: 'instructors',
          model: 'Instructor',
          select: 'userId',
          populate: {
            path: 'userId',
            model: 'User',
            select: 'firstName',
          },
        },
      },
    })
    .populate({
      path: 'enrollments',
      model: 'Enrollment',
      select: 'batch course',
      populate: {
        path: 'course',
        model: 'Course',
        select: 'courseName',
      },
    });

  if (students) {
    res.status(200).json({ status: 'success', students });
  } else {
    res.status(400);
    throw new Error('No students found');
  }
});

//@desc get a single  student
//@route Get /api/users/students/?id=
//@access Private/Admin
module.exports.getAStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.query.id).populate('userId');

  if (student) {
    res.status(200).json({ status: 'success', student });
  } else {
    res.status(400);
    throw new Error('Student not found');
  }
});

// Get a student packages
module.exports.getPackages = asyncHandler(async (req, res) => {
	
  const enrollments = await Enrollment.find({student:req.query.id}).populate('course classes')
     .populate({ 
        path: 'batch',
        populate: {
          path: 'instructors',
           populate: {
             path: 'userId',
             model: 'User'
           } 
        } 
     })
     .populate({ 
        path: 'student',
        populate: {
          path: 'userId',
          model: 'User'  
        } 
     })
     .lean(); 
     
     var ObjectId = require('mongoose').Types.ObjectId;     

     
     for(var i=0;i<enrollments.length;i++){
     	
        for(var j=0;j<enrollments[i].classes.length;j++) {
        	
        	   console.log(enrollments[i].classes[j]._id);
        	  
            const attendance = await Attendance.find({class:enrollments[i].classes[j]._id});

            enrollments[i].classes[j].attendance =  attendance;    
        }    
     }
  

     if (enrollments) {
       res.status(200).json({ status: 'success', enrollments });
     } else {
       res.status(400);
       throw new Error('Enrollments not found');
     }
  });


// Get a student payments
module.exports.getPayments = asyncHandler(async (req, res) => {
	
  const enrollments = await Enrollment.find({student:req.query.id}).populate('course')
  .populate({ 
        path: 'student',
        populate: {
          path: 'userId',
          model: 'User'  
        } 
  })
  .lean();
  
  var ObjectId = require('mongoose').Types.ObjectId; 

  
  for(var i=0;i<enrollments.length;i++){
  	
  	 console.log(enrollments[i]._id);
     
     var transaction = await Transaction.findById(enrollments[i].transaction+'');
     console.log(transaction);
     enrollments[i].transaction = transaction;
     
  }
  


  if (enrollments) {
    res.status(200).json({ status: 'success', enrollments,  });
  } else {
    res.status(400);
    throw new Error('Enrollments not found');
  }
});


// Get a student attendance
module.exports.getAttendance = asyncHandler(async (req, res) => {
	
  const attendances = await Attendance.find({student:req.query.id})
     .populate({ 
        path: 'class',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     })
     .populate({ 
        path: 'student',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     });
     
     
     const enrollments = await Enrollment.find({student:req.query.id})
     .populate({ 
        path: 'classes',
        populate: {
          path: 'batch',
          model: 'Batch'
        } 
     }).lean();
     
     var classes = [];
     
     for(var i=0;i<enrollments.length;i++){
         
           for(var j=0;j<enrollments[i].classes.length;j++){ 
              classes.push(enrollments[i].classes[j]) 
           }  
     }
     
     

     if (attendances) {
       res.status(200).json({ status: 'success', attendances, classes });
     } else {
       res.status(400);
       throw new Error('Attendances not found');
     }
});


// Get a student progress
module.exports.getProgress = asyncHandler(async (req, res) => {
	
  const studentReviews = await StudentReview.find({student:req.query.id})
    .populate({ 
        path: 'batch',
        populate: {
          path: 'courses',
          model: 'Course'
        } 
     })
    .populate({ 
        path: 'instructor',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     })
     .populate({ 
        path: 'student',
        populate: {
          path: 'userId',
          model: 'User'
        } 
     });;

  if (studentReviews) {
    res.status(200).json({ status: 'success', studentReviews });
  } else {
    res.status(400);
    throw new Error('Reviews not found');
  }
});


// Get a student coupons
module.exports.getCoupons = asyncHandler(async (req, res) => {
	
   const enrollments = await Enrollment.find({student:req.query.id}).populate('course batch')
     .populate({ 
        path: 'student',
        populate: {
          path: 'userId',
          model: 'User'  
        } 
     })
     .populate({ 
        path: 'transaction',
        model:'Transaction'
     })
    .lean();

  if (enrollments) {
    res.status(200).json({ status: 'success', enrollments });
  } else {
    res.status(400);
    throw new Error('Coupons not found');
  }
});


//@desc update profile pic for student
//@route POST /api/users/students/upload-profile-image
//@access Private/USER
module.exports.updateProfilePic = asyncHandler(async (req, res) => {
	
	
  const student = await Student.findById(req.query.id);
  
  const user = await User.findById(student.userId);
  if (req.file) {
    user.profilePic = `https://app-backend.dmentors.in/images/${req.file.filename}`;
    user.save();
  }

  if (user && req.file) {
    res.status(200).json({
      status: 'success',
      student: {
        isRegistrationFeePaid: student.isRegistrationFeePaid,
        enrollments: student.enrollments,
        _id: student._id,
        center: student.center,
        batches: student.batches,
        token: generateToken(student._id),
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
    throw new Error('Could not update the profile, Please try again');
  }
});

//@desc Add review to batch and instructor
//@route Get /api/users/students/addReview
//@access Private/User
module.exports.addReview = asyncHandler(async (req, res) => {
	
  const { instructor, batch, batchRating, batchComment, instructorRating, instructorComment } = req.body;

  const student = await Student.findById(req.query.id);
  const instructorDB = await Instructor.findById(instructor);
  const batchDB = await Batch.findById(batch);

  const instructorReview = await Review.create({
    student: student._id,
    batch,
    instructor,
    comment: instructorComment,
    rating: instructorRating,
  });

  const batchReview = await Review.create({
    student: student._id,
    batch,
    instructor,
    comment: batchComment,
    rating: batchRating,
  });

  if (instructorReview && batchReview) {
    instructorDB.reviews.push(instructorReview);
    await instructorDB.save();

    batchDB.reviews.push(batchReview);
    await batchDB.save();

    res.status(200).json({ status: 'success' });
  } else {
    res.status(400);
    throw new Error('Something went wrong, Please try again');
  }
});


module.exports.postDemoRequest = asyncHandler(async (req, res) => {
   
    const { student, batch, date } = req.body;
    
    const demoRequest = await DemoRequest.create({
    	
       student: Object(student),
       batch: Object(batch),
       date,       
    });
    
    if (demoRequest) {   

       res.status(200).json({ status: 'success' });
    } else {
       res.status(400);
       throw new Error('Something went wrong, Please try again');
    }

});


module.exports.getDemoRequests = asyncHandler(async (req, res) => {
   

    const demoRequests = await DemoRequest.find({}).populate('batch')
    .populate({ 
        path: 'student',       
        populate: {
             path: 'userId',
             model: 'User'
           } 
     }) 
     
   
    
    if (demoRequests) {   

       res.status(200).json({ demoRequests });
    } else {
       res.status(400);
       throw new Error('Something went wrong, Please try again');
    }

});


module.exports.getDemoRequestsOfSelf = asyncHandler(async (req, res) => {
	
	
	var studentId = req.query.studentId;   
	
	console.log(studentId);

    const demoRequests = await DemoRequest.find({student:studentId}).populate('batch')
    .populate({ 
        path: 'student',       
        populate: {
             path: 'userId',
             model: 'User'
           } 
     }) 
     
   
    
    if (demoRequests) {   

       res.status(200).json({ demoRequests });
    } else {
       res.status(400);
       throw new Error('Something went wrong, Please try again');
    }

});



module.exports.getAllBatchesWithDemo = asyncHandler(async (req, res) => {
   
    var centerId = req.query.centerId;
    
    const batches = await Batch.find({center:centerId, hasDemo:true}).populate('course classes');  
    
    if (batches) {   

       res.status(200).json({ batches });
    } else {
       res.status(400);
       throw new Error('Something went wrong, Please try again');
    }

});


//@desc Add review to batch and instructor
//@route Get /api/users/students/addReview
//@access Private/User
module.exports.addReview = asyncHandler(async (req, res) => {
  const { instructor, batch, batchRating, batchComment, instructorRating, instructorComment } = req.body;

  const student = await Student.findById(req.query.id);
  const instructorDB = await Instructor.findById(instructor);
  const batchDB = await Batch.findById(batch);

  const instructorReview = await Review.create({
    student: student._id,
    batch,
    instructor,
    comment: instructorComment,
    rating: instructorRating,
  });

  const batchReview = await Review.create({
    student: student._id,
    batch,
    instructor,
    comment: batchComment,
    rating: batchRating,
  });

  if (instructorReview && batchReview) {
    instructorDB.reviews.push(instructorReview);
    await instructorDB.save();

    batchDB.reviews.push(batchReview);
    await batchDB.save();

    res.status(200).json({ status: 'success' });
  } else {
    res.status(400);
    throw new Error('Something went wrong, Could not review');
  }
});

//@desc Get all assessment
//@route Get /api/users/students/getAllReviews
//@access Private/User
module.exports.getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await StudentReview.find({ student: { $in: req.query.id } }).populate({
    path: 'instructor',
    model: 'Instructor',
    select: 'userId',
    populate: {
      path: 'userId',
      model: 'User',
      select: 'firstName profilePic phonNumber email',
    },
  });

  if (reviews.length > 0) {
    res.status(200).json({ status: 'success', reviews });
  } else {
    res.status(400);
    throw new Error('No assessment/reviews found');
  }
});

//@desc get all transactions
//@route POST /api/enrollments/transactions/all
//@access Private/Admin
module.exports.getAllPaymentsHistory = asyncHandler(async (req, res) => {
  if (!req.query.id) {
    res.status(400);
    throw new Error('No student found');
  }
  const transactions = await Enrollment.find({ student: { $in: req.query.id } }).populate({
    path: 'transaction',
    model: 'Transaction',
    populate: {
      path: 'enrollmentId',
      model: 'Enrollment',
      populate: {
        path: 'batch',
        model: 'Batch',
        select: 'batchName',
      },
    },
  });

  if (transactions.length > 0) {
    res.status(200).json({ status: 'success', transactions });
  } else {
    res.status(400);
    throw new Error('No transactions found');
  }
});

//@desc Get all courses by instructor
//@route POST /api/users/students/freezeClass
//@access public/InstructorApp
module.exports.freezeClass = asyncHandler(async (req, res) => {
  const { classId, enrollmentId, studentId } = req.body;
  if (!enrollmentId) {
    throw new Error(`Enrollment not found`);
  }
  const student = await Student.findById(studentId);
  const enrollment = await Enrollment.findById(enrollmentId).populate({
    path: 'classes',
    model: 'Class',
    select: 'date',
  });
  const batch = await Batch.findById(enrollment.batch).populate({
    path: 'classes',
    model: 'Class',
    select: 'date',
  });
  if (enrollment.freezeLimit <= 0) {
    throw new Error(
      `Class freeze limit ${
        Number.isInteger(batch.classFreezeLimit) ? `of ${batch.classFreezeLimit}` : ''
      } has been reached, Can not freeze the class.`
    );
  }

  const attendance = await Attendance.create({
    class: classId,
    student: student._id,
    attendanceStatus: ATTENDANCE_CLASS_FROZEN,
  });

  if (attendance) {
    //removing the freezed class & adding an extra class to the enrolled classes
    {
      const filteredEnrollmentClasses = enrollment.classes.filter(
        (c) => c._id.toString() !== classId.toString()
      ); //removing the freezed  class from enrollment class
      const sortedBatchClasses = await sortClassesByDate(batch.classes); //sorted classes of batch by dates
      const sortedEnrollmentClasses = await sortClassesByDate(enrollment.classes); //sorted classes of enrollment by dates
      const lastEnrolledClassDate = sortedEnrollmentClasses[sortedEnrollmentClasses.length - 1].date; //getting the last date of enrolled classes
      const extraClassDate = getClosestNextDate(lastEnrolledClassDate, sortedBatchClasses);
      const extraClassToAdd = sortedBatchClasses.find((c) => c.date === extraClassDate);
      filteredEnrollmentClasses.push(extraClassToAdd);
      enrollment.classes = [...filteredEnrollmentClasses];
    }
    enrollment.freezeLimit = Number.isInteger(enrollment.freezeLimit) ? enrollment.freezeLimit - 1 : 0;
    await enrollment.save();
    student.attendances.push(attendance._id);
    await student.save();
    res.status(200);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Failed to apply for leave, Please try again');
  }
});

//@desc Get all courses by  instructor
//@route POST /api/users/students/getAllAttendances
//@access public/InstructorApp
module.exports.getAllAttendancesStudent = asyncHandler(async (req, res) => {
  const attendances = await Attendance.find({ student: { $in: req.query.id } })
    .populate({
      path: 'student',
      model: 'Student',
      select: 'userId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName',
      },
    })
    .populate({
      path: 'class',
      model: 'Class',
      populate: {
        path: 'batch',
        model: 'Batch',
        select: 'batchName',
      },
    });
  res.status(200);
  res.json({ status: 'success', attendances });
});
