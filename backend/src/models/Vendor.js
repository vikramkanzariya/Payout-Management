const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    upi_id: {
      type: String,
      default: null,
    },
    bank_account: {
      type: String,
      default: null,
    },
    ifsc: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

vendorSchema.set('toJSON', { virtuals: true });
vendorSchema.set('toObject', { virtuals: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
