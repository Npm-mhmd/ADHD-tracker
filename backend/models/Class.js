const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

classSchema.index({ teacherId: 1, createdAt: -1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
