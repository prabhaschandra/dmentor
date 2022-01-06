const mongoose = require('mongoose');

const centerSchema = mongoose.Schema(
  {
    centerName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
      },
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Center = mongoose.model('Center', centerSchema);

module.exports = { Center };
