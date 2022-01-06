const mongoose = require('mongoose');

const instructorPaymentRecordSchema = mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    paymentDate: {
      type: Date,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
    },      
    amount: {
      type: Number,
      default: false,
    },
    penaltyDeducted: {
      type: Number,
      default: 0,
    },    
    comments: {
      type: String,
    },       
  },
  {
    timestamps: true,
  }
);

const InstructorPaymentRecord = mongoose.model('InstructorPaymentRecord', instructorPaymentRecordSchema);

module.exports = { InstructorPaymentRecord };
