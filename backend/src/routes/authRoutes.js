const express = require('express');
const { body } = require('express-validator');
const { login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email.'),
    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 3 }).withMessage('Password must be at least 3 characters.'),
  ],
  validate,
  login
);

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, getMe);

module.exports = router;
