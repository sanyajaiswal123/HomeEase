const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: [
        'system',
        'verification_approved',
        'verification_rejected',
        'booking_update',
        'booking_cancelled',
        'new_booking',
        'booking_accepted',
        'booking_rejected',
        'payment_update',
        'payout_update',
        'refund_processed',
        'complaint_update',
        'broadcast'
      ],
      default: 'system'
    },
    title: {
      type: String,
      required: [true, 'Please provide notification title'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
      trim: true
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
