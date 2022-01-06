const asyncHandler = require('express-async-handler');

const { User } = require('../Models/UserModel');
const { Center } = require('../Models/CenterModel');
const { Instructor } = require('../Models/InstructorModel');
const { Course } = require('../Models/CourseModel');
const { Batch } = require('../Models/BatchModel');
const { StudentReview } = require('../Models/StudentReviewModel');

// const { sendOtp, verifyOTP } = require('../Utility/otp');
const { addDataToLinkedModel } = require('../Utility/helpers');
const { generateToken } = require('../Utility/generateToken');

const { qrCode } = require('../Utility/qrCode');
const { Student } = require('../Models/StudentModel');
const { Attendance } = require('../Models/AttendanceModel');
const { Class } = require('../Models/ClassModel');

const {
  ATTENDANCE_PRESENT,
  ATTENDANCE_LEAVE_APPLIED,
  ATTENDANCE_LEAVE_APPROVED,
  ATTENDANCE_LEAVE_REJECTED,
} = require('../Utility/constants');

//@desc get All Instructors
//@route GET /api/users/instructors/getAll
//@access public/Admin
module.exports.getAllInstructors = asyncHandler(async (req, res) => {
  
  const instructors = await Instructor.find({}, 'userId centers courses batches')
    .populate({
      path: 'userId',
      model: 'User',
      select: 'firstName',
    })
    .populate({
      path: 'centers',
      model: 'Center',
      select: 'centerName',
    })
    .populate({
      path: 'courses',
      model: 'Course',
      select: 'courseName',
    })
    .populate({
      path: 'batches',
      model: 'Batch',
      select: 'batchName',
    });

  let instructorsArray = [];

  instructors.forEach((instructor) => {
    const centers = [];
    const courses = [];
    instructor.centers.forEach((center, i) => {
      i < 3 ? centers.push(center.centerName) : centers.push('');
    });
    instructor.courses.forEach((course, i) => {
      i < 3 ? courses.push(course.courseName) : courses.push('');
    });

    const obj = {
      _id: instructor._id,
      name: instructor.userId.firstName,
      center: centers.length > 3 ? `${centers.filter((c) => c !== '').join(', ')}...` : centers.join(', '),
      courses: courses.length > 3 ? `${courses.filter((c) => c !== '').join(', ')}...` : courses.join(', '),
      batches: instructor.batches.length,
    };
    instructorsArray.push(obj);
  });

  if (instructorsArray.length > 0) {
    res.status(201);
    res.json({ message: 'success', instructors: instructorsArray });
  } else {
    res.status(401);
    throw new Error('No instructors found');
  }
});


//@desc get All Instructors
//@route GET /api/users/instructors/getAll
//@access public
module.exports.getAllInstructorsName = asyncHandler(async (req, res) => {
  const instructors = await Instructor.find({}, 'userId').populate({
    path: 'userId',
    mode: 'User',
    select: 'firstName',
  });
  if (instructors.length > 0) {
    const filteredInstructors = [];
    instructors.length > 0 &&
      instructors.forEach((instructor) => {
        const instructorObj = {
          name: instructor.userId.firstName,
          _id: instructor._id,
        };
        filteredInstructors.push(instructorObj);
      });

    res.status(201);
    res.json({ message: 'success', instructors: filteredInstructors });
  } else {
    res.status(401);
    throw new Error('No instructors found');
  }
});

