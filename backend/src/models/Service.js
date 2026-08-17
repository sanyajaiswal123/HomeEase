const mongoose = require('mongoose');

const subServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide sub-service name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide sub-service price']
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the service name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide the service description']
    },
    category: {
      type: String,
      default: 'General'
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    icon: {
      type: String,
      default: 'Wrench'
    },
    image: {
      type: String
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide a base price']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    subServices: [subServiceSchema]
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
