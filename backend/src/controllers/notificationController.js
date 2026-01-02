const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unreadOnly } = req.query;

    let notifications;
    if (unreadOnly === 'true') {
      notifications = await Notification.getUnreadByUser(userId);
    } else {
      notifications = await Notification.getAllByUser(userId);
    }

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching notifications'
      }
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while marking notification as read'
      }
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while marking notifications as read'
      }
    });
  }
};

exports.clearAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.clearAll(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });

  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while clearing notifications'
      }
    });
  }
};