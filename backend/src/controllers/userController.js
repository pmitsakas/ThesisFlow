const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    
    const users = await User.find(filter).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => user.toPublicJSON())
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching users'
      }
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid user ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching user'
      }
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, surname, email, password, role } = req.body;

    if (!name || !surname || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Please provide all required fields: name, surname, email, password, role'
        }
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'A user with this email already exists'
        }
      });
    }

    const userData = {
      name,
      surname,
      email,
      password,
      role,
      is_active: true
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Create user error:', error);

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
        message: 'An error occurred while creating user'
      }
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'A user with this email already exists'
          }
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (surname) user.surname = surname;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Update user error:', error);

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

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid user ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating user'
      }
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid user ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting user'
      }
    });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    user.is_active = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: user.toPublicJSON(),
      message: 'User activated successfully'
    });

  } catch (error) {
    console.error('Activate user error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid user ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while activating user'
      }
    });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    user.is_active = false;
    await user.save();

    res.status(200).json({
      success: true,
      data: user.toPublicJSON(),
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid user ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deactivating user'
      }
    });
  }
};

exports.getActiveTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher',
      is_active: true
    }).select('name surname email');

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });

  } catch (error) {
    console.error('Get active teachers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching teachers'
      }
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching profile'
      }
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { studentProfile } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    if (studentProfile) {
      user.studentProfile = {
        interests: studentProfile.interests || [],
        preferredTopics: studentProfile.preferredTopics || [],
        skills: studentProfile.skills || [],
        programmingLanguages: studentProfile.programmingLanguages || [],
        careerGoals: studentProfile.careerGoals || '',
        previousExperience: studentProfile.previousExperience || '',
        researchMethodology: studentProfile.researchMethodology || '',
        weeklyHours: studentProfile.weeklyHours || 10,
        difficultyLevel: studentProfile.difficultyLevel || '',
        coreCoursesFavorites: studentProfile.coreCoursesFavorites || [],
        advancedTopicsInterest: studentProfile.advancedTopicsInterest || [],
        researchAreas: studentProfile.researchAreas || []
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.toPublicJSON(),
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update my profile error:', error);

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
        message: 'An error occurred while updating profile'
      }
    });
  }
};

exports.generateProposal = async (req, res) => {
  try {
    const { track } = req.body;

    if (!track) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TRACK',
          message: 'Track is required'
        }
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    if (!user.studentProfile) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PROFILE_INCOMPLETE',
          message: 'Please complete your student profile first'
        }
      });
    }

    const geminiService = require('../services/geminiService');
    const proposal = await geminiService.generateDissertationProposal(user.studentProfile, track);

    res.status(200).json({
      success: true,
      data: proposal.data
    });

  } catch (error) {
    console.error('Generate proposal error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'An error occurred while generating proposal'
      }
    });
  }
};