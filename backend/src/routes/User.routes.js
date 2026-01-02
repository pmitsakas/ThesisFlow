const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { 
  protect, 
  isAdmin,
  validateUserCreate,
  validateUserUpdate,
  validateMongoId,
  validateQueryFilters
} = require('../middleware');

router.get(
  '/',
  protect,
  isAdmin,
  validateQueryFilters,
  userController.getAllUsers
);

router.get(
  '/active-teachers',
  protect,
  userController.getActiveTeachers  
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