const { body, param, query, validationResult } = require('express-validator');

const VALID_TRACKS = ['AI&DS', 'WT', 'BI'];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      }
    });
  }
  next();
};

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('surname')
    .trim()
    .notEmpty().withMessage('Surname is required')
    .isLength({ min: 2, max: 50 }).withMessage('Surname must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .custom((val) => {
      if (!val.toLowerCase().endsWith('@york.citycollege.eu')) {
        throw new Error('Registration is only allowed with a @york.citycollege.eu email');
      }
      return true;
    }),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  handleValidationErrors
];

exports.validateUserCreate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('surname')
    .trim()
    .notEmpty().withMessage('Surname is required')
    .isLength({ min: 2, max: 50 }).withMessage('Surname must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'student', 'teacher']).withMessage('Role must be admin, student, or teacher'),
  handleValidationErrors
];

exports.validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('surname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Surname must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'student', 'teacher']).withMessage('Role must be admin, student, or teacher'),
  handleValidationErrors
];


exports.validateProposalCreate = [
  body('tracks')
    .isArray({ min: 1 }).withMessage('At least one track is required')
    .custom((arr) => arr.every(t => VALID_TRACKS.includes(t)))
    .withMessage('All tracks must be valid (AI&DS, WT, BI)'),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 4000 }).withMessage('Description must not exceed 4000 characters'),
  body('supervisorId')
    .notEmpty().withMessage('Supervisor ID is required')
    .isMongoId().withMessage('Invalid supervisor ID'),
  handleValidationErrors
];

exports.validateDissertationUpdate = [
  body('tracks')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one track is required')
    .custom((arr) => arr.every(t => VALID_TRACKS.includes(t)))
    .withMessage('All tracks must be valid (AI&DS, WT, BI)'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 4000 }).withMessage('Description must not exceed 4000 characters'),
  handleValidationErrors
];


exports.validateUpdateStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['available', 'pending_approval', 'assigned', 'completed', 'canceled', 'paused'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

exports.validateUpdateProgress = [
  body('progress_percentage')
    .notEmpty().withMessage('Progress percentage is required')
    .isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  handleValidationErrors
];

exports.validateCommentCreate = [
  body('dissertationId')
    .notEmpty().withMessage('Dissertation ID is required')
    .isMongoId().withMessage('Invalid dissertation ID'),
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  handleValidationErrors
];

exports.validateSettingUpdate = [
  body('value')
    .notEmpty().withMessage('Setting value is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];


exports.validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

exports.validateQueryFilters = [
  query('role')
    .optional()
    .isIn(['admin', 'student', 'teacher']).withMessage('Invalid role'),
  query('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be true or false'),
  query('status')
    .optional()
    .isIn(['available', 'pending_approval', 'assigned', 'completed', 'canceled', 'paused'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

exports.validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  handleValidationErrors
];

exports.validateResetPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];