const asyncHandler = require('express-async-handler');
const { Student } = require('../Models/StudentModel');
const { Coupon } = require('../Models/CouponModel');
const { Enrollment } = require('../Models/EnrollmentModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Transaction } = require('../Models/TransactionsModel');
const { Batch } = require('../Models/BatchModel');
const { generateToken } = require('../Utility/generateToken');
const { User } = require('../Models/UserModel');
const { getClosestNextDate, sortClassesByDate } = require('../Utility/helpers');
const { Attendance } = require('../Models/AttendanceModel');
const { ATTENDANCE_PRESENT } = require('../Utility/constants');
const { testMail } = require('../Utility/email');

//@desc Enroll student
//@route POST /api/enrollments/enrollStudent
//@access Private
module.exports.enrollStudent = asyncHandler(async (req, res) => {
	
  const {
    batch,
    joiningDate,
    student,
    fees,
    registrationFees,
    course,
    couponCode,
    orderCreationId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);

  hmac.update(`${orderCreationId}|${razorpayPaymentId}`);

  const digest = hmac.digest('hex');
  if (digest !== razorpaySignature) {
    res.status(400);
    throw new Error('Transaction Failed!');
  }

  const batchDB = await Batch.findById(batch).populate({
    path: 'classes',
    model: 'Class',
    select: 'date',
  });

  // if (batch.isSuspended === true) {
  //   res.status(400);
  //   throw new Error('This batch is currently suspended');
  // }

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




//@desc Enroll student
//@route POST /api/enrollments/enrollStudent
//@access Private
module.exports.renewEnrollment = asyncHandler(async (req, res) => {
  const {
    student,
    fees,
    couponCode,
    orderCreationId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);

  hmac.update(`${orderCreationId}|${razorpayPaymentId}`);

  const digest = hmac.digest('hex');
  if (digest !== razorpaySignature) {
    res.status(400);
    throw new Error('Transaction Failed!');
  }

  const enrollment = await Enrollment.findById(req.query.id).populate({
    path: 'classes',
    model: 'Class',
    select: 'date',
  });

  const batchDB = await Batch.findById(enrollment.batch).populate({
    path: 'classes',
    model: 'Class',
    select: 'date',
  });

  if (batchDB.isSuspended === true) {
    res.status(400);
    throw new Error('This batch is currently suspended');
  }

  const studentUser = await Student.findById(student);
  
  console.log('jaka'+studentUser);

  const transaction = await Transaction.create({
    transactionAmount: fees,
    transactionType: 'renew',
    paymentMode: 'Razorpay',
    isPaid: true,
    paymentDetails: {
      razorpayPaymentId,
      razorpayOrderId,
    },
  });

  if (enrollment) {
    //expiring coupons after 10 days
    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode });
      coupon.isApplied = true;
      //calculate exire data
      const expireDate = new Date();
      const numberOfDaysToAdd = 10;
      expireDate.setDate(expireDate.getDate() + numberOfDaysToAdd);
      coupon.expire_at = expireDate;
      coupon.expireAfterSeconds = 0;
      await coupon.save();
      transaction.discountAmount = course.couponAmount;
    }
    transaction.enrollmentId = enrollment._id;
    await transaction.save();
    //getting the required classes from batch and adding to student enrollment
    {
      const sortedBatchClasses = await sortClassesByDate(batchDB.classes);

      const sortedEnrollmentClasses = await sortClassesByDate(enrollment.classes);

      const lastClassDate = sortedEnrollmentClasses[sortedEnrollmentClasses.length - 1].date;

      let indexOfFirstBatchClass = 0;
      sortedBatchClasses.find((c, i) => {
        if (c.date.toString() === lastClassDate.toString()) {
          indexOfFirstBatchClass = i + 1;
        }
      });
      for (let i = indexOfFirstBatchClass; i < batchDB.numClasses; i++) {
        const classObj = sortedBatchClasses[i];
        enrollment.classes.push(classObj._id);
      }
      enrollment.freezeLimit =
        Number.isInteger(enrollment.freezeLimit) && Number.isInteger(batchDB.classFreezeLimit)
          ? enrollment.freezeLimit + batchDB.classFreezeLimit
          : 0;
      await enrollment.save();
    }

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
        },
      },
    });
  } else {
    res.status(400);
    throw new Error('Batch renew enrollmnet failed');
  }
});

