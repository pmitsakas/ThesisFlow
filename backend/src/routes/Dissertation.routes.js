const express = require('express');
const router = express.Router();
const { dissertationController } = require('../controllers');
const {
  protect,
  isTeacher,
  isTeacherOrAdmin,
  isStudent,
  validateProposalCreate,
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
  '/my-dissertations',
  protect,
  dissertationController.getMyDissertations
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
  validateProposalCreate,
  dissertationController.createStudentProposal
);

router.delete(
  '/:id/withdraw',
  protect,
  isStudent,
  validateMongoId,
  dissertationController.withdrawProposal
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