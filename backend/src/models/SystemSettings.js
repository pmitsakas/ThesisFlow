const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  setting_key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  setting_value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Setting value is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must not exceed 500 characters']
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { updatedAt: 'updated_at' }
});


systemSettingsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

systemSettingsSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ setting_key: key.toUpperCase() });
  return setting ? setting.setting_value : null;
};

systemSettingsSchema.statics.setSetting = async function(key, value, description, updatedBy) {
  const setting = await this.findOneAndUpdate(
    { setting_key: key.toUpperCase() },
    {
      setting_value: value,
      description: description,
      updated_by: updatedBy,
      updated_at: new Date()
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );
  return setting;
};

systemSettingsSchema.statics.deleteSetting = async function(key) {
  return this.findOneAndDelete({ setting_key: key.toUpperCase() });
};

systemSettingsSchema.statics.getAllSettings = function() {
  return this.find().populate('updated_by', 'name surname email');
};

systemSettingsSchema.statics.getGlobalDeadline = async function() {
  return this.getSetting('GLOBAL_DISSERTATION_DEADLINE');
};

systemSettingsSchema.statics.setGlobalDeadline = async function(deadline, updatedBy) {
  return this.setSetting(
    'GLOBAL_DISSERTATION_DEADLINE',
    deadline,
    'Default deadline for all new dissertations',
    updatedBy
  );
};

systemSettingsSchema.statics.initializeDefaults = async function() {
  const defaults = [
    {
      setting_key: 'GLOBAL_DISSERTATION_DEADLINE',
      setting_value: null,
      description: 'Default deadline for all new dissertations'
    },
    {
      setting_key: 'DEADLINE_WARNING_DAYS',
      setting_value: 14,
      description: 'Number of days before deadline to show warning'
    },
    {
      setting_key: 'MAX_DISSERTATIONS_PER_TEACHER',
      setting_value: null,
      description: 'Maximum number of dissertations a teacher can supervise (null = unlimited)'
    },
    {
      setting_key: 'ALLOW_STUDENT_PROPOSALS',
      setting_value: true,
      description: 'Allow students to propose new dissertation topics'
    },
    {
      setting_key: 'AUTO_APPROVE_TEACHERS',
      setting_value: false,
      description: 'Automatically approve new teacher accounts'
    }
  ];

  for (const setting of defaults) {
    await this.findOneAndUpdate(
      { setting_key: setting.setting_key },
      setting,
      { upsert: true, new: true }
    );
  }

  console.log('Default system settings initialized');
};

systemSettingsSchema.methods.toDisplayJSON = function() {
  return {
    key: this.setting_key,
    value: this.setting_value,
    description: this.description,
    updated_at: this.updated_at,
    updated_by: this.updated_by
  };
};

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = SystemSettings;