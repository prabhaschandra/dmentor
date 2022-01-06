const express = require('express');

// const { protect } = require('../Middleware/AuthMiddleware');
const router = express.Router();

const {
  addACoupon,
  getAllCoupons,
  mailCoupon,
  deleteACoupon,
  verifyCoupon,
} = require('../Controllers/CouponControllers');

router.get('/getAll', getAllCoupons);
router.get('/verify?', verifyCoupon);

router.post('/add', addACoupon);
router.post('/mailCoupon', mailCoupon);
router.delete('/?', deleteACoupon);
// router.put('markApplied?', updatecoupon);
module.exports = router;
