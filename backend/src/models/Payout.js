const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    mode: {
      type: String,
      enum: ['UPI', 'IMPS', 'NEFT'],
      required: true,
    },
    note: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft',
      required: true,
    },
    decision_reason: {
      type: String,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Virtual for backward compatibility with existing controller expectations if needed
payoutSchema.virtual('vendor', {
  ref: 'Vendor',
  localField: 'vendor_id',
  foreignField: '_id',
  justOne: true
});

payoutSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included when converting document to JSON
payoutSchema.set('toJSON', { virtuals: true });
payoutSchema.set('toObject', { virtuals: true });

const Payout = mongoose.model('Payout', payoutSchema);
module.exports = Payout;
