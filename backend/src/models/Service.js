const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the service name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide the service description']
    },
    icon: {
      type: String,
      default: 'Wrench' // Lucide icon name fallback
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide a base price']
    },
    subServices: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
