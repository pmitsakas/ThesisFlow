const express = require('express');
const router = express.Router();
const { dissertationController } = require('../controllers');
const {
  protect,
  isTeacher,
  isTeacherOrAdmin,
  isStudent,
  validateDissertationCreate,
  validateDissertationUpdate,
  validateAssignDissertation,
  validateUpdateStatus,
  validateUpdateProgress,
  validateMongoId,
  validateQueryFilters
} = require('../middleware');

router.get(
  '/',
  protect,
  validateQueryFilters,
  dissertationController.getAllDissertations
);

router.get(
  '/available',
  protect,
  dissertationController.getAvailableDissertations
);

router.get(
  '/my-dissertations',
  protect,
  dissertationController.getMyDissertations
);

router.get(
  '/supervised/:supervisorId',
  protect,
  dissertationController.getSupervisedDissertations
);

router.get(
  '/pending-proposals',
  protect,
  isTeacher,
  dissertationController.getPendingProposals
);

router.post(
  '/propose',
  protect,
  isStudent,
  validateDissertationCreate,
  dissertationController.createStudentProposal
);

router.patch(
  '/:id/approve-proposal',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  dissertationController.approveProposal
);

router.patch(
  '/:id/reject-proposal',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  dissertationController.rejectProposal
);

router.get(
  '/:id',
  protect,
  validateMongoId,
  dissertationController.getDissertationById
);

router.post(
  '/',
  protect,
  isTeacher,
  validateDissertationCreate,
  dissertationController.createDissertation
);

router.put(
  '/:id',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  validateDissertationUpdate,
  dissertationController.updateDissertation
);

router.delete(
  '/:id',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  dissertationController.deleteDissertation
);

router.patch(
  '/:id/assign',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  validateAssignDissertation,
  dissertationController.assignDissertation
);

router.patch(
  '/:id/status',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  validateUpdateStatus,
  dissertationController.updateStatus
);

router.patch(
  '/:id/progress',
  protect,
  isTeacherOrAdmin,
  validateMongoId,
  validateUpdateProgress,
  dissertationController.updateProgress
);

module.exports = router;