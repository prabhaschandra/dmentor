const express = require('express');

// const { protect } = require('../Middleware/AuthMiddleware');
const router = express.Router();

const {
  addAVideo,
  getAllVideos,
  deleteAVideo,
  getAllVideosByInstructor,
  getAVideo,
  editAVideo,
} = require('../Controllers/GalleryVideosControllers');
const { protectInstructor } = require('../Middleware/AuthMiddleware');

router.get('/getAll', getAllVideos);
router.get('/', getAVideo);
router.get('/getAllByInstructors', protectInstructor, getAllVideosByInstructor);

router.post('/add', addAVideo);
router.put('/?', editAVideo);
router.delete('/?', deleteAVideo);
module.exports = router;
