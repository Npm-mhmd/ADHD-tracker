const express = require('express');
const { body, param, query } = require('express-validator');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const OBSERVATION_CATEGORIES = ['Focus', 'Physical Energy', 'Impulsivity', 'Stress'];

// Log a new observation (teacher only)
router.post(
  '/log',
  auth,
  authorize('teacher'),
  validate([
    body('studentId').isString().trim().notEmpty().withMessage('Student ID is required'),
    body('category').isIn(OBSERVATION_CATEGORIES).withMessage('Invalid category'),
    body('intensity').isInt({ min: 1, max: 5 }).withMessage('Intensity must be between 1 and 5').toInt(),
    body('note').optional().isString().trim().isLength({ max: 1000 }),
  ]),
  async (req, res) => {
    try {
      const { studentId, category, intensity, note } = req.body;

      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const classData = await Class.findOne({
        _id: student.classId,
        teacherId: req.user._id,
      });

      if (!classData) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const observation = {
        category,
        intensity,
        note: note || '',
        timestamp: new Date(),
      };

      student.observations.push(observation);
      await student.save();

      res.status(201).json({
        message: 'Observation logged successfully',
        observation,
      });
    } catch (error) {
      console.error('Log observation error:', error);
      res.status(500).json({ message: 'Server error logging observation' });
    }
  }
);

// Get observations for a student (parent view)
router.get(
  '/parent/child/:studentId',
  auth,
  authorize('parent'),
  validate([param('studentId').isString().trim().notEmpty()]),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      if (req.user.linkedStudentId !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

    // Sort observations by timestamp (newest first)
    const sortedObservations = [...student.observations].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Calculate averages for each category
    const categories = ['Focus', 'Physical Energy', 'Impulsivity', 'Stress'];
    const averages = {};

    categories.forEach(category => {
      const categoryObservations = student.observations.filter(
        obs => obs.category === category
      );

      if (categoryObservations.length > 0) {
        const sum = categoryObservations.reduce(
          (acc, obs) => acc + obs.intensity, 0
        );
        averages[category] = (sum / categoryObservations.length).toFixed(1);
      } else {
        averages[category] = 0;
      }
    });

    // Get observations grouped by date for the chart
    const observationsByDate = {};
    student.observations.forEach(obs => {
      const dateKey = new Date(obs.timestamp).toISOString().split('T')[0];

      if (!observationsByDate[dateKey]) {
        observationsByDate[dateKey] = {
          Focus: [],
          Stress: []
        };
      }

      if (obs.category === 'Focus' || obs.category === 'Stress') {
        observationsByDate[dateKey][obs.category].push(obs.intensity);
      }
    });

    // Calculate daily averages for Focus and Stress
    const dailyAverages = Object.keys(observationsByDate)
      .sort()
      .map(date => {
        const focusData = observationsByDate[date].Focus;
        const stressData = observationsByDate[date].Stress;

        const focusAvg = focusData.length > 0 
          ? (focusData.reduce((a, b) => a + b, 0) / focusData.length).toFixed(1)
          : 0;

        const stressAvg = stressData.length > 0 
          ? (stressData.reduce((a, b) => a + b, 0) / stressData.length).toFixed(1)
          : 0;

        return {
          date,
          focus: parseFloat(focusAvg),
          stress: parseFloat(stressAvg)
        };
      });

    res.json({
      student: {
        studentId: student.studentId,
        name: student.decryptName()
      },
      observations: sortedObservations,
      averages,
      dailyAverages
    });
  } catch (error) {
    console.error('Get observations error:', error);
    res.status(500).json({ message: 'Server error fetching observations' });
  }
});

// Get recent observations for a student (teacher view)
router.get(
  '/student/:studentId/recent',
  auth,
  authorize('teacher'),
  validate([
    param('studentId').isString().trim().notEmpty(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ]),
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const limit = req.query.limit || 10;

      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const classData = await Class.findOne({
        _id: student.classId,
        teacherId: req.user._id,
      });

      if (!classData) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const recentObservations = [...student.observations]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      res.json({
        student: {
          studentId: student.studentId,
          name: student.decryptName(),
        },
        observations: recentObservations,
      });
    } catch (error) {
      console.error('Get recent observations error:', error);
      res.status(500).json({ message: 'Server error fetching observations' });
    }
  }
);

module.exports = router;
