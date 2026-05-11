const Vendor = require('../models/Vendor');

/**
 * GET /api/vendors
 * Returns all vendors (both OPS and FINANCE can view)
 * Query: ?active=true to filter active only
 */
const getVendors = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.active === 'true') {
      where.is_active = true;
    }

    const vendors = await Vendor.find(where).sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      data: { vendors, total: vendors.length },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/vendors/:id
 * Returns a single vendor
 */
const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { vendor },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/vendors
 * Create a new vendor (OPS only)
 * Body: { name, upi_id?, bank_account?, ifsc?, is_active? }
 */
const createVendor = async (req, res, next) => {
  try {
    const { name, upi_id, bank_account, ifsc, is_active } = req.body;

    const vendor = await Vendor.create({
      name: name.trim(),
      upi_id: upi_id ? upi_id.trim() : null,
      bank_account: bank_account ? bank_account.trim() : null,
      ifsc: ifsc ? ifsc.trim().toUpperCase() : null,
      is_active: is_active !== undefined ? is_active : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully.',
      data: { vendor },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/vendors/:id
 * Update a vendor (OPS only)
 */
const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
      });
    }

    const { name, upi_id, bank_account, ifsc, is_active } = req.body;

    vendor.name = name !== undefined ? name.trim() : vendor.name;
    vendor.upi_id = upi_id !== undefined ? (upi_id ? upi_id.trim() : null) : vendor.upi_id;
    vendor.bank_account =
      bank_account !== undefined
        ? bank_account
          ? bank_account.trim()
          : null
        : vendor.bank_account;
    vendor.ifsc = ifsc !== undefined ? (ifsc ? ifsc.trim().toUpperCase() : null) : vendor.ifsc;
    vendor.is_active = is_active !== undefined ? is_active : vendor.is_active;

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Vendor updated successfully.',
      data: { vendor },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getVendors, getVendorById, createVendor, updateVendor };
