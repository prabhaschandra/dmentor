const asyncHandler = require('express-async-handler');
const { Center } = require('../Models/CenterModel');

const { Course } = require('../Models/CourseModel');
const { Instructor } = require('../Models/InstructorModel');
const { addDataToLinkedModel } = require('../Utility/helpers');

//@desc ADMIN - get all Coursees
//@route GET /api/Coursees/getAllCoursees
//@access public/Admin
module.exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}, 'courseName centers instructors students batches')
    .populate({
      path: 'centers',
      model: 'Center',
      select: 'centerName',
    })
    .populate({
      path: 'instructors',
      model: 'Instructor',
      select: 'userid',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName',
      },
    });

  let coursesArray = [];

  courses.forEach((course) => {
    const centers = [];
    const instructors = [];
    course.centers.forEach((center, i) => {
      i < 3 ? centers.push(center.centerName) : centers.push('');
    });
    course.instructors.forEach((instructor, i) => {
      i < 3 ? instructors.push(instructor.userId.firstName) : instructors.push('');
    });

    const obj = {
      _id: course._id,
      courseName: course.courseName,
      centers: centers.length > 3 ? `${centers.filter((c) => c !== '').join(', ')}...` : centers.join(', '),
      instructors:
        instructors.length > 3
          ? `${instructors.filter((i) => i !== '').join(', ')}...`
          : instructors.join(', '),
      numStudents: course.students.length,
      numBatches: course.batches.length,
    };
    coursesArray.push(obj);
  });

  if (courses.length > 0) {
    res.status(201);
    res.json({ status: 'success', courses: coursesArray });
  } else {
    res.status(401);
    throw new Error('No Coursees found');
  }
});

//@desc  Get all Coursees by Center
//@route GET /api/Coursees/getAllCoursesByCenter
//@access public
module.exports.getAllCoursesByCenter = asyncHandler(async (req, res) => {
  const center = req.query.id;
  const courses = await Course.find({ centers: center }, 'courseName');

  if (courses.length > 0) {
    res.status(201);
    res.json({ status: 'success', courses });
  } else {
    res.status(401);
    throw new Error('No courses found');
  }
});

//@desc  Get all Coursees by Center
//@route GET /api/Coursees/getAllCoursesName
//@access public
module.exports.getAllCoursesName = asyncHandler(async (req, res) => {
  const courses = await Course.find({}, 'courseName');

  if (courses.length > 0) {
    res.status(201);
    res.json({ status: 'success', courses });
  } else {
    res.status(401);
    throw new Error('No courses found');
  }
});

//@desc Get a course by ID
//@route GET /api/Coursees/getACourse/?id=#########
//@access public
module.exports.getACourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.query.id)
    .populate({
      path: 'galleryVideos',
      model: 'GalleryVideo',
    })
    .populate({
      path: 'batches',
      model: 'Batch',
      populate: {
        path: 'center',
        model: 'Center',
        select: 'centerName address',
      },
    })
    .populate({
      path: 'batches',
      model: 'Batch',
      populate: {
        path: 'classes',
        model: 'Class',
      },
    })
    .populate({
      path: 'instructors',
      model: 'Instructor',
      populate: {
        path: 'userId',
        model: 'User',
      },
    })
    .populate({
      path: 'students',
      model: 'Student',
      select: 'userId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName',
      },
    })
    .populate({
      path: 'centers',
      model: 'Center',
      select: 'centerName address',
    });

  if (course) {
    res.status(201);
    res.json({ status: 'success', course });
  } else {
    res.status(401);
    throw new Error('Course not found');
  }
});

//@desc ADMIN - Add a Course
//@route POST /api/Coursees/addCourse
//@access private/admin
module.exports.addCourse = asyncHandler(async (req, res) => {
	
  const { courseName, courseDescription, centers, instructors } = req.body;

  const courseExists = await Course.findOne({ courseName });

  if (courseExists) {
    res.status(400);
    throw new Error('A Course already exists with the same name');
  }

  const course = await Course.create({
    courseName,
    courseDescription,
    instructors: instructors.length > 0 ? [...instructors] : [],
    centers: [...centers],
  });
  
  if (course) {
    // adding course Id ref to center Model
    centers.length > 0 && (await addDataToLinkedModel(centers, Center, 'courses', course._id));

    // adding course Id ref to instructor Model
    instructors &&
      instructors.length > 0 &&
      (await addDataToLinkedModel(instructors, Instructor, 'courses', course._id));

    //sending success response
    res.status(201);
    res.json({ message: 'success' });
    
  } else {
    res.status(401);
    throw new Error('Course could not be added, Please try again');
  }
});


//@desc ADMIN - Edit a Course
//@route POST /api/Coursees/edit?id=
//@access private/admin
module.exports.editACourse = asyncHandler(async (req, res) => {
	
  const { courseName, courseDescription, centers, instructors } = req.body;

  const course = await Course.findById(req.query.id);
  const courseExists = await Course.findOne({ courseName });

  if (course) {
    if (courseExists && courseExists._id.toString() !== req.query.id.toString()) {
      res.status(400);
      throw new Error('A Course already exists with the same name');
    }
    
    course.courseName = courseName || course.courseName;
    course.courseDescription = courseDescription || course.courseDescription;    
    
    if (instructors.length > 0) {
      course.instructors = instructors;
    }
    
    if (centers.length > 0) {
      course.centers = centers;
    }
    
    await course.save();

    // Adding course Id ref to center Model
    if (centers.length > 0) {
      await addDataToLinkedModel(centers, Center, 'courses', course._id);
    }

    // Adding course Id ref to instructor Model
    if (instructors.length > 0) {
      await addDataToLinkedModel(instructors, Instructor, 'courses', course._id);
    }

    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Course not found');
  }
});


//@desc delete a centers
//@route DELETE /api/centers/?id=
//@access public
module.exports.deleteACourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.query.id);

  if (course) {
    await course.remove();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Course not found');
  }
});
