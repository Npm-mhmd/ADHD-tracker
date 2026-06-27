const express = require('express');
const { body, param } = require('express-validator');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Create a new class (teacher only)
router.post(
  '/classes',
  auth,
  authorize('teacher'),
  validate([
    body('name').isString().trim().notEmpty().withMessage('Class name is required').isLength({ max: 100 }),
    body('school').isString().trim().notEmpty().withMessage('School is required').isLength({ max: 150 }),
    body('academicYear').isString().trim().notEmpty().withMessage('Academic year is required').isLength({ max: 20 }),
  ]),
  async (req, res) => {
    try {
      const { name, school, academicYear } = req.body;

      const newClass = new Class({
        name,
        teacherId: req.user._id,
        school,
        academicYear,
      });

      await newClass.save();

      res.status(201).json({
        message: 'Class created successfully',
        class: newClass,
      });
    } catch (error) {
      console.error('Create class error:', error);
      res.status(500).json({ message: 'Server error creating class' });
    }
  }
);

// Get all classes for the current teacher
router.get('/classes', auth, authorize('teacher'), async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error fetching classes' });
  }
});

// Add a student to a class
router.post(
  '/add',
  auth,
  authorize('teacher'),
  validate([
    body('classId').isMongoId().withMessage('A valid class ID is required'),
    body('name').isString().trim().notEmpty().withMessage('Student name is required').isLength({ max: 100 }),
    body('dateOfBirth').isISO8601().withMessage('A valid date of birth is required').toDate(),
  ]),
  async (req, res) => {
    try {
      const { classId, name, dateOfBirth } = req.body;

      const classData = await Class.findOne({ _id: classId, teacherId: req.user._id });
      if (!classData) {
        return res.status(403).json({ message: 'Class not found or access denied' });
      }

      const studentId = Student.generateStudentId();

      const student = new Student({
        studentId,
        encryptedName: '',
        classId,
        dateOfBirth,
      });

      student.encryptedName = student.encryptName(name);

      await student.save();

      res.status(201).json({
        message: 'Student added successfully',
        student: {
          id: student._id,
          studentId,
          name: student.decryptName(),
          classId: student.classId,
          dateOfBirth: student.dateOfBirth,
        },
      });
    } catch (error) {
      console.error('Add student error:', error);
      res.status(500).json({ message: 'Server error adding student' });
    }
  }
);

// Get all students for a specific class
router.get(
  '/:classId',
  auth,
  authorize('teacher'),
  validate([param('classId').isMongoId().withMessage('A valid class ID is required')]),
  async (req, res) => {
    try {
      const { classId } = req.params;

      const classData = await Class.findOne({ _id: classId, teacherId: req.user._id });
      if (!classData) {
        return res.status(403).json({ message: 'Class not found or access denied' });
      }

      const students = await Student.find({ classId }).sort({ createdAt: -1 });

      const decryptedStudents = students.map((student) => ({
        id: student._id,
        studentId: student.studentId,
        name: student.decryptName(),
        classId: student.classId,
        dateOfBirth: student.dateOfBirth,
        observationsCount: student.observations.length,
      }));

      res.json({ students: decryptedStudents });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ message: 'Server error fetching students' });
    }
  }
);

// Get a specific student by ID
router.get(
  '/student/:studentId',
  auth,
  validate([param('studentId').isString().trim().notEmpty()]),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await Student.findOne({ studentId }).populate('classId');

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      let isAuthorized = false;

      if (req.user.role === 'teacher') {
        const classData = await Class.findOne({
          _id: student.classId,
          teacherId: req.user._id,
        });
        isAuthorized = !!classData;
      } else if (req.user.role === 'parent') {
        isAuthorized = req.user.linkedStudentId === studentId;
      }

      if (!isAuthorized) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({
        student: {
          id: student._id,
          studentId: student.studentId,
          name: student.decryptName(),
          classId: student.classId,
          dateOfBirth: student.dateOfBirth,
          observations: student.observations,
        },
      });
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({ message: 'Server error fetching student' });
    }
  }
);

module.exports = router;
