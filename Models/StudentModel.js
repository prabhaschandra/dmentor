const mongoose = require('mongoose');

// const bcrypt = require('bcryptjs');

const studentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isRegistrationFeePaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'Active',
    },
    registrationTransctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
    },
    enrollments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
      },
    ],
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
    attendances: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendance',
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentReview',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// studentSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// studentSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

const Student = mongoose.model('Student', studentSchema);

module.exports = { Student };
