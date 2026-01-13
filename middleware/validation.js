const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules for different endpoints
const validationRules = {
  // User authentication
  register: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
      .matches(/^[a-zA-Z0-9_\s]+$/).withMessage('Username can only contain letters, numbers, underscores, and spaces'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6, max: 100 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ],

  login: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],

  email: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email address')
      .normalizeEmail(),
    handleValidationErrors
  ],

  resetPassword: [
    body('token')
      .trim()
      .notEmpty().withMessage('Reset token is required')
      .isLength({ min: 64, max: 64 }).withMessage('Invalid token format'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6, max: 100 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ],

  // Customer operations
  customer: [
    body('name')
      .trim()
      .notEmpty().withMessage('Customer name is required')
      .isLength({ min: 1, max: 255 }).withMessage('Customer name must be 1-255 characters')
      .escape(),
    body('user_id')
      .isInt({ min: 1 }).withMessage('Valid user ID is required'),
    handleValidationErrors
  ],

  customerUpdate: [
    body('name')
      .trim()
      .notEmpty().withMessage('Customer name is required')
      .isLength({ min: 1, max: 255 }).withMessage('Customer name must be 1-255 characters')
      .escape(),
    handleValidationErrors
  ],

  // Job operations
  job: [
    body('name')
      .trim()
      .notEmpty().withMessage('Job name is required')
      .isLength({ min: 1, max: 255 }).withMessage('Job name must be 1-255 characters')
      .escape(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
      .escape(),
    body('customer_id')
      .isInt({ min: 1 }).withMessage('Valid customer ID is required'),
    body('user_id')
      .isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'])
      .withMessage('Invalid status'),
    handleValidationErrors
  ],

  // Material operations
  material: [
    body('material_name')
      .trim()
      .notEmpty().withMessage('Material name is required')
      .isLength({ min: 1, max: 255 }).withMessage('Material name must be 1-255 characters')
      .escape(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    body('quantity')
      .optional()
      .isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('unit')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Unit must not exceed 50 characters')
      .escape(),
    body('unit_cost')
      .optional()
      .isFloat({ min: 0 }).withMessage('Unit cost must be a positive number'),
    body('status')
      .optional()
      .isIn(['needed', 'ordered', 'in_transit', 'delivered', 'installed'])
      .withMessage('Invalid material status'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Location must not exceed 255 characters')
      .escape(),
    body('supplier')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Supplier must not exceed 255 characters')
      .escape(),
    body('order_date')
      .optional()
      .isISO8601().withMessage('Invalid order date format'),
    body('expected_delivery')
      .optional()
      .isISO8601().withMessage('Invalid expected delivery date format'),
    body('actual_delivery')
      .optional()
      .isISO8601().withMessage('Invalid actual delivery date format'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 2000 }).withMessage('Notes must not exceed 2000 characters'),
    body('user_id')
      .isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('job_id')
      .isInt({ min: 1 }).withMessage('Valid job ID is required'),
    body('customer_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Valid customer ID is required'),
    handleValidationErrors
  ]
};

module.exports = validationRules;