//@desc get enrolled courses for studens
//@route POST /api/enrollments/getEnrolledCourses
//@access Private
module.exports.getEnrolledCourses = asyncHandler(async (req, res) => {
	
  const { enrollments } = req.body;

  const enrrollmentsDb = await Enrollment.find({ _id: { $in: [...enrollments] } })
    .populate({
      path: 'classes',
      model: 'Class',
    })
    .populate({
      path: 'batch',
      model: 'Batch',
      populate: {
        path: 'instructors',
        model: 'Instructor',
        select: 'userId remunerationType',
        populate: {
          path: 'userId',
          model: 'User',
          select: '-password -isAdmin',
        },
      },
    })
    .populate({
      path: 'batch',
      model: 'Batch',
      populate: {
        path: 'center',
        model: 'Center',
        select: 'centerName address',
      },
    })
    .populate({
      path: 'batch',
      model: 'Batch',
      populate: {
        path: 'classes',
        model: 'Class',
      },
    })
    .populate('course', 'courseName galleryVideos')
    .populate({
      path: 'course',
      model: 'Course',
      select: 'courseName galleryVideos',
      populate: {
        path: 'galleryVideos',
        model: 'GalleryVideo',
      },
    });

  if (enrrollmentsDb) {
  	
    const attendances = [];
    {
      //calculating the attendance percentage
      await Promise.all(
        enrrollmentsDb.map(async (data) => {
          const numPresentClassesDB = await Attendance.countDocuments({
            student: data.student,
            attendanceStatus: ATTENDANCE_PRESENT,
          });
          const attendancePercentage = Math.floor((numPresentClassesDB / data.classes.length) * 100);
          const attendanceObj = {
            enrollmentId: data._id,
            batchId: data.batch._id,
            numClasses: data.classes.length,
            numPresentClasses: numPresentClassesDB,
            attendancePercentage,
          };
          attendances.push(attendanceObj);
        })
      );
    }
    res.status(200).json({ status: 'success', enrolledCourses: enrrollmentsDb, attendances });
  } else {
    res.status(400);
    throw new Error('Enrolled courses not found');
  }
});

//@desc Create payment for razorpay
//@route POST /api/payments
//@access Private
module.exports.createPayment = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  try {
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: Number(amount * 100),
      currency: 'INR',
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).send('Could not connect to Razorpay, please try again');
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

//@desc get all transactions
//@route POST /api/enrollments/transactions/all
//@access Private/Admin
module.exports.getAllPaymentsAdmin = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({})
    .populate({
      path: 'enrollmentId',
      model: 'Enrollment',
      populate: {
        path: 'student',
        model: 'Student',
        select: 'userId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'firstName',
        },
      },
    })
    .populate({
      path: 'enrollmentId',
      model: 'Enrollment',
      populate: {
        path: 'batch',
        model: 'Batch',
        select: 'fees',
      },
    });

  if (transactions.length > 0) {
    res.status(200).json({ status: 'success', transactions });
  } else {
    res.status(400);
    throw new Error('No transactions found');
  }
});

//@desc Enroll student Demo
//@route POST /api/enrollments/enrollStudentDemo
//@access Private
module.exports.enrollStudentDemo = asyncHandler(async (req, res) => {
  const { batch, studentId, classId } = req.body;

  const batchDB = await Batch.findById(batch);
  const studentUser = await Student.findById(studentId);

  const enrollment = await Enrollment.create({
    batch,
    studentId,
    classes: [classId],
    isDemo: true,
  });
  if (enrollment) {
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
  }
});



//@desc delete an enrollment
//@route DELETE /api/enrollments/?id=
//@access private/Admin
module.exports.deleteAnEnrollment = asyncHandler(async (req, res) => {
	
  const enrollment = await Enrollment.findById(req.query.id);
  
  if (enrollment) {
    await enrollment.remove();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Enrollment not found');
  }
});

