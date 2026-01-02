const express = require('express');
const router = express.Router();
const { commentController } = require('../controllers');
const {
  protect,
  validateCommentCreate,
  validateMongoId
} = require('../middleware');

router.get(
  '/dissertation/:id',
  protect,
  validateMongoId,
  commentController.getCommentsByDissertation
);

router.get(
  '/my-comments',
  protect,
  commentController.getMyComments
);

router.post(
  '/',
  protect,
  validateCommentCreate,
  commentController.createComment
);

router.delete(
  '/:id',
  protect,
  validateMongoId,
  commentController.deleteComment
);

module.exports = router;