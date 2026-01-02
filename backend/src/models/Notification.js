const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: [
        'application_approved',
        'application_rejected',
        'dissertation_deleted',
        'dissertation_assigned',
        'comment_added',
        'progress_updated',
        'status_changed',
        'proposal_received',
        'proposal_approved',
        'proposal_rejected',
      ],
      message: 'Invalid notification type'
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title must not exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [500, 'Message must not exceed 500 characters']
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedModel: {
    type: String,
    enum: ['Dissertation', 'Application', 'Comment'],
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

notificationSchema.index({ userId: 1, isRead: 1, created_at: -1 });

notificationSchema.statics.createNotification = async function (data) {
  return this.create(data);
};

notificationSchema.statics.getUnreadByUser = function (userId) {
  return this.find({ userId, isRead: false })
    .sort({ created_at: -1 })
    .limit(50);
};

notificationSchema.statics.getAllByUser = function (userId, limit = 50) {
  return this.find({ userId })
    .sort({ created_at: -1 })
    .limit(limit);
};

notificationSchema.statics.markAsRead = async function (notificationId, userId) {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

notificationSchema.statics.clearAll = async function (userId) {
  return this.deleteMany({ userId });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;