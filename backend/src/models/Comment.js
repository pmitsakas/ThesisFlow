const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  dissertationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dissertation',
    required: [true, 'Dissertation ID is required']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must be at least 1 character'],
    maxlength: [1000, 'Comment must not exceed 1000 characters']
  },
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true 
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

commentSchema.index({ dissertationId: 1, created_at: -1 });
commentSchema.index({ userId: 1 });


commentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Dissertation = mongoose.model('Dissertation');
      const User = mongoose.model('User');
      
      const dissertation = await Dissertation.findById(this.dissertationId);
      const user = await User.findById(this.userId);
      
      if (!dissertation) {
        return next(new Error('Dissertation not found'));
      }
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      const isSupervisor = dissertation.supervisorId.toString() === this.userId.toString();
      const isStudent = dissertation.studentId && 
                       dissertation.studentId.toString() === this.userId.toString();
      
      if (!isSupervisor && !isStudent) {
        return next(new Error('Only the supervisor or assigned student can comment on this dissertation'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

commentSchema.statics.findByDissertation = function(dissertationId) {
  return this.find({ dissertationId })
    .populate('userId', 'name surname email role')
    .sort({ created_at: 1 }); 
};


commentSchema.statics.countByDissertation = function(dissertationId) {
  return this.countDocuments({ dissertationId });
};


commentSchema.statics.findRecentByUser = function(userId, limit = 10) {
  return this.find({ userId })
    .populate('dissertationId', 'title status')
    .sort({ created_at: -1 })
    .limit(limit);
};


commentSchema.methods.isAuthor = function(userId) {
  return this.userId.toString() === userId.toString();
};


commentSchema.virtual('formatted_date').get(function() {
  return this.created_at.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});


commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;