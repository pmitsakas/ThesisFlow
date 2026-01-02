const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed you should provide at least 8 characters one uppercase and a symbol',
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
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
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

exports.validateDissertationCreate = [
  body('track')
    .notEmpty().withMessage('Track is required')
    .isIn([
      'Computer Science',
      'Software Engineering',
      'Data Science',
      'Artificial Intelligence',
      'Cybersecurity',
      'Information Systems',
      'Computer Networks',
      'Human-Computer Interaction'
    ]).withMessage('Invalid track'),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('supervisorId')
    .notEmpty().withMessage('Supervisor ID is required')
    .isMongoId().withMessage('Invalid supervisor ID'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
  handleValidationErrors
];

exports.validateDissertationUpdate = [
  body('track')
    .optional()
    .isIn([
      'Computer Science',
      'Software Engineering',
      'Data Science',
      'Artificial Intelligence',
      'Cybersecurity',
      'Information Systems',
      'Computer Networks',
      'Human-Computer Interaction'
    ]).withMessage('Invalid track'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),
  handleValidationErrors
];

exports.validateAssignDissertation = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),
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

exports.validateSetDeadline = [
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date'),
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