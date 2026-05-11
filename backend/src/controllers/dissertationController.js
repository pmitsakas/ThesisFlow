const Dissertation = require('../models/Dissertation');
const User = require('../models/User');
const { sendProposalApprovedEmail, sendProposalRejectedEmail } = require('../services/emailService');
const Notification = require('../models/Notification');
const { deleteDissertationCascade } = require('../utils/cascadeDelete');

exports.getAllDissertations = async (req, res) => {
  try {
    const { status, track, supervisorId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (track) filter.tracks = track;
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

exports.updateDissertation = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracks, title, description, deadline } = req.body;

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

    if (tracks) dissertation.tracks = tracks;
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
    const isSupervisor = dissertation.supervisorId.toString() === userId.toString();

    if (!isAdmin && !isSupervisor) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only the supervisor or admin can delete this dissertation'
        }
      });
    }

    if (dissertation.status === 'assigned') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DISSERTATION_ASSIGNED',
          message: 'Cannot delete an assigned dissertation. Please cancel it first.'
        }
      });
    }

    await deleteDissertationCascade(id);

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
        status: { $in: ['assigned', 'pending_approval'] }
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

exports.createStudentProposal = async (req, res) => {
  try {
    const { tracks, title, description, supervisorId, deadline } = req.body;
    const studentId = req.user.userId;

    if (!tracks || !title || !supervisorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Please provide all required fields: tracks, title, supervisorId'
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
      code: `PROP-${studentId}-${Date.now()}`,
      tracks: tracks && tracks.length > 0 ? tracks : [],
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

    const student = await User.findById(studentId).select('name surname');
    await Notification.createNotification({
      userId: supervisorId,
      type: 'proposal_received',
      title: 'New Dissertation Proposal',
      message: `${student.name} ${student.surname} has proposed a new dissertation: "${title}"`,
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
    const { title, description } = req.body;

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

    const rawDissertation = await Dissertation.findById(id).lean();
    const studentObjectId = rawDissertation.studentId;

    if (!studentObjectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_STUDENT',
          message: 'This proposal has no student attached'
        }
      });
    }

    const existingAssignment = await Dissertation.findOne({
      studentId: studentObjectId,
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
    if (title) dissertation.title = title;
    if (description) dissertation.description = description;
    await dissertation.save();

    const otherPending = await Dissertation.find({
      studentId: studentObjectId,
      status: 'pending_approval',
      _id: { $ne: dissertation._id }
    }).select('_id');

    for (const d of otherPending) {
      await deleteDissertationCascade(d._id);
    }

    await Notification.createNotification({
      userId: studentObjectId,
      type: 'proposal_approved',
      title: 'Proposal Approved',
      message: `Your dissertation proposal "${dissertation.title}" has been approved!`,
      relatedId: dissertation._id,
      relatedModel: 'Dissertation'
    });

    try {
      const student = await User.findById(studentObjectId);
      if (student) {
        await sendProposalApprovedEmail(student.email, student.name, dissertation.title);
      }
    } catch (emailError) {
      console.error('Email send error (approve):', emailError);
    }

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

    const rawDissertation = await Dissertation.findById(id).lean();
    const studentObjectId = rawDissertation.studentId;

    if (studentObjectId) {
      await Notification.createNotification({
        userId: studentObjectId,
        type: 'proposal_rejected',
        title: 'Proposal Rejected',
        message: `Your dissertation proposal "${dissertation.title}" was not approved.`,
        relatedId: dissertation._id,
        relatedModel: 'Dissertation'
      });

      try {
        const student = await User.findById(studentObjectId);
        if (student) {
          await sendProposalRejectedEmail(student.email, student.name, dissertation.title);
        }
      } catch (emailError) {
        console.error('Email send error (reject):', emailError);
      }
    }

    await deleteDissertationCascade(id);

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

exports.withdrawProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.userId;

    const dissertation = await Dissertation.findById(id);

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Proposal not found' }
      });
    }

    if (dissertation.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'This is not your proposal' }
      });
    }

    if (dissertation.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Only pending proposals can be withdrawn' }
      });
    }

    await deleteDissertationCascade(id);

    res.status(200).json({ success: true, message: 'Proposal withdrawn successfully' });

  } catch (error) {
    console.error('Withdraw proposal error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred while withdrawing proposal' }
    });
  }
};