const asyncHandler = require('express-async-handler');

const { Coupon } = require('../Models/CouponModel');

//@desc ADMIN - get all coupons
//@route GET /api/coupons/getAll
//@access public/admin
module.exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});

  if (coupons.length > 0) {
    res.status(201);
    res.json({ status: 'success', coupons });
  } else {
    res.status(400);
    throw new Error('No coupons found');
  }
});

//@desc ADMIN - create a coupon
//@route GET /api/coupons/add
//@access public/admin
module.exports.addACoupon = asyncHandler(async (req, res) => {
  const { couponAmount } = req.body;

  //generate coupon code
  const generateRandomCode = async (prefix) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const couponCode = `${prefix}${randomNum}`;
    const couponCodeExists = await Coupon.findOne({ couponCode });
    if (couponCodeExists) {
      generateRandomNum(prefix);
    } else {
      return couponCode;
    }
  };

  const couponCode = await generateRandomCode('DM');

  const coupon = await Coupon.create({
    couponCode,
    couponAmount,
  });

  if (coupon) {
    res.status(201);
    res.json({ status: 'success', coupon });
  } else {
    res.status(400);
    throw new Error('Coupon could not be created, Please try again');
  }
});

//@desc ADMIN - mail the coupon code
//@route GET /api/coupons/mailCoupon
//@access public/admin
module.exports.mailCoupon = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const coupon = await Coupon.findById(req.query.id);

  if (coupon) {
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(400);
    throw new Error('Coupon not found');
  }
});

//@desc ADMIN - create a coupon
//@route GET /api/coupons/add
//@access public/admin
module.exports.deleteACoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ couponCode: req.query.couponCode });
  if (coupon) {
    await coupon.remove();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(400);
    throw new Error('Coupon not found');
  }
});

//@desc ADMIN - create a coupon
//@route GET /api/coupons/add
//@access public/admin
module.exports.verifyCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ couponCode: req.query.coupon });

  if (coupon) {
    if (coupon.isApplied) {
      res.status(400);
      throw new Error('This Coupon Code  has expired');
    }

    res.status(201);
    res.json({ status: 'success', coupon });
  } else {
    res.status(400);
    throw new Error(`This Coupon Code doesn't exist`);
  }
});
