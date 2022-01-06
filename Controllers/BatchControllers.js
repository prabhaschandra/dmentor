const asyncHandler = require('express-async-handler');

const { Batch } = require('../Models/BatchModel');
const { Center } = require('../Models/CenterModel');
const { Class } = require('../Models/ClassModel');
const { Course } = require('../Models/CourseModel');
const { Instructor } = require('../Models/InstructorModel');

const { addDataToLinkedModel, getBatchDates } = require('../Utility/helpers');

//@desc ADMIN - get all batches
//@route GET /api/batches/getAllBatches
//@access public/admin
module.exports.getAllBatches = asyncHandler(async (req, res) => {
	
  const batches = await Batch.find(
    {},
    'batchName center courses batchDays startTime endTime instructors students maxStudents'
  )
    .populate('center', 'centerName')
    .populate('courses', 'courseName')
    .populate({
      path: 'instructors',
      model: 'Instructor',
      select: 'userId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName',
      },
    });
  if (batches.length > 0) {
    let batchesArray = [];

    batches.forEach((batch) => {
      const courses = [];
      const instructors = [];
      batch.courses.forEach((course, i) => {
        i < 3 ? courses.push(course.courseName) : courses.push('');
      });
      batch.instructors.forEach((instructor, i) => {
        i < 3 ? instructors.push(instructor.userId.firstName) : instructors.push('');
      });
      const obj = {
        _id: batch._id,
        batchName: batch.batchName,
        center: batch.center ? batch.center.centerName : '',
        instructors:
          instructors.length > 3
            ? `${instructors.filter((i) => i !== '').join(', ')}...`
            : instructors.join(', '),
        courses: courses.length > 3 ? `${courses.filter((c) => c !== '').join(', ')}...` : courses.join(', '),
        startTime: batch.startTime,
        batchDays:
          batch.batchDays.length > 3
            ? `${batch.batchDays
                .filter((b, i) => {
                  if (i <= 2) return b;
                })
                .join(', ')}...`
            : batch.batchDays.join(', '),
        students: batch.students.length,
      };
      batchesArray.push(obj);
    });
    
    res.status(201);
    res.json({ status: 'success', batches: batchesArray });
  } else {
    res.status(401);
    throw new Error('No batches found');
  }
});


//@desc ADMIN - get all batches
//@route GET /api/batches/getAllBatches
//@access public/admin
module.exports.getAllName = asyncHandler(async (req, res) => {
  const batches = await Batch.find({}, 'batchName');

  if (batches.length > 0) {
    res.status(201);
    res.json({ status: 'success', batches });
  } else {
    res.status(401);
    throw new Error('No batches found');
  }
});


//@desc ADMIN - get all batches
//@route GET /api/batches/getAllBatches
//@access public/admin
module.exports.getAllNameByFilters = asyncHandler(async (req, res) => {
  const centers = req.body.centers;
  const batches = await Batch.find({ center: { $in: [...centers] } }, 'batchName');
  if (batches.length > 0) {
    res.status(201);
    res.json({ status: 'success', batches });
  } else {
    res.status(401);
    throw new Error('No batches found');
  }
});


//@desc Get all batches by course
//@route GET /api/batches/getAllBatchesByCourse
//@access public/admin
module.exports.getAllBatchesByCourse = asyncHandler(async (req, res) => {
  const batches = await Batch.find(
    { course: req.query.id },
    'name fees registrationFees numStudents center instructors isSuspended'
  )
    .populate({
      path: 'center',
      model: 'Center',
      select: 'name address',
    })
    .populate({
      path: 'instructors',
      model: 'User',
      select: 'name',
    });

  if (batches.length > 0) {
    res.status(201);
    res.json({ status: 'success', batches });
  } else {
    res.status(401);
    throw new Error('No batches found');
  }
});

//@desc Get all batches by course
//@route GET /api/batches/getAllBatchesByCourse
//@access public/admin
module.exports.getAllDemoBatchesByCenter = asyncHandler(async (req, res) => {
  const batches = await Batch.find(
    { center: req.query.id, isDemo: true },
    'center classes startTime endTime batchDays isDemo isSuspended batchName'
  )
    .populate({
      path: 'center',
      model: 'Center',
      select: 'name address',
    })
    .populate({
      path: 'classes',
      model: 'Class',
    });
  if (batches.length > 0) {
    res.status(201);
    res.json({ status: 'success', batches });
  } else {
    res.status(401);
    throw new Error('No batches found');
  }
});

//@desc get a batch by ID
//@route GET /api/batches/getABatch/?id=#########
//@access public
module.exports.getABatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.query.id)
    .populate({
      path: 'instructors',
      model: 'Instructor',
      select: 'userId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName',
      },
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
      path: 'classes',
      model: 'Class',
    })
    .populate({
      path: 'students',
      model: 'Student',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName profilePic gender',
      },
    })
    .populate({
      path: 'students',
      model: 'Student',
      populate: {
        path: 'reviews',
        model: 'StudentReview',
      },
    });

  if (batch) {
    res.status(201);
    res.json({ status: 'success', batch });
  } else {
    res.status(401);
    throw new Error('Batch not found');
  }
});

