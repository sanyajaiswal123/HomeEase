const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject for your complaint'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      default: 'open'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Should be an admin
    },
    history: [
      {
        status: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
