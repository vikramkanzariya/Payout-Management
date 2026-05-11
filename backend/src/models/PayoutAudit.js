const mongoose = require('mongoose');

const payoutAuditSchema = new mongoose.Schema(
  {
    payout_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout',
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED'],
      required: true,
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized for historical accuracy
    performed_by_name: {
      type: String,
      required: true,
    },
    performed_by_role: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Virtual for backwards compatibility if needed
payoutAuditSchema.virtual('payout', {
  ref: 'Payout',
  localField: 'payout_id',
  foreignField: '_id',
  justOne: true
});

payoutAuditSchema.virtual('performer', {
  ref: 'User',
  localField: 'performed_by',
  foreignField: '_id',
  justOne: true
});

payoutAuditSchema.set('toJSON', { virtuals: true });
payoutAuditSchema.set('toObject', { virtuals: true });

const PayoutAudit = mongoose.model('PayoutAudit', payoutAuditSchema);
module.exports = PayoutAudit;