//@desc ADMIN - Add a Batch
//@route POST /api/batches/addBatch
//@access private/admin
module.exports.addBatch = asyncHandler(async (req, res) => {



  const {
    batchName,
    numClasses,
    instructors,
    startTime,
    endTime,
    courses,
    fees,
    registrationFees,
    occupancy,
    batchDays,
    classFreezeLimit,
    center,
    isDemo,
    hasDemo,
    instructorPenalty,
    paymentToInstructor,
    isSuspended,
  } = req.body;

  const batchExists = await Batch.findOne({ batchName });

  if (batchExists) {
    res.status(400);
    throw new Error('A batch already exists with the same name');
  }

  const getDayAsNumber = (day) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays.indexOf(day);
  };

  let sortedBatchDays = batchDays.map((day) => {
    return {
      day: day,
      num: getDayAsNumber(day),
    };
  });

  sortedBatchDays.sort((a, b) => (a.num > b.num ? 1 : b.num > a.num ? -1 : 0));

  batchDays1 = [...sortedBatchDays.map((d) => d.day)];

  const batch = await Batch.create({
    batchName,
    numClasses,
    instructors: [...instructors],
    startTime,
    endTime,
    classFreezeLimit,
    courses: [...courses],
    fees,
    registrationFees,
    maxStudents: occupancy,
    batchDays: [...batchDays1],
    center,
    isDemo,
    hasDemo,
    instructorPenaltyPerAbsence: instructorPenalty,
    paymentToInstructor,
    isSuspended,
  });
  
  if (batch) {
  	
    // Creating classes
    const batchDatesObj = await getBatchDates(batchDays1, numClasses);  
    
    var theBatchDates = batchDatesObj.batchDates;

    theBatchDates = theBatchDates.slice(0, numClasses);

    await Promise.all(
      theBatchDates.map(async (date) => {

        const classCreated = await Class.create({
          startTime,
          date,
          batch: batch._id,
        });
        batch.classes.push(classCreated._id);

      })
    );

    batch.startDate = batchDatesObj.batchStartDate;
    await batch.save();

    // adding batch to instructors Model
    instructors.length > 0 && (await addDataToLinkedModel(instructors, Instructor, 'batches', batch._id));

    // adding batch to instructors Model
    courses.length > 0 && (await addDataToLinkedModel(courses, Course, 'batches', batch._id));

    //adding batch to center Model
    const centerUpdate = await Center.findById(center, 'batches');
    if (!centerUpdate.batches.find((id) => id.toString() === batch._id.toString())) {
      centerUpdate.batches.push(batch._id);
      await centerUpdate.save();
    }

    //sending success response
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Batch could not be added, Please try again');
  }
});

//@desc ADMIN - Edit a Batch
//@route POST /api/batches/edit?=
//@access private/admin
module.exports.editABatch = asyncHandler(async (req, res) => {	
	
  const {
    batchName,
    numClasses,
    instructors,
    startTime,
    endTime,
    courses,
    fees,
    registrationFees,
    occupancy,
    classFreezeLimit,
    batchDays,
    center,
    isDemo,
    hasDemo,
    instructorPenalty,
    paymentToInstructor,
    isSuspended,
  } = req.body;

  const batch = await Batch.findById(req.query.id);
  if (batch) {
    //checking if batch name alredy exists
    const batchExists = await Batch.findOne({ batchName });
    if (batchExists && batchExists._id.toString() !== req.query.id.toString()) {
      res.status(400);
      throw new Error('A batch already exists with the same name');
    }

    batch.batchName = batchName || batch.batchName;
    batch.numClasses = numClasses || batch.numClasses;
    batch.classFreezeLimit = classFreezeLimit || batch.classFreezeLimit;
    batch.startTime = startTime || batch.startTime;
    batch.endTime = endTime || batch.endTime;
    batch.fees = fees || batch.fees;
    batch.registrationFees = registrationFees || batch.registrationFees;
    batch.maxStudents = occupancy || batch.maxStudents;
    batch.batchDays = batchDays && batchDays.length > 0 ? [...batchDays] : batch.batchDays;
    batch.center = center || batch.center;
    batch.isDemo = isDemo;
    batch.hasDemo = hasDemo;
    batch.paymentToInstructor = paymentToInstructor;
    batch.instructorPenaltyPerAbsence = instructorPenalty || batch.instructorPenaltyPerAbsence;
    batch.isSuspended = isSuspended;

    if (instructors && instructors.length > 0) {
      batch.instructors = instructors;
    }

    if (courses && courses.length > 0) {
      batch.courses = courses;
    }

    // adding batch to instructors Model
    instructors &&
      instructors.length > 0 &&
      (await addDataToLinkedModel(instructors, Instructor, 'batches', batch._id));

    // adding batch to instructors Model
    courses && courses.length > 0 && (await addDataToLinkedModel(courses, Course, 'batches', batch._id));

    //adding batch to center Model
    if (center) {
      const centerUpdate = await Center.findById(center, 'batches');
      if (!centerUpdate.batches.find((id) => id.toString() === batch._id.toString())) {
        centerUpdate.batches.push(batch._id);
        await centerUpdate.save();
      }
    }
    await batch.save();
    //sending success response
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Batch not found');
  }
});

//@desc delete a batch
//@route DELETE /api/bacthes/?id=
//@access private/Admin
module.exports.deleteABatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.query.id);
  if (batch) {
    await batch.remove();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Batch not found');
  }
});
