const mongoose = require('mongoose');

const studentReviewSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
    },
    category: {
      type: String,
    },
    level: {
      type: String,
    },
    strength: {
      type: Number,
    },
    flexibility: {
      type: Number,
    },
    stamina: {
      type: Number,
    },
    graspingPower: {
      type: Number,
    },
    concentration: {
      type: Number,
    },
    memoryPower: {
      type: Number,
    },
    musicality: {
      type: Number,
    },
    expression: {
      type: Number,
    },
    choreographyExecution: {
      type: Number,
    },
    energyLevel: {
      type: Number,
    },
    punctuality: {
      type: Number,
    },
    regularity: {
      type: Number,
    },
    discipline: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const StudentReview = mongoose.model('StudentReview', studentReviewSchema);

module.exports = { StudentReview };
