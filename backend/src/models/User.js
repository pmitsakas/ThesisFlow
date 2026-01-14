const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must not exceed 50 characters']
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true,
    minlength: [2, 'Surname must be at least 2 characters'],
    maxlength: [50, 'Surname must not exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['admin', 'student', 'teacher'],
      message: 'Role must be either admin, student, or teacher'
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  studentProfile: {
    interests: {
      type: [String],
      default: []
    },
    preferredTopics: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    programmingLanguages: {
      type: [String],
      default: []
    },
    careerGoals: {
      type: String,
      default: ''
    },
    previousExperience: {
      type: String,
      default: ''
    },
    researchMethodology: {
      type: String,
      enum: ['theoretical', 'practical', 'mixed', ''],
      default: ''
    },
    weeklyHours: {
      type: Number,
      min: 0,
      max: 40,
      default: 10
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', ''],
      default: ''
    },
    coreCoursesFavorites: {
      type: [String],
      default: []
    },
    advancedTopicsInterest: {
      type: [String],
      default: []
    },
    researchAreas: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


userSchema.index({ role: 1 });
userSchema.index({ is_active: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};




userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    surname: this.surname,
    email: this.email,
    role: this.role,
    is_active: this.is_active,
    created_at: this.created_at,
    updated_at: this.updated_at,
    studentProfile: this.studentProfile
  };
};

userSchema.statics.findActiveTeachers = function () {
  return this.find({ role: 'teacher', is_active: true });
};

userSchema.statics.findActiveByRole = function (role) {
  return this.find({ role, is_active: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User;