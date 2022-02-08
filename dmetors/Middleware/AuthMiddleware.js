const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../Models/UserModel');
const { Instructor } = require('../Models/InstructorModel');

module.exports.protectInstructor = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Instructor.findById(decoded.id).select('-password');
      if (req.user === null) {
        res.status(401);
        throw new Error('Not authorized');
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized');
  }
});

module.exports.protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Instructor.findById(decoded.id).select('-password');
      if (!req.user === null && !user.isAdmin === true) {
        res.status(401);
        throw new Error('Not authorized');
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized');
  }
});

module.exports.protectStudent = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Instructor.findById(decoded.id).select('-password');
      if (req.user === null) {
        res.status(401);
        throw new Error('Not authorized');
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized');
  }
});

// const admin = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//     next();
//   } else {
//     res.status(401);
//     throw new Error('Not authorized as Admin');
//   }
// };
