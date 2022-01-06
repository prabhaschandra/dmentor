const mongoose = require('mongoose');

const instructorPaymentSchema = mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    paymentDate: {
      type: String,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
    },
    theClass: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
    },     
    amount: {
      type: Number,
      default: false,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    }, 
    penaltyReason: {
      type: String,
    },
    lateByMinutes: {
      type: String,
    },       
  },
  {
    timestamps: true,
  }
);

const InstructorPayment = mongoose.model('InstructorPayment', instructorPaymentSchema);

module.exports = { InstructorPayment };
