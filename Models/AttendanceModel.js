const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    attendanceStatus: {
      type: String,
    },
    leaveAppliedOn: {
      type: String,
    },
    leaveIsApproved: {
      type: Boolean,
    },
    leaveRejectedOn: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = { Attendance };
