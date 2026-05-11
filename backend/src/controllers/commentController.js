const Comment = require('../models/Comment');
const Dissertation = require('../models/Dissertation');
const User = require('../models/User');
const { sendNewCommentEmail } = require('../services/emailService');
const Notification = require('../models/Notification');

exports.getCommentsByDissertation = async (req, res) => {
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
    const isSupervisor = dissertation.supervisorId.toString() === userId.toString();
    const isStudent = dissertation.studentId && dissertation.studentId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSupervisor && !isStudent && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to view these comments'
        }
      });
    }

    const comments = await Comment.findByDissertation(id);

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error) {
    console.error('Get comments error:', error);

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
        message: 'An error occurred while fetching comments'
      }
    });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { dissertationId, content } = req.body;

    if (!dissertationId || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Please provide dissertationId and content'
        }
      });
    }

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
    const isSupervisor = dissertation.supervisorId.toString() === userId.toString();
    const isStudent = dissertation.studentId && dissertation.studentId.toString() === userId.toString();

    if (!isSupervisor && !isStudent) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only the supervisor or assigned student can comment on this dissertation'
        }
      });
    }

    const comment = await Comment.create({
      userId,
      dissertationId,
      content
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name surname email role');

    res.status(201).json({
      success: true,
      data: populatedComment
    });

    setImmediate(async () => {
  try {
    const commenter = await User.findById(userId).select('name surname');
    const commenterName = `${commenter.name} ${commenter.surname}`;
    const isSup = dissertation.supervisorId.toString() === userId.toString();

    if (isSup && dissertation.studentId) {
      const student = await User.findById(dissertation.studentId).select('name email');
      if (student) {
        await sendNewCommentEmail(student.email, student.name, commenterName, dissertation.title, dissertationId);
        await Notification.createNotification({
          userId: dissertation.studentId,
          type: 'comment_added',
          title: 'New comment',
          message: `${commenterName} commented on your dissertation "${dissertation.title}"`,
          relatedId: dissertationId,
          relatedModel: 'Dissertation'
        });
      }
    } else if (!isSup) {
      const supervisor = await User.findById(dissertation.supervisorId).select('name email');
      if (supervisor) {
        await sendNewCommentEmail(supervisor.email, supervisor.name, commenterName, dissertation.title, dissertationId);
        await Notification.createNotification({
          userId: dissertation.supervisorId,
          type: 'comment_added',
          title: 'New comment',
          message: `${commenterName} commented on your dissertation "${dissertation.title}"`,
          relatedId: dissertationId,
          relatedModel: 'Dissertation'
        });
      }
    }
  } catch (e) {
    console.error('Notification/Email error (comment):', e);
  }
});

  } catch (error) {
    console.error('Create comment error:', error);

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

    if (error.message && error.message.includes('Only the supervisor or assigned student')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while creating comment'
      }
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAuthor = comment.userId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only delete your own comments'
        }
      });
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid comment ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting comment'
      }
    });
  }
};

exports.getMyComments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const comments = await Comment.findRecentByUser(userId, limit);

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error) {
    console.error('Get my comments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching comments'
      }
    });
  }
};