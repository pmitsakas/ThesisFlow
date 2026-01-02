const express = require('express');
const router = express.Router();
const { applicationController } = require('../controllers');
const { protect, isStudent, isTeacherOrAdmin, validateMongoId } = require('../middleware');

router.post(
  '/',
  protect,
  isStudent,
  applicationController.createApplication
);

router.get(
  '/my-applications',
  protect,
  isStudent,
  applicationController.getMyApplications
);

router.get(
  '/pending',
  protect,
  isTeacherOrAdmin,
  applicationController.getPendingApplications
);

router.get(
  '/dissertation/:id',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  applicationController.getApplicationsByDissertation
);

router.patch(
  '/:id/approve',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  applicationController.approveApplication
);

router.patch(
  '/:id/reject',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  applicationController.rejectApplication
);

router.delete(
  '/:id',
  protect,
  validateMongoId,
  applicationController.deleteApplication
);

module.exports = router;