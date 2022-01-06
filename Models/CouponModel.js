const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
  {
    couponCode: {
      type: String,
    },
    couponAmount: {
      type: Number,
      default: 0,
    },
    isApplied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = { Coupon };