//@desc get All Instructors
//@route GET /api/users/instructors/getAll
//@access public
module.exports.getAllInstructorsNameByFilters = asyncHandler(async (req, res) => {
  const centers = req.body.centers;
  const course = req.body.course;
  const center = req.body.center;
  const courses = req.body.courses;

  let instructors = [];
  if (centers && centers.length > 0) {
    const instructorsAll = await Instructor.find({ centers: { $in: [...centers] } }, 'userId').populate({
      path: 'userId',
      mode: 'User',
      select: 'firstName',
    });
    instructors = [...instructorsAll];
  } else if (course) {
    const instructorsAll = await Instructor.find({ courses: { $in: course } }, 'userId').populate({
      path: 'userId',
      mode: 'User',
      select: 'firstName',
    });
    instructors = [...instructorsAll];
  } else {
    const instructorsAll = await Instructor.find(
      { $and: [{ centers: { $in: center } }, { courses: { $all: [...courses] } }] },
      'userId'
    ).populate({
      path: 'userId',
      mode: 'User',
      select: 'firstName',
    });
    instructors = [...instructorsAll];
  }

  // if (instructors.length > 0) {
  const filteredInstructors = [];
  instructors.length > 0 &&
    instructors.forEach((instructor) => {
      const instructorObj = {
        name: instructor.userId.firstName,
        _id: instructor._id,
      };
      filteredInstructors.push(instructorObj);
    });
  res.status(201);
  res.json({ message: 'success', instructors: filteredInstructors });
  // } else {
  //   res.status(401);
  //   throw new Error('No instructors found');
  // }
});

//@desc get an Instructors
//@route GER /api/users/instructors/getAll
//@access public
module.exports.getAnInstructor = asyncHandler(async (req, res) => {
	
  const instructor = await Instructor.findById(
    req.query.id,
    'userId remunerationType amount courses centers batches shortDescription longDescription'
  )
    .populate({
      path: 'userId',
      mode: 'User',
      select: 'firstName email phoneNumber dob address profilePic',
    })
    .populate({
      path: 'courses',
      mode: 'Course',
      select: 'courseName',
    })
    .populate({
      path: 'centers',
      mode: 'Center',
      select: 'centerName',
    })
    .populate({
      path: 'batches',
      mode: 'Batch',
      select: 'batchName',
    });

  if (instructor) {
    res.status(201);
    res.json({ message: 'success', instructor });
  } else {
    res.status(401);
    throw new Error('Instructor not found');
  }
});

//@desc Register instructor
//@route POST /api/users/instructors/add
//@access public/Admin
module.exports.uploadProfileImage = asyncHandler(async (req, res) => {
	
  if (req.file) {
    res.status(201);
    res.json({ message: 'success' });
  } else {
    res.status(300);
    throw new Error('Failed to upload image');
  }
});


//@desc Register instructor
//@route POST /api/users/instructors/add
//@access public/Admin
module.exports.registerInstructor = asyncHandler(async (req, res) => {
	
  const {
    name,
    remuneration,
    courses,
    profilePic,
    email,
    shortDescription,
    longDescription,
    password,
    centers,
    amount,
    batches,
    phoneNumber,
    address,
  } = req.body;

  const userExists = await User.findOne({ phoneNumber });
  const userExists1 = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('A User already exists with this phone number');
  }
  if (userExists1) {
    res.status(400);
    throw new Error('A User already exists with this email');
  }

  const user = await User.create({
    firstName: name,
    phoneNumber,
    email,
    profilePic,
    password,
    address,
    userType: 'instructor',
  });

  if (user) {
    //creating an instructor from instructor model
    const instructor = await Instructor.create({
      userId: user._id,
      remunerationType: remuneration,
      courses: [...courses],
      centers: [...centers],
      amount,
      shortDescription,
      longDescription,
      batches: batches.length > 0 ? [...batches] : [],
    });

    //adding instructor ref to User model
   // const [data, error] = await qrCode(instructor._id, user.firstName);
    //user.qrCode = data.path;
    //user.instructor = instructor._id;
    await user.save();

    try {
    	
      //adding instructors to center Model
      centers.length > 0 && (await addDataToLinkedModel(centers, Center, 'instructors', instructor._id));

      //adding instructors to course Model
      courses.length > 0 && (await addDataToLinkedModel(courses, Course, 'instructors', instructor._id));

      //adding instructors to batch Model
      batches.length > 0 && (await addDataToLinkedModel(batches, Batch, 'instructors', instructor._id));
    } catch (error) {
      res.status(400);
      throw new Error(error);
    } finally {
      res.status(201);
      res.json({ status: 'success', user });
    }

    //sending success response
  } else {
    res.status(401);
    throw new Error('Instructor could not be added, Please try again');
  }

});

