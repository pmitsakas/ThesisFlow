const Application = require('../models/Application');
const Dissertation = require('../models/Dissertation');
const Notification = require('../models/Notification');

exports.createApplication = async (req, res) => {
  try {
    const { dissertationId, message } = req.body;
    const studentId = req.user.userId;

    if (!dissertationId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Dissertation ID is required'
        }
      });
    }

    const existingApplication = await Application.findOne({
      dissertationId,
      studentId
    });

    if (existingApplication) {
      if (existingApplication.status === 'pending') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'APPLICATION_EXISTS',
            message: 'You have already applied for this dissertation'
          }
        });
      }

      if (existingApplication.status === 'rejected') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'APPLICATION_REJECTED',
            message: 'Your previous application for this dissertation was rejected. You cannot apply again.'
          }
        });
      }

      if (existingApplication.status === 'approved') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'APPLICATION_APPROVED',
            message: 'You have already been approved for this dissertation'
          }
        });
      }
    }

    const application = await Application.create({
      dissertationId,
      studentId,
      message
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('dissertationId')
      .populate({
        path: 'dissertationId',
        populate: {
          path: 'supervisorId',
          select: 'name surname email'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedApplication
    });

  } catch (error) {
    console.error('Create application error:', error);

    if (error.message.includes('already has an assigned dissertation')) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_ASSIGNED',
          message: error.message
        }
      });
    }

    if (error.message.includes('not available')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_AVAILABLE',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while creating application'
      }
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const applications = await Application.findByStudent(studentId);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching applications'
      }
    });
  }
};

exports.getApplicationsByDissertation = async (req, res) => {
  try {
    const { id: dissertationId } = req.params;

    const dissertation = await Dissertation.findById(dissertationId);

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
          message: 'Only the supervisor or admin can view applications'
        }
      });
    }

    const applications = await Application.findByDissertation(dissertationId);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Get applications by dissertation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching applications'
      }
    });
  }
};

exports.getPendingApplications = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const applications = await Application.findPendingByTeacher(teacherId);

    const filteredApplications = applications.filter(app => app.dissertationId !== null);

    res.status(200).json({
      success: true,
      count: filteredApplications.length,
      data: filteredApplications
    });

  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching pending applications'
      }
    });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('dissertationId')
      .populate('studentId');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = application.dissertationId.supervisorId.toString() === userId.toString();

    if (!isAdmin && !isSupervisor) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only the supervisor or admin can approve applications'
        }
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Application has already been processed'
        }
      });
    }

    const assignedDissertation = await Dissertation.findOne({
      studentId: application.studentId._id,
      status: 'assigned'
    });

    if (assignedDissertation) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_ASSIGNED',
          message: 'Student already has an assigned dissertation'
        }
      });
    }

    application.dissertationId.studentId = application.studentId._id;
    application.dissertationId.status = 'assigned';
    application.dissertationId.date_started = new Date();
    await application.dissertationId.save();

    application.status = 'approved';
    await application.save();

    await Application.deleteMany({
      studentId: application.studentId._id,
      status: 'pending',
      _id: { $ne: application._id }
    });

    await Dissertation.deleteMany({
      studentId: application.studentId._id,
      status: 'pending_approval',
      _id: { $ne: application.dissertationId._id }
    });

    await Application.updateMany(
      {
        dissertationId: application.dissertationId._id,
        _id: { $ne: application._id },
        status: 'pending'
      },
      { status: 'rejected' }
    );

    await Notification.createNotification({
      userId: application.studentId._id,
      type: 'application_approved',
      title: 'Application Approved',
      message: `Your application for "${application.dissertationId.title}" has been approved!`,
      relatedId: application.dissertationId._id,
      relatedModel: 'Dissertation'
    });

    const rejectedApplications = await Application.find({
      dissertationId: application.dissertationId._id,
      status: 'rejected'
    }).populate('studentId');

    for (const rejectedApp of rejectedApplications) {
      await Notification.createNotification({
        userId: rejectedApp.studentId._id,
        type: 'application_rejected',
        title: 'Application Rejected',
        message: `Your application for "${application.dissertationId.title}" was not accepted.`,
        relatedId: application.dissertationId._id,
        relatedModel: 'Dissertation'
      });
    }

    res.status(200).json({
      success: true,
      data: application,
      message: 'Application approved and dissertation assigned successfully'
    });

  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while approving application'
      }
    });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('dissertationId');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = application.dissertationId.supervisorId.toString() === userId.toString();

    if (!isAdmin && !isSupervisor) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only the supervisor or admin can reject applications'
        }
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Application has already been processed'
        }
      });
    }

    application.status = 'rejected';
    await application.save();

    res.status(200).json({
      success: true,
      data: application,
      message: 'Application rejected successfully'
    });

  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while rejecting application'
      }
    });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.userId;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    if (application.studentId.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only delete your own applications'
        }
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE',
          message: 'Cannot delete processed applications'
        }
      });
    }

    await Application.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting application'
      }
    });
  }
};