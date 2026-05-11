const express = require('express');
const { body } = require('express-validator');
const {
  getPayouts,
  getPayoutById,
  createPayout,
  submitPayout,
  approvePayout,
  rejectPayout,
} = require('../controllers/payoutController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All payout routes require authentication
router.use(authenticate);

/**
 * GET /api/payouts
 * Both OPS and FINANCE — with optional filters ?status=&vendor_id=
 */
router.get('/', authorize('OPS', 'FINANCE'), getPayouts);

/**
 * GET /api/payouts/:id
 * Both OPS and FINANCE
 */
router.get('/:id', authorize('OPS', 'FINANCE'), getPayoutById);

/**
 * POST /api/payouts
 * OPS only — creates in Draft status
 */
router.post(
  '/',
  authorize('OPS'),
  [
    body('vendor_id')
      .notEmpty().withMessage('Vendor is required.')
      .isMongoId().withMessage('Invalid vendor ID.'),
    body('amount')
      .notEmpty().withMessage('Amount is required.')
      .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0.'),
    body('mode')
      .notEmpty().withMessage('Payment mode is required.')
      .isIn(['UPI', 'IMPS', 'NEFT']).withMessage('Mode must be one of: UPI, IMPS, NEFT.'),
    body('note')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 500 }).withMessage('Note too long (max 500 chars).'),
  ],
  validate,
  createPayout
);

/**
 * POST /api/payouts/:id/submit
 * OPS only — Draft → Submitted
 */
router.post('/:id/submit', authorize('OPS'), submitPayout);

/**
 * POST /api/payouts/:id/approve
 * FINANCE only — Submitted → Approved
 */
router.post('/:id/approve', authorize('FINANCE'), approvePayout);

/**
 * POST /api/payouts/:id/reject
 * FINANCE only — Submitted → Rejected (reason required)
 */
router.post(
  '/:id/reject',
  authorize('FINANCE'),
  [
    body('reason')
      .trim()
      .notEmpty().withMessage('Rejection reason is mandatory.')
      .isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters.'),
  ],
  validate,
  rejectPayout
);

module.exports = router;