//@desc Login instructor
//@route POST /api/users/instructors/login
//@access public/InstructorApp
module.exports.loginInstructor = asyncHandler(async (req, res) => {
	
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  
  const instructor = await Instructor.findById(user.instructor).populate({
    path: 'centers',
    model: 'Center',
    select: 'centerName Address',
  });

  if (!user) {
    res.status(401);
    throw new Error('No user found for this email');
  }
  if (user && (await user.matchPassword(password))) {
    res.status(200);
    res.json({
      status: 'success',
      instructor: {
        _id: user.instructor,
        name: user.firstName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePic: user.profilePic,
        centers: instructor.centers,
        address: user.address,
        token: generateToken(user.instructor),
      },
    });
  } else {
    res.status(401);
    throw new Error('Incorrect password');
  }
});

//@desc Get all courses by  instructor
//@route POST /api/users/instructors/getAllCourses
//@access public/InstructorApp
module.exports.getAllInstructorBatches = asyncHandler(async (req, res) => {
	
  const batches = await Batch.find({ instructors: { $in: req.user._id } }, 'courses batchName').populate({
    path: 'courses',
    model: 'Course',
    select: 'courseName',
  });

  if (batches.length > 0) {
    res.status(200);
    res.json({ status: 'success', batches });
  } else {
    res.status(401);
    throw new Error('No batches found');
  }
});


//@desc Get all batches by  instructor
//@route POST /api/users/instructors/getAllCourses
//@access public/InstructorApp
module.exports.getAllInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructors: { $in: req.user._id } }, 'courseName');

  if (courses.length > 0) {
    res.status(200);
    res.json({ status: 'success', courses });
  } else {
    res.status(401);
    throw new Error('No courses found');
  }
});

//@desc Get all batches within 30mins from current time
//@route POST /api/users/instructors/getAllBatchesWithin30Mins
//@access Private/InstructorApp
module.exports.getAllBatchesWith30Mins = asyncHandler(async (req, res) => {
	
  const batches = await Batch.find({ instructors: { $in: req.user._id } })
    .populate({
      path: 'classes',
      model: 'Class',
    })
    .populate({
      path: 'courses',
      model: 'Course',
      select: 'courseName',
    })
    .populate({
      path: 'center',
      model: 'Center',
      select: 'centerName address',
    })
    .populate({
      path: 'students',
      model: 'Student',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName profilePic',
      },
    });   

    
  if (batches) {
  	
    //filtering upcoming classes within 30mins
    var today = new Date() ; 
    
    today.timeZoneOffset = 330;    
    today.setDate(today.getDate() + 1);      
    
    var currentTime = `${today.getHours()}:${
      today.getMinutes().toString().length < 2 ? '0' : ''
    }${today.getMinutes()}`;   
    
    currentTime = today.toLocaleTimeString("en-US", {timeZone: "Asia/Kolkata", hour12: false  });
    
    var splitArray = currentTime.split(":");
    
    var currHours = splitArray[0];
    var currMinutes = splitArray[1];
    var currSeconds = splitArray[2];
    
      // const today = new Date();
    const newDateObj30MinsAdded = new Date(  (((currHours*60)+currMinutes) * 1000) + 30 * 60000);
    
    
    
    if(currHours.length == 1){
      currHours = '0'+currHours;      
    }
    
    if(currMinutes.length == 1){
      currMinutes = '0'+currMinutes;      
    }
    
    var hhMM = currHours+':'+currMinutes;
    
    currentTime = hhMM;
    
    var minutesOfDay = (parseInt(currHours)*60) + parseInt(currMinutes);
    

    var n = today.getTimezoneOffset();

    var time30MinsLater = `${newDateObj30MinsAdded.getHours()}:${
      newDateObj30MinsAdded.getMinutes().toString().length < 2 ? '0' : ''
    }${newDateObj30MinsAdded.getMinutes()}`;
    
    var totalMinutes30MinsLater = minutesOfDay + 30;
    var hour30MinsLater = (parseInt(totalMinutes30MinsLater/60));
    var minutes30MinsLater = (totalMinutes30MinsLater%60);
    
    if(hour30MinsLater.length == 1){
      hour30MinsLater = '0'+hour30MinsLater;      
    }
    
    if(minutes30MinsLater.length == 1){
      minutes30MinsLater = '0'+minutes30MinsLater;      
    }
    
    time30MinsLater = hour30MinsLater + ':' + minutes30MinsLater;
    

    let filteredBatches = [];
    
    batches.forEach((batch) => {
    	
      
      let classDate;

      for(var i=0;i<batch.classes.length;i++){       
           
        if(batch.classes[i].date ==today.toJSON().substr(0, 10) ){
          classDate = batch.classes[i].date;
        }
      }    

      
      if (classDate && batch.startTime >= currentTime && batch.startTime <= time30MinsLater) {
        filteredBatches.push(batch);
      }
    });
    
    res.status(200);
    res.json({ status: 'success', batches: filteredBatches, currentTime,time30MinsLater   });
  } else {
    res.status(401);
    throw new Error('No classes found');
  }
});

