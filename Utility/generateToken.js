const jwt = require('jsonwebtoken');

const generateToken = (id, time = '90d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: time,
  });
};
module.exports = { generateToken };
