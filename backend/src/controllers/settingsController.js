const SystemSettings = require('../models/SystemSettings');

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getAllSettings();

    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings.map(setting => setting.toDisplayJSON())
    });

  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching settings'
      }
    });
  }
};

exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await SystemSettings.findOne({ 
      setting_key: key.toUpperCase() 
    }).populate('updated_by', 'name surname email');

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SETTING_NOT_FOUND',
          message: 'Setting not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: setting.toDisplayJSON()
    });

  } catch (error) {
    console.error('Get setting by key error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching setting'
      }
    });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_VALUE',
          message: 'Setting value is required'
        }
      });
    }

    const userId = req.user.userId;

    const setting = await SystemSettings.setSetting(
      key,
      value,
      description,
      userId
    );

    const populatedSetting = await SystemSettings.findById(setting._id)
      .populate('updated_by', 'name surname email');

    res.status(200).json({
      success: true,
      data: populatedSetting.toDisplayJSON(),
      message: 'Setting updated successfully'
    });

  } catch (error) {
    console.error('Update setting error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating setting'
      }
    });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await SystemSettings.deleteSetting(key);

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SETTING_NOT_FOUND',
          message: 'Setting not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully'
    });

  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting setting'
      }
    });
  }
};

exports.getGlobalDeadline = async (req, res) => {
  try {
    const deadline = await SystemSettings.getGlobalDeadline();

    res.status(200).json({
      success: true,
      data: {
        deadline: deadline
      }
    });

  } catch (error) {
    console.error('Get global deadline error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching global deadline'
      }
    });
  }
};

exports.setGlobalDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DEADLINE',
          message: 'Deadline is required'
        }
      });
    }

    const userId = req.user.userId;

    const setting = await SystemSettings.setGlobalDeadline(deadline, userId);

    const populatedSetting = await SystemSettings.findById(setting._id)
      .populate('updated_by', 'name surname email');

    res.status(200).json({
      success: true,
      data: populatedSetting.toDisplayJSON(),
      message: 'Global deadline set successfully'
    });

  } catch (error) {
    console.error('Set global deadline error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while setting global deadline'
      }
    });
  }
};

exports.initializeDefaults = async (req, res) => {
  try {
    await SystemSettings.initializeDefaults();

    res.status(200).json({
      success: true,
      message: 'Default settings initialized successfully'
    });

  } catch (error) {
    console.error('Initialize defaults error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while initializing default settings'
      }
    });
  }
};