const mongoose = require('mongoose');

const batchSchema = mongoose.Schema(
  {
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    batchName: {
      type: String,
      required: true,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      required: true,
    },
    numClasses: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
    },
    startTime: {
      type: String,
    },
    classFreezeLimit: {
      type: Number,
    },
    endTime: {
      type: String,
    },
    batchDays: [{ type: String }],
    registrationFees: {
      type: Number,
      default: 0,
    },
    fees: {
      type: Number,
      default: 0,
    },
    maxStudents: {
      type: Number,
      default: 0,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    hasDemo: {
      type: Boolean,
      default: false,
    },
    instructorPenaltyPerAbsence: {
      type: Number,
      default: 0,
    },
    paymentToInstructor:{
    	type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Batch = mongoose.model('Batch', batchSchema);

module.exports = { Batch };
