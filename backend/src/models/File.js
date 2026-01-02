const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  dissertationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dissertation',
    required: [true, 'Dissertation ID is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader ID is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimetype: {
    type: String,
    required: [true, 'File type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must not exceed 500 characters']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

fileSchema.index({ dissertationId: 1, created_at: -1 });
fileSchema.index({ uploadedBy: 1 });

fileSchema.statics.findByDissertation = function(dissertationId) {
  return this.find({ dissertationId })
    .populate('uploadedBy', 'name surname role')
    .sort({ created_at: -1 });
};

fileSchema.methods.getFilePath = function() {
  return `uploads/dissertations/${this.dissertationId}/${this.filename}`;
};

const File = mongoose.model('File', fileSchema);

module.exports = File;