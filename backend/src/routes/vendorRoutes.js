const express = require('express');
const { body } = require('express-validator');
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
} = require('../controllers/vendorController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All vendor routes require authentication
router.use(authenticate);

/**
 * GET /api/vendors
 * Both OPS and FINANCE
 */
router.get('/', authorize('OPS', 'FINANCE'), getVendors);

/**
 * GET /api/vendors/:id
 * Both OPS and FINANCE
 */
router.get('/:id', authorize('OPS', 'FINANCE'), getVendorById);

/**
 * POST /api/vendors
 * OPS only
 */
router.post(
  '/',
  authorize('OPS'),
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Vendor name is required.')
      .isLength({ max: 255 }).withMessage('Name too long (max 255 chars).'),
    body('upi_id')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 100 }).withMessage('UPI ID too long (max 100 chars).'),
    body('bank_account')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 50 }).withMessage('Bank account too long (max 50 chars).'),
    body('ifsc')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 20 }).withMessage('IFSC too long (max 20 chars).')
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC format (e.g., HDFC0001234).').optional({ nullable: true, checkFalsy: true }),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean.'),
  ],
  validate,
  createVendor
);

/**
 * PUT /api/vendors/:id
 * OPS only
 */
router.put(
  '/:id',
  authorize('OPS'),
  [
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Vendor name cannot be empty.')
      .isLength({ max: 255 }).withMessage('Name too long (max 255 chars).'),
    body('upi_id')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 100 }).withMessage('UPI ID too long.'),
    body('bank_account')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 50 }).withMessage('Bank account too long.'),
    body('ifsc')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 20 }).withMessage('IFSC too long.')
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC format.').optional({ nullable: true, checkFalsy: true }),
    body('is_active')
      .optional()
      .isBoolean().withMessage('is_active must be a boolean.'),
  ],
  validate,
  updateVendor
);

module.exports = router;
