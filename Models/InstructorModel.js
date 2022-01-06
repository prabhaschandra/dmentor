const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const instructorSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remunerationType: {
      type: String,
      default: 'perWeek',
    },
    amount: {
      type: Number,
      default: 0,
    },
    shortDescription: {
      type: String,
    },
    longDescription: {
      type: String,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    centers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
      },
    ],
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    galleryVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GalleryVideo',
      },
    ],
    attendances: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendance',
      },
    ],
  },
  {
    timestamps: true,
  }
);

instructorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

instructorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = { Instructor };
