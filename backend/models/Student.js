const mongoose = require('mongoose');
const crypto = require('crypto');

const observationSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Focus', 'Physical Energy', 'Impulsivity', 'Stress'],
    required: true
  },
  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  encryptedName: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  observations: [observationSchema],
  dateOfBirth: {
    type: Date,
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate a unique student ID
studentSchema.statics.generateStudentId = function() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Encrypt student name before saving
studentSchema.methods.encryptName = function(name) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(name, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt student name
studentSchema.methods.decryptName = function() {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);

    const parts = this.encryptedName.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    return 'Encrypted Student';
  }
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
