const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  linkedStudentId: user.linkedStudentId,
});

module.exports = { generateToken, serializeUser };
