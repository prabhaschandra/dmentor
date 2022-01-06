const asyncHandler = require('express-async-handler');

const { Center } = require('../Models/CenterModel');

//@desc ADMIN - get all centers
//@route GET /api/centers/getAllCenters
//@access public/admin
module.exports.getAllCenters = asyncHandler(async (req, res) => {
  const centers = await Center.find({});
  if (centers.length > 0) {
    res.status(201);
    res.json({ status: 'success', centers });
  } else {
    res.status(401);
    throw new Error('No centers found');
  }
});

//@desc ADMIN - get all centers name
//@route GET /api/centers/getAllCentersNameAddress
//@access public/admin
module.exports.getAllCentersNameAddress = asyncHandler(async (req, res) => {
  const centers = await Center.find({}, 'centerName address');

  if (centers.length > 0) {
    res.status(201);
    res.json({ status: 'success', centers });
  } else {
    res.status(401);
    throw new Error('No centers found');
  }
});

//@desc get a centers
//@route GET /api/centers/?id=
//@access public/Admin
module.exports.getACenter = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.query.id)
    .populate({
      path: 'instructor',
      model: 'User',
      select: 'name',
    })
    .populate({
      path: 'course',
      model: 'Course',
      select: 'name',
    });

  if (center) {
    res.status(201);
    res.json({ status: 'success', center });
  } else {
    res.status(401);
    throw new Error('Center not found');
  }
});

//@desc delete a centers
//@route DELETE /api/centers/?id=
//@access public
module.exports.deleteACenter = asyncHandler(async (req, res) => {
  const center = await Center.findById(req.query.id);

  if (center) {
    await center.remove();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Center not found');
  }
});

//@desc ADMIN - add a center
//@route GET /api/centers/addACenter
//@access public/admin
module.exports.addACenter = asyncHandler(async (req, res) => {
  const { centerName, address } = req.body;

  const centerExists = await Center.findOne({ centerName });

  if (centerExists) {
    res.status(400);
    throw new Error('A center already exists with the same name');
  }

  const center = await Center.create({
    centerName,
    address,
  });
  if (center) {
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Center not found');
  }
});

//@desc ADMIN - update a center
//@route PUT /api/centers/?id=
//@access public/admin
module.exports.editACenter = asyncHandler(async (req, res) => {
  const { centerName, address } = req.body;

  const center = await Center.findById(req.query.id);

  if (center) {
    const centerExists = await Center.findOne({ centerName });
    if (center && centerExists && centerExists._id.toString() !== req.query.id) {
      res.status(400);
      throw new Error('A center already exists with the same name');
    }
    center.centerName = centerName || center.centerName;
    center.address = address || center.address;
    await center.save();
    res.status(201);
    res.json({ status: 'success' });
  } else {
    res.status(401);
    throw new Error('Center not found');
  }
});