//@desc Get all courses by  instructor
//@route POST /api/users/instructors/getAllAttendances
//@access public/InstructorApp
module.exports.getAllAttendances = asyncHandler(async (req, res) => {

  const attendances = await Attendance.find({ instructor: req.user._id })
  
    .populate({
      path: 'instructor',
      model: 'Instructor',
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

//@desc Get all courses by  instructor
//@route POST /api/users/instructors/getAllCourses
//@access public/InstructorApp
module.exports.markAttendanceStudemt = asyncHandler(async (req, res) => {
	
  const { classId, studentId } = req.body;
  const student = await Student.findById(studentId);
  

  const attendance = await Attendance.create({
    class: classId,
    student: student._id,
    attendanceStatus: ATTENDANCE_PRESENT,
  });

  if (attendance) {
    student.attendances.push(attendance._id);
    await student.save();
    res.status(200);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Failed to mark attendance, Please try again');
  }
});

//@desc Get all courses by  instructor
//@route POST /api/users/instructors/getAllCourses
//@access public/InstructorApp
module.exports.markAttendanceInstructor = asyncHandler(async (req, res) => {
	
  const { classId } = req.body;
  const instructor = await Instructor.findById(req.user._id);

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

//@desc Apply for leave
//@route POST /api/users/instructors/applyLeave
//@access Private/InstructorApp
module.exports.applyForLeave = asyncHandler(async (req, res) => {
  const { classId, time } = req.body;
  const instructor = await Instructor.findById(req.user._id);
  const classObj = await Class.findById(classId);
  const currentTime = new Date(time);
  const batchStartTime = new Date(classObj.date);
  batchStartTime.setHours(classObj.startTime.split(':')[0]);
  batchStartTime.setMinutes(classObj.startTime.split(':')[1]);

  const hrsDifference = Math.floor(Math.abs(currentTime - batchStartTime) / 36e5);

  if (hrsDifference < 12) {
    res.status(401);
    throw new Error('You should apply for a leave atleast 12hrs prior to the scheduled class');
  }
  const attendance = await Attendance.create({
    class: classId,
    instructor: instructor._id,
    attendanceStatus: ATTENDANCE_LEAVE_APPLIED,
    leaveAppliedOn: new Date().toJSON().substring(0, 10),
    leaveIsApproved: false,
  });

  if (attendance) {
    instructor.attendances.push(attendance._id);
    await instructor.save();
    res.status(200);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Failed to apply for leave, Please try again');
  }
});

//@desc Edit Instructor
//@route PUT /api/users/instructors/edit?id=
//@access public/Admin
module.exports.editInstructor = asyncHandler(async (req, res) => {
	
  const {
    name,
    remuneration,
    courses,
    email,
    shortDescription,
    longDescription,
    profilePic,
    password,
    centers,
    amount,
    batches,
    phoneNumber,
    address,
  } = req.body;

  const instructor = await Instructor.findById(req.query.id);

  if (instructor) {
    const user = await User.findById(instructor.userId);
    //checking for duplicate phoneNumber and email
    {
      const userExists = await User.findOne({ phoneNumber });
      const userExists1 = await User.findOne({ email });

      if (userExists && userExists._id.toString() !== instructor.userId.toString()) {
        res.status(400);
        throw new Error('A User already exists with this phone number');
      }
      if (userExists1 && userExists1._id.toString() !== instructor.userId.toString()) {
        res.status(400);
        throw new Error('A User already exists with this email');
      }
    }
    
    user.firstName = name || user.name;
    user.profilePic = profilePic || user.profilePic;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.email = email || user.email;
    
    if (password) {
      user.password = password;
    }
    user.address = address || user.address;

    instructor.remunerationType = remuneration || instructor.remunerationType;
    instructor.amount = amount || instructor.amount;
    instructor.shortDescription = shortDescription || instructor.shortDescription;
    instructor.longDescription = longDescription || instructor.longDescription;

    //checking if the courses received is alredy present in the instructor if not then adding it
    if (courses.length > 0) {
      instructor.courses = courses;
    }

    if (centers.length > 0) {
      instructor.centers = centers;
    }

    if (batches.length > 0) {
      instructor.batches = batches;
    }
    await user.save();
    await instructor.save();

    //adding instructors to center Model
    centers.length > 0 && (await addDataToLinkedModel(centers, Center, 'instructors', instructor._id));

    //adding instructors to course Model
    courses.length > 0 && (await addDataToLinkedModel(courses, Course, 'instructors', instructor._id));

    //adding instructors to batch Model
    batches.length > 0 && (await addDataToLinkedModel(batches, Batch, 'instructors', instructor._id));

    //sending success resonse
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('User registration failed, Please try again');
  }
});

//@desc delete instructor
//@route DELETE /api/users/instructors/?id=
//@access public
module.exports.deleteInstructor = asyncHandler(async (req, res) => {
  const instructor = await Instructor.findById(req.query.id);
  if (instructor) {
    const user = await User.findById(instructor.userId);
    await instructor.remove();
    await user.remove();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Instructor not found');
  }
});

//@desc get all leave request for instructor
//@route DELETE /api/users/instructors/?id=
//@access Private/Admin
module.exports.getAllLeaveRequest = asyncHandler(async (req, res) => {
  const leaveRequests = await Attendance.find({
    instructor: { $exists: true },
    leaveAppliedOn: { $exists: true },
  })
    .populate({
      path: 'instructor',
      model: 'Instructor',
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
  if (leaveRequests) {
    res.status(201);
    res.json({ status: 'success', leaveRequests });
  } else {
    res.status(401);
    throw new Error('No requests found');
  }
});

//@desc update leave request
//@route DELETE /api/users/instructors/?id=
//@access Private/Admin
module.exports.updateLeaveRequest = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const leaveRequest = await Attendance.findById(req.query.id);
  if (leaveRequest) {
    leaveRequest.leaveIsApproved = isApproved;
    leaveRequest.attendanceStatus =
      isApproved === true ? ATTENDANCE_LEAVE_APPROVED : ATTENDANCE_LEAVE_REJECTED;
    if (isApproved) {
      leaveRequest.leaveAppliedOn = new Date().toJSON().substring(0, 10);
    } else {
      leaveRequest.leaveRejectedOn = new Date().toJSON().substring(0, 10);
    }
    await leaveRequest.save();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Leave request not found');
  }
});

//@desc Add student review/assessment
//@route POST /api/users/instructors/addStudentAssessment
//@access private/InstructorApp
module.exports.addStudentAssessment = asyncHandler(async (req, res) => {
  const {
    student,
    batch,
    category,
    level,
    strength,
    flexibility,
    stamina,
    graspingPower,
    concentration,
    memoryPower,
    musicality,
    expression,
    choreographyExecution,
    energyLevel,
    punctuality,
    regularity,
    discipline,
  } = req.body;

  const addStudentAssessment = await StudentReview.create({
    instructor: req.user._id,
    student,
    batch,
    category,
    level,
    strength,
    flexibility,
    stamina,
    graspingPower,
    concentration,
    memoryPower,
    musicality,
    expression,
    choreographyExecution,
    energyLevel,
    punctuality,
    regularity,
    discipline,
  });

  if (addStudentAssessment) {
    const studentDB = await Student.findById(student);
    studentDB.reviews.push(addStudentAssessment._id);
    await studentDB.save();
    res.status(200);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Failed to submit assessment, Please try again');
  }
});
