const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  dissertationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dissertation',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByRole: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['custom', 'ΣΥΝΑΝΤΗΣΗ', 'ΠΑΡΟΥΣΙΑΣΗ_ΘΕΩΡΗΤΙΚΗΣ_ΜΕΛΕΤΗΣ', 'ΠΑΡΟΥΣΙΑΣΗ_ΠΛΑΝΟΥ_ΕΡΓΑΣΙΑΣ', 'MILESTONE', 'DEADLINE'],
    default: 'custom'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: null
  },
  description: {
    type: String,
    maxlength: 500,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'accepted'
  },
  reminderType: {
    type: String,
    enum: ['none', 'at_time', '10min', '30min', '1hour', '24hours'],
    default: 'none'
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

calendarEventSchema.index({ dissertationId: 1, date: 1 });
calendarEventSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);