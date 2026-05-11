const Payout = require('../models/Payout');
const PayoutAudit = require('../models/PayoutAudit');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

/**
 * Helper: create an audit entry
 */
const createAudit = async (payout_id, action, user) => {
  await PayoutAudit.create({
    payout_id,
    action,
    performed_by: user.id, // from req.user
    performed_by_name: user.name,
    performed_by_role: user.role,
  });
};

/**
 * GET /api/payouts
 * Query params: status, vendor_id, page, limit
 * Both OPS and FINANCE can view all payouts
 */
const getPayouts = async (req, res, next) => {
  try {
    const { status, vendor_id, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (vendor_id) where.vendor_id = vendor_id;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const payouts = await Payout.find(where)
      .populate('vendor', 'name upi_id bank_account ifsc')
      .populate('creator', 'name email role')
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(parseInt(limit));

    const count = await Payout.countDocuments(where);

    return res.status(200).json({
      success: true,
      data: {
        payouts,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payouts/:id
 * Returns payout detail with audit trail
 */
const getPayoutById = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate('vendor', 'name upi_id bank_account ifsc is_active')
      .populate('creator', 'name email role')
      .lean(); // Use lean to easily attach audits

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found.',
      });
    }

    const audits = await PayoutAudit.find({ payout_id: payout._id }).sort({ created_at: 1 });
    payout.audits = audits;

    return res.status(200).json({
      success: true,
      data: { payout },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payouts
 * OPS only: Create a new payout in Draft status
 * Body: { vendor_id, amount, mode, note? }
 */
const createPayout = async (req, res, next) => {
  try {
    const { vendor_id, amount, mode, note } = req.body;

    // Verify vendor exists and is active
    const vendor = await Vendor.findById(vendor_id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
      });
    }
    if (!vendor.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create payout for an inactive vendor.',
      });
    }

    const payout = await Payout.create({
      vendor_id,
      amount: parseFloat(amount),
      mode,
      note: note || null,
      status: 'Draft',
      created_by: req.user.id,
    });

    // Create audit entry
    await createAudit(payout._id, 'CREATED', req.user);

    // Return with associations
    const createdPayout = await Payout.findById(payout._id)
      .populate('vendor', 'name')
      .populate('creator', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Payout created successfully.',
      data: { payout: createdPayout },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payouts/:id/submit
 * OPS only: Draft → Submitted
 */
const submitPayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found.',
      });
    }

    if (payout.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit payout. Current status is '${payout.status}'. Only 'Draft' payouts can be submitted.`,
      });
    }

    payout.status = 'Submitted';
    await payout.save();
    await createAudit(payout._id, 'SUBMITTED', req.user);

    return res.status(200).json({
      success: true,
      message: 'Payout submitted successfully.',
      data: { payout },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payouts/:id/approve
 * FINANCE only: Submitted → Approved
 */
const approvePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found.',
      });
    }

    if (payout.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve payout. Current status is '${payout.status}'. Only 'Submitted' payouts can be approved.`,
      });
    }

    payout.status = 'Approved';
    await payout.save();
    await createAudit(payout._id, 'APPROVED', req.user);

    return res.status(200).json({
      success: true,
      message: 'Payout approved successfully.',
      data: { payout },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payouts/:id/reject
 * FINANCE only: Submitted → Rejected
 * Body: { reason } (required)
 */
const rejectPayout = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found.',
      });
    }

    if (payout.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject payout. Current status is '${payout.status}'. Only 'Submitted' payouts can be rejected.`,
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory.',
      });
    }

    payout.status = 'Rejected';
    payout.decision_reason = reason.trim();
    await payout.save();
    
    await createAudit(payout._id, 'REJECTED', req.user);

    return res.status(200).json({
      success: true,
      message: 'Payout rejected.',
      data: { payout },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPayouts,
  getPayoutById,
  createPayout,
  submitPayout,
  approvePayout,
  rejectPayout,
};
