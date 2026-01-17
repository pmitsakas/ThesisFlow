const mongoose = require('mongoose');

const dissertationSchema = new mongoose.Schema({
  track: {
    type: String,
    required: [true, 'Track is required'],
    trim: true,
    enum: {
      values: [
        'Computer Science',
        'Software Engineering',
        'Data Science',
        'Artificial Intelligence',
        'Cybersecurity',
        'Information Systems',
        'Computer Networks',
        'Human-Computer Interaction'
      ],
      message: 'Please select a valid track'
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title must not exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [3000, 'Description must not exceed 3000 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: [
        'available',
        'pending_approval',
        'assigned',
        'completed',
        'canceled',
        'paused'
      ],
      message: 'Invalid status value'
    },
    default: 'available'
  },
  progress_percentage: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    validate: {
      validator: Number.isInteger,
      message: 'Progress must be an integer'
    }
  },
  date_created: {
    type: Date,
    default: Date.now
  },
  date_started: {
    type: Date,
    default: null
  },
  deadline: {
    type: Date,
    default: null
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Supervisor is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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

// Indexes for performance and uniqueness
dissertationSchema.index({ supervisorId: 1 });
dissertationSchema.index({ studentId: 1 });
dissertationSchema.index({ status: 1 });
dissertationSchema.index({ track: 1 });
dissertationSchema.index({ deadline: 1 });

dissertationSchema.index(
  { studentId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'assigned',
      studentId: { $ne: null }
    }
  }
);

dissertationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'assigned' && !this.date_started) {
    this.date_started = new Date();
  }

  if (this.isModified('status') && this.status === 'completed') {
    this.progress_percentage = 100;
  }

  next();
});

dissertationSchema.pre('save', async function(next) {
  if (this.isModified('supervisorId')) {
    try {
      const User = mongoose.model('User');
      const supervisor = await User.findById(this.supervisorId);
      
      if (!supervisor) {
        return next(new Error('Supervisor not found'));
      }
      
      if (supervisor.role !== 'teacher') {
        return next(new Error('Supervisor must be a teacher'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});


dissertationSchema.pre('save', async function(next) {
  if (this.isModified('studentId') && this.studentId) {
    try {
      const User = mongoose.model('User');
      const student = await User.findById(this.studentId);
      
      if (!student) {
        return next(new Error('Student not found'));
      }
      
      if (student.role !== 'student') {
        return next(new Error('Assigned user must be a student'));
      }
      
      if (this.status === 'assigned') {
        const existingAssignment = await this.constructor.findOne({
          studentId: this.studentId,
          status: 'assigned',
          _id: { $ne: this._id }
        });
        
        if (existingAssignment) {
          return next(new Error('Student already has an assigned dissertation'));
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

dissertationSchema.methods.isValidStatusTransition = function(newStatus) {
  const currentStatus = this.status;
  
  const validTransitions = {
    'available': ['assigned', 'canceled', 'pending_approval'],
    'pending_approval': ['available', 'canceled'],
    'assigned': ['completed', 'paused', 'canceled'],
    'paused': ['assigned', 'completed', 'canceled'],
    'completed': [], 
    'canceled': [] 
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};


dissertationSchema.methods.assignToStudent = async function(studentId) {
  const User = mongoose.model('User');
  const student = await User.findById(studentId);
  
  if (!student || student.role !== 'student') {
    throw new Error('Invalid student');
  }
  
  const existingAssignment = await this.constructor.findOne({
    studentId: studentId,
    status: 'assigned'
  });
  
  if (existingAssignment) {
    throw new Error('Student already has an assigned dissertation');
  }
  
  this.studentId = studentId;
  this.status = 'assigned';
  this.date_started = new Date();
  
  return this.save();
};

dissertationSchema.statics.findAvailable = function() {
  return this.find({ status: 'available' })
    .populate('supervisorId', 'name surname email')
    .sort({ date_created: -1 });
};

dissertationSchema.statics.findBySupervisor = function(supervisorId) {
  return this.find({ supervisorId })
    .populate('studentId', 'name surname email')
    .sort({ date_created: -1 });
};

dissertationSchema.statics.findByStudent = function(studentId) {
  return this.findOne({ studentId, status: 'assigned' })
    .populate('supervisorId', 'name surname email');
};

dissertationSchema.statics.findApproachingDeadlines = function(daysThreshold = 14) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    status: 'assigned',
    deadline: {
      $lte: thresholdDate,
      $gte: new Date()
    }
  })
  .populate('studentId supervisorId', 'name surname email');
};

const Dissertation = mongoose.model('Dissertation', dissertationSchema);

module.exports = Dissertation;