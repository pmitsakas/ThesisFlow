const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { protect, isStudent } = require('../middleware/auth');
const { 
  isAdmin,
  validateUserCreate,
  validateUserUpdate,
  validateMongoId,
  validateQueryFilters
} = require('../middleware');

router.get(
  '/active-teachers',
  protect,
  userController.getActiveTeachers  
);

router.get(
  '/profile',
  protect,
  isStudent,
  userController.getMyProfile
);

router.put(
  '/profile',
  protect,
  isStudent,
  userController.updateMyProfile
);

router.post(
  '/generate-proposal',
  protect,
  isStudent,
  userController.generateProposal
);

router.get(
  '/',
  protect,
  isAdmin,
  validateQueryFilters,
  userController.getAllUsers
);

router.get(
  '/:id',
  protect,
  validateMongoId,
  userController.getUserById
);

router.post(
  '/',
  protect,
  isAdmin,
  validateUserCreate,
  userController.createUser
);

router.put(
  '/:id',
  protect,
  isAdmin,
  validateMongoId,
  validateUserUpdate,
  userController.updateUser
);

router.delete(
  '/:id',
  protect,
  isAdmin,
  validateMongoId,
  userController.deleteUser
);

router.patch(
  '/:id/deactivate',
  protect,
  isAdmin,
  validateMongoId,
  userController.deactivateUser
);

module.exports = router;