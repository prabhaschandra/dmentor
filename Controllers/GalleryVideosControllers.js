const asyncHandler = require('express-async-handler');
const { Course } = require('../Models/CourseModel');

const { GalleryVideo } = require('../Models/GalleryVideoModel');
const { Instructor } = require('../Models/InstructorModel');

//@desc ADMIN - get all coupons
//@route GET /api/coupons/getAll
//@access public/admin
module.exports.getAllVideos = asyncHandler(async (req, res) => {
  const galleryVideos = await GalleryVideo.find({})
    .populate({
      path: 'course',
      model: 'Course',
      select: 'courseName',
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
    });

  if (galleryVideos.length > 0) {
    res.status(201);
    res.json({ status: 'success', galleryVideos });
  } else {
    res.status(400);
    throw new Error('No videos found');
  }
});

//@desc ADMIN - get all coupons
//@route GET /api/coupons/getAll
//@access public/admin
module.exports.getAllVideosByInstructor = asyncHandler(async (req, res) => {
  const galleryVideos = await GalleryVideo.find({ instructor: req.user._id })
    .populate({
      path: 'course',
      model: 'Course',
      select: 'courseName',
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
    });

  if (galleryVideos.length > 0) {
    res.status(201);
    res.json({ status: 'success', galleryVideos });
  } else {
    res.status(400);
    throw new Error('No videos found');
  }
});

//@desc ADMIN - create a coupon
//@route GET /api/coupons/add
//@access public/admin
module.exports.addAVideo = asyncHandler(async (req, res) => {
  const { instructor, course, videoTitle, videoURL } = req.body;

  const getThumbnail = (url, size) => {
    size = size === null ? 'big' : size;
    results = url.match('[\\?&]v=([^&#]*)');
    video = results === null ? url : results[1];

    if (size === 'small') {
      return 'https://img.youtube.com/vi/' + video + '/2.jpg';
    }
    return 'https://img.youtube.com/vi/' + video + '/0.jpg';
  };

  const videoThumbnail = getThumbnail(videoURL, 'big');

  const galleryVideo = await GalleryVideo.create({
    instructor: instructor ? instructor : null,
    course,
    videoTitle,
    videoURL,
    videoThumbnail,
    isByAdmin: !instructor,
  });

  if (galleryVideo) {
    //adding video to course Model
    const courseUpdate = await Course.findById(course, 'galleryVideos');
    if (
      courseUpdate &&
      !courseUpdate.galleryVideos.find((id) => id.toString() === galleryVideo._id.toString())
    ) {
      courseUpdate.galleryVideos.push(galleryVideo._id);
      await courseUpdate.save();
    }
    if (instructor) {
      const instructorUpdate = await Instructor.findById(instructor, 'galleryVideos');

      if (
        instructorUpdate &&
        !instructorUpdate.galleryVideos.find((id) => id.toString() === galleryVideo._id.toString())
      ) {
        instructorUpdate.galleryVideos.push(galleryVideo._id);
        await instructorUpdate.save();
      }
    }

    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(400);
    throw new Error('Video could not be added, Please try again');
  }
});

//@desc ADMIN - create a coupon
//@route GET /api/coupons/add
//@access public/admin
module.exports.editAVideo = asyncHandler(async (req, res) => {
  const { videoTitle, videoURL } = req.body;

  const getThumbnail = (url, size) => {
    size = size === null ? 'big' : size;
    results = url.match('[\\?&]v=([^&#]*)');
    video = results === null ? url : results[1];

    if (size === 'small') {
      return 'https://img.youtube.com/vi/' + video + '/2.jpg';
    }
    return 'https://img.youtube.com/vi/' + video + '/0.jpg';
  };

  const videoThumbnail = getThumbnail(videoURL, 'big');

  const galleryVideo = await GalleryVideo.findById(req.query.id);

  if (galleryVideo) {
    galleryVideo.videoTitle = videoTitle || galleryVideo.videoTitle;
    galleryVideo.videoURL = videoURL || galleryVideo.videoURL;
    galleryVideo.videoThumbnail = videoThumbnail || galleryVideo.videoThumbnail;
    await galleryVideo.save();

    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(400);
    throw new Error('Video not found');
  }
});

//@desc get a  video
//@route GET /api/galleryvideos/?id=
//@access Private/Admin
module.exports.getAVideo = asyncHandler(async (req, res) => {
  const galleryVideo = await GalleryVideo.findById(req.query.id);
  if (galleryVideo) {
    res.status(201);
    res.json({ status: 'success', galleryVideo });
  } else {
    res.status(400);
    throw new Error('Video not found');
  }
});

//@desc Delete video
//@route DELETE /api/galleryvideos/?id=
//@access Private/Admin
module.exports.deleteAVideo = asyncHandler(async (req, res) => {
  const galleryVideo = await GalleryVideo.findById(req.query.id);

  if (galleryVideo) {
    await galleryVideo.remove();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(400);
    throw new Error('Video not found');
  }
});
