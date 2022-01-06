const mongoose = require('mongoose');

const galleryVideoSchema = mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    isByAdmin: {
      type: Boolean,
      default: false,
    },
    videoTitle: {
      type: String,
      required: true,
    },
    videoURL: {
      type: String,
      required: true,
    },
    videoThumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const GalleryVideo = mongoose.model('GalleryVideo', galleryVideoSchema);

module.exports = { GalleryVideo };
