const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    subServicesSelected: [
      {
        type: String
      }
    ],
    scheduledDate: {
      type: Date,
      required: [true, 'Please select a date and time for service']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    totalAmount: {
      type: Number,
      required: true
    },
    originalAmount: {
      type: Number
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    appliedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    offerCode: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: [Number] // [Longitude, Latitude]
      }
    },
    otp: {
      type: String,
      required: true
    },
    trackingLog: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
