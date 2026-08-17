const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    payoutId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: [true, 'Please specify payout amount']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    destinationAccount: {
      accountType: {
        type: String,
        enum: ['bank_account', 'upi'],
        default: 'bank_account'
      },
      accountHolderName: String,
      bankName: String,
      accountNumberMasked: String, // e.g. "XXXX-XXXX-1234"
      ifscCode: String,
      upiIdMasked: String // e.g. "usr***@upi"
    },
    failureReason: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
