const express = require('express');
const router = express.Router();
const { notificationController } = require('../controllers');
const { protect, validateMongoId } = require('../middleware');

router.get(
  '/',
  protect,
  notificationController.getMyNotifications
);

router.patch(
  '/:id/read',
  protect,
  validateMongoId,
  notificationController.markAsRead
);

router.patch(
  '/mark-all-read',
  protect,
  notificationController.markAllAsRead
);

router.delete(
  '/clear-all',
  protect,
  notificationController.clearAll
);

module.exports = router;