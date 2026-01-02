const Dissertation = require('../models/Dissertation');
const User = require('../models/User');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

exports.getAllDissertations = async (req, res) => {
  try {
    const { status, track, supervisorId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (track) filter.track = track;
    if (supervisorId) filter.supervisorId = supervisorId;

    const dissertations = await Dissertation.find(filter)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email')
      .sort({ date_created: -1 });

    res.status(200).json({
      success: true,
      count: dissertations.length,
      data: dissertations
    });

  } catch (error) {
    console.error('Get all dissertations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching dissertations'
      }
    });
  }
};

exports.getAvailableDissertations = async (req, res) => {
  try {
    const dissertations = await Dissertation.findAvailable();

    res.status(200).json({
      success: true,
      count: dissertations.length,
      data: dissertations
    });

  } catch (error) {
    console.error('Get available dissertations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching available dissertations'
      }
    });
  }
};

exports.getDissertationById = async (req, res) => {
  try {
    const { id } = req.params;

    const dissertation = await Dissertation.findById(id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: dissertation
    });

  } catch (error) {
    console.error('Get dissertation by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid dissertation ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching dissertation'
      }
    });
  }
};

exports.createDissertation = async (req, res) => {
  try {
    const { track, title, description, deadline, supervisorId } = req.body;

    if (!track || !title || !supervisorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Please provide all required fields: track, title, supervisorId'
        }
      });
    }

    const supervisor = await User.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUPERVISOR_NOT_FOUND',
          message: 'Supervisor not found'
        }
      });
    }

    if (supervisor.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUPERVISOR',
          message: 'Supervisor must be a teacher'
        }
      });
    }

    const dissertationData = {
      track,
      title,
      description,
      supervisorId,
      status: 'available'
    };

    if (deadline) {
      dissertationData.deadline = deadline;
    }

    const dissertation = await Dissertation.create(dissertationData);

    const populatedDissertation = await Dissertation.findById(dissertation._id)
      .populate('supervisorId', 'name surname email');

    res.status(201).json({
      success: true,
      data: populatedDissertation
    });

  } catch (error) {
    console.error('Create dissertation error:', error);

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
        message: 'An error occurred while creating dissertation'
      }
    });
  }
};

exports.updateDissertation = async (req, res) => {
  try {
    const { id } = req.params;
    const { track, title, description, deadline } = req.body;

    const dissertation = await Dissertation.findById(id);

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    if (track) dissertation.track = track;
    if (title) dissertation.title = title;
    if (description !== undefined) dissertation.description = description;
    if (deadline !== undefined) dissertation.deadline = deadline;

    await dissertation.save();

    const updatedDissertation = await Dissertation.findById(id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    res.status(200).json({
      success: true,
      data: updatedDissertation
    });

  } catch (error) {
    console.error('Update dissertation error:', error);

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
          message: 'Invalid dissertation ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating dissertation'
      }
    });
  }
};

exports.deleteDissertation = async (req, res) => {
  try {
    const { id } = req.params;

    const dissertation = await Dissertation.findById(id);

    if (!dissertation) {
      console.log('ERROR: Dissertation not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    console.log('Dissertation found:', {
      id: dissertation._id,
      supervisorId: dissertation.supervisorId,
      status: dissertation.status
    });

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = dissertation.supervisorId.toString() === userId.toString();

    if (!isAdmin && !isSupervisor) {
      console.log('ERROR: Access denied - not admin or supervisor');
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only the supervisor or admin can delete this dissertation'
        }
      });
    }

    if (dissertation.status === 'assigned') {
      console.log('ERROR: Cannot delete - dissertation is assigned');
      return res.status(409).json({
        success: false,
        error: {
          code: 'DISSERTATION_ASSIGNED',
          message: 'Cannot delete an assigned dissertation. Please cancel it first.'
        }
      });
    }

    const pendingApplications = await Application.find({
      dissertationId: id,
      status: 'pending'
    }).populate('studentId');

    for (const app of pendingApplications) {
      await Notification.createNotification({
        userId: app.studentId._id,
        type: 'dissertation_deleted',
        title: 'Dissertation Deleted',
        message: `The dissertation "${dissertation.title}" you applied for has been deleted by the supervisor.`,
        relatedId: dissertation._id,
        relatedModel: 'Dissertation'
      });
    }

    await Application.deleteMany({ dissertationId: id });


    await Dissertation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Dissertation deleted successfully'
    });

  } catch (error) {

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid dissertation ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting dissertation'
      }
    });
  }
};

exports.assignDissertation = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STUDENT_ID',
          message: 'Student ID is required'
        }
      });
    }

    const dissertation = await Dissertation.findById(id);

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    if (dissertation.status !== 'available' && dissertation.status !== 'pending_approval') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Dissertation must be available or pending approval to be assigned'
        }
      });
    }

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student not found'
        }
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'User must be a student'
        }
      });
    }

    const existingAssignment = await Dissertation.findOne({
      studentId: studentId,
      status: 'assigned'
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'STUDENT_ALREADY_ASSIGNED',
          message: 'Student already has an assigned dissertation'
        }
      });
    }

    dissertation.studentId = studentId;
    dissertation.status = 'assigned';
    dissertation.date_started = new Date();

    await dissertation.save();

    const updatedDissertation = await Dissertation.findById(id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    res.status(200).json({
      success: true,
      data: updatedDissertation,
      message: 'Dissertation assigned successfully'
    });

  } catch (error) {
    console.error('Assign dissertation error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while assigning dissertation'
      }
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STATUS',
          message: 'Status is required'
        }
      });
    }

    const dissertation = await Dissertation.findById(id);

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    if (!dissertation.isValidStatusTransition(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot change status from ${dissertation.status} to ${status}`
        }
      });
    }

    dissertation.status = status;
    await dissertation.save();

    const updatedDissertation = await Dissertation.findById(id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    res.status(200).json({
      success: true,
      data: updatedDissertation,
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('Update status error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid dissertation ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating status'
      }
    });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress_percentage } = req.body;

    if (progress_percentage === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PROGRESS',
          message: 'Progress percentage is required'
        }
      });
    }

    if (progress_percentage < 0 || progress_percentage > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROGRESS',
          message: 'Progress must be between 0 and 100'
        }
      });
    }

    const dissertation = await Dissertation.findById(id);

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    if (dissertation.status !== 'assigned' && dissertation.status !== 'paused') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Progress can only be updated for assigned or paused dissertations'
        }
      });
    }

    dissertation.progress_percentage = progress_percentage;
    await dissertation.save();

    const updatedDissertation = await Dissertation.findById(id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    res.status(200).json({
      success: true,
      data: updatedDissertation,
      message: 'Progress updated successfully'
    });

  } catch (error) {
    console.error('Update progress error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid dissertation ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating progress'
      }
    });
  }
};

exports.getMyDissertations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let dissertations;

    if (userRole === 'student') {
      dissertations = await Dissertation.find({
        studentId: userId,
        status: 'assigned'
      })
        .populate('supervisorId', 'name surname email')
        .sort({ date_created: -1 });
    } else if (userRole === 'teacher') {
      dissertations = await Dissertation.find({ supervisorId: userId })
        .populate('studentId', 'name surname email')
        .sort({ date_created: -1 });
    } else {
      dissertations = [];
    }

    res.status(200).json({
      success: true,
      count: dissertations.length,
      data: dissertations
    });

  } catch (error) {
    console.error('Get my dissertations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching dissertations'
      }
    });
  }
};

exports.getSupervisedDissertations = async (req, res) => {
  try {
    const { supervisorId } = req.params;

    const dissertations = await Dissertation.findBySupervisor(supervisorId);

    res.status(200).json({
      success: true,
      count: dissertations.length,
      data: dissertations
    });

  } catch (error) {
    console.error('Get supervised dissertations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching supervised dissertations'
      }
    });
  }
};

exports.createStudentProposal = async (req, res) => {
  try {
    const { track, title, description, supervisorId, deadline } = req.body;
    const studentId = req.user.userId;

    if (!track || !title || !supervisorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Please provide all required fields: track, title, supervisorId'
        }
      });
    }

    const existingAssignment = await Dissertation.findOne({
      studentId: studentId,
      status: 'assigned'
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_ASSIGNED',
          message: 'You already have an assigned dissertation'
        }
      });
    }

    const supervisor = await User.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUPERVISOR_NOT_FOUND',
          message: 'Supervisor not found'
        }
      });
    }

    if (supervisor.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUPERVISOR',
          message: 'Supervisor must be an approved teacher'
        }
      });
    }

    const dissertationData = {
      track,
      title,
      description,
      supervisorId,
      studentId,
      status: 'pending_approval'
    };

    if (deadline) {
      dissertationData.deadline = deadline;
    }

    const dissertation = await Dissertation.create(dissertationData);

    const populatedDissertation = await Dissertation.findById(dissertation._id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    await Notification.createNotification({
      userId: supervisorId,
      type: 'proposal_received',
      title: 'New Dissertation Proposal',
      message: `${supervisor.name} ${supervisor.surname} has proposed a new dissertation: "${title}"`,
      relatedId: dissertation._id,
      relatedModel: 'Dissertation'
    });

    res.status(201).json({
      success: true,
      data: populatedDissertation,
      message: 'Proposal submitted successfully'
    });

  } catch (error) {
    console.error('Create student proposal error:', error);

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
        message: 'An error occurred while creating proposal'
      }
    });
  }
};

exports.getPendingProposals = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const proposals = await Dissertation.find({
      supervisorId: teacherId,
      status: 'pending_approval'
    })
      .populate('studentId', 'name surname email')
      .sort({ date_created: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals
    });

  } catch (error) {
    console.error('Get pending proposals error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching pending proposals'
      }
    });
  }
};

exports.approveProposal = async (req, res) => {
  try {
    const { id } = req.params;

    const dissertation = await Dissertation.findById(id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = dissertation.supervisorId._id.toString() === userId.toString();

    if (!isAdmin && !isSupervisor) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only the supervisor or admin can approve proposals'
        }
      });
    }

    if (dissertation.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Dissertation is not pending approval'
        }
      });
    }

    const existingAssignment = await Dissertation.findOne({
      studentId: dissertation.studentId._id,
      status: 'assigned',
      _id: { $ne: dissertation._id }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'STUDENT_ALREADY_ASSIGNED',
          message: 'Student already has an assigned dissertation'
        }
      });
    }

    dissertation.status = 'assigned';
    dissertation.date_started = new Date();
    await dissertation.save();

    await Application.deleteMany({
      studentId: dissertation.studentId._id,
      status: 'pending'
    });

    await Dissertation.deleteMany({
      studentId: dissertation.studentId._id,
      status: 'pending_approval',
      _id: { $ne: dissertation._id }
    });

    await Notification.createNotification({
      userId: dissertation.studentId._id,
      type: 'proposal_approved',
      title: 'Proposal Approved',
      message: `Your dissertation proposal "${dissertation.title}" has been approved!`,
      relatedId: dissertation._id,
      relatedModel: 'Dissertation'
    });

    res.status(200).json({
      success: true,
      data: dissertation,
      message: 'Proposal approved and dissertation assigned successfully'
    });

  } catch (error) {
    console.error('Approve proposal error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while approving proposal'
      }
    });
  }
};

exports.rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;

    const dissertation = await Dissertation.findById(id)
      .populate('supervisorId', 'name surname email')
      .populate('studentId', 'name surname email');

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = dissertation.supervisorId._id.toString() === userId.toString();

    if (!isAdmin && !isSupervisor) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only the supervisor or admin can reject proposals'
        }
      });
    }

    if (dissertation.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Dissertation is not pending approval'
        }
      });
    }

    await Notification.createNotification({
      userId: dissertation.studentId._id,
      type: 'proposal_rejected',
      title: 'Proposal Rejected',
      message: `Your dissertation proposal "${dissertation.title}" was not approved.`,
      relatedId: dissertation._id,
      relatedModel: 'Dissertation'
    });

    await Dissertation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Proposal rejected successfully'
    });

  } catch (error) {
    console.error('Reject proposal error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while rejecting proposal'
      }
    });
  }
};