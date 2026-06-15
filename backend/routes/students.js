const express = require('express');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create a new class (teacher only)
router.post('/classes', auth, authorize('teacher'), async (req, res) => {
  try {
    const { name, school, academicYear } = req.body;

    const newClass = new Class({
      name,
      teacherId: req.user._id,
      school,
      academicYear
    });

    await newClass.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error creating class' });
  }
});

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
router.post('/add', auth, authorize('teacher'), async (req, res) => {
  try {
    const { classId, name, dateOfBirth } = req.body;

    // Verify class belongs to the teacher
    const classData = await Class.findOne({ _id: classId, teacherId: req.user._id });
    if (!classData) {
      return res.status(403).json({ message: 'Class not found or access denied' });
    }

    // Generate unique student ID
    const studentId = Student.generateStudentId();

    // Create new student with encrypted name
    const student = new Student({
      studentId,
      encryptedName: '',
      classId,
      dateOfBirth
    });

    // Encrypt the student's name
    student.encryptedName = student.encryptName(name);

    await student.save();

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: student._id,
        studentId,
        name: student.decryptName(),
        classId: student.classId,
        dateOfBirth: student.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error adding student' });
  }
});

// Get all students for a specific class
router.get('/:classId', auth, authorize('teacher'), async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify class belongs to the teacher
    const classData = await Class.findOne({ _id: classId, teacherId: req.user._id });
    if (!classData) {
      return res.status(403).json({ message: 'Class not found or access denied' });
    }

    const students = await Student.find({ classId })
      .sort({ createdAt: -1 })
      .select('-encryptedName');

    // Decrypt student names for display
    const decryptedStudents = students.map(student => ({
      id: student._id,
      studentId: student.studentId,
      name: student.decryptName(),
      classId: student.classId,
      dateOfBirth: student.dateOfBirth,
      observationsCount: student.observations.length
    }));

    res.json({ students: decryptedStudents });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
});

// Get a specific student by ID
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId })
      .populate('classId');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the user is authorized to view this student
    // Teachers can only view students in their classes
    // Parents can only view their linked child
    let isAuthorized = false;

    if (req.user.role === 'teacher') {
      const classData = await Class.findOne({ 
        _id: student.classId, 
        teacherId: req.user._id 
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
        observations: student.observations
      }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error fetching student' });
  }
});

module.exports = router;
