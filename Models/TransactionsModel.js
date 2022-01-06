const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
    },
    transactionType: {
      type: String,
      default: 'enroll',
    },
    transactionAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: 'false',
    },
    paymentDetails: {
      razorpayPaymentId: {
        type: String,
      },
      razorpayOrderId: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };
