const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { generateToken, serializeUser } = require('../utils/auth');

const router = express.Router();

const registerRules = [
  body('name').isString().trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').isString().trim().notEmpty().withMessage('Phone is required').isLength({ max: 30 }),
  body('password').isString().isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['teacher', 'parent']).withMessage('Role must be teacher or parent'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

// Register a new user
router.post('/register', validate(registerRules), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const user = new User({ name, email, phone, password, role });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', validate(loginRules), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

// Update profile (name / email / phone)
router.put(
  '/profile',
  auth,
  validate([
    body('name').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isString().trim().notEmpty().isLength({ max: 30 }),
  ]),
  async (req, res) => {
    try {
      const { name, email, phone } = req.body;

      if (email && email !== req.user.email) {
        const emailTaken = await User.findOne({ email, _id: { $ne: req.user._id } });
        if (emailTaken) {
          return res.status(409).json({ message: 'Email is already in use' });
        }
        req.user.email = email;
      }

      if (name !== undefined) req.user.name = name;
      if (phone !== undefined) req.user.phone = phone;

      await req.user.save();

      res.json({ message: 'Profile updated successfully', user: serializeUser(req.user) });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }
);

// Change password
router.put(
  '/change-password',
  auth,
  validate([
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    body('newPassword').isString().isLength({ min: 6, max: 128 }).withMessage('New password must be at least 6 characters'),
  ]),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error changing password' });
    }
  }
);

// Delete own account
router.delete('/account', auth, async (req, res) => {
  try {
    await User.deleteOne({ _id: req.user._id });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

// Link a parent to a student
router.put(
  '/link-student',
  auth,
  authorize('parent'),
  validate([body('studentId').isString().trim().notEmpty().withMessage('Student ID is required')]),
  async (req, res) => {
    try {
      const { studentId } = req.body;

      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      req.user.linkedStudentId = studentId;
      await req.user.save();

      res.json({ message: 'Student linked successfully', user: serializeUser(req.user) });
    } catch (error) {
      console.error('Link student error:', error);
      res.status(500).json({ message: 'Server error linking student' });
    }
  }
);

// Unlink a parent's student
router.put('/unlink-student', auth, authorize('parent'), async (req, res) => {
  try {
    req.user.linkedStudentId = null;
    await req.user.save();

    res.json({ message: 'Student unlinked successfully', user: serializeUser(req.user) });
  } catch (error) {
    console.error('Unlink student error:', error);
    res.status(500).json({ message: 'Server error unlinking student' });
  }
});

module.exports = router;
