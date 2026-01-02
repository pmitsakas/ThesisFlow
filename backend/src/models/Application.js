const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  dissertationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dissertation',
    required: [true, 'Dissertation ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message must not exceed 500 characters']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

applicationSchema.index({ dissertationId: 1, studentId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ dissertationId: 1, status: 1 });

applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const Dissertation = mongoose.model('Dissertation');
      
      const student = await User.findById(this.studentId);
      if (!student || student.role !== 'student') {
        return next(new Error('Invalid student'));
      }
      
      const assignedDissertation = await Dissertation.findOne({
        studentId: this.studentId,
        status: 'assigned'
      });
      
      if (assignedDissertation) {
        return next(new Error('Student already has an assigned dissertation'));
      }
      
      const dissertation = await Dissertation.findById(this.dissertationId);
      if (!dissertation) {
        return next(new Error('Dissertation not found'));
      }
      
      if (dissertation.status !== 'available') {
        return next(new Error('Dissertation is not available for applications'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

applicationSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId })
    .populate('dissertationId')
    .populate({
      path: 'dissertationId',
      populate: {
        path: 'supervisorId',
        select: 'name surname email'
      }
    })
    .sort({ created_at: -1 });
};

applicationSchema.statics.findByDissertation = function(dissertationId) {
  return this.find({ dissertationId })
    .populate('studentId', 'name surname email')
    .sort({ created_at: -1 });
};

applicationSchema.statics.findPendingByTeacher = function(teacherId) {
  return this.find({ status: 'pending' })
    .populate({
      path: 'dissertationId',
      match: { supervisorId: teacherId },
      populate: { path: 'supervisorId', select: 'name surname' }
    })
    .populate('studentId', 'name surname email')
    .sort({ created_at: -1 });
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;