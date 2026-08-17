const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_config',
      unique: true
    },
    platformCommission: {
      type: Number,
      default: 20 // 20%
    },
    cancellationFeePercent: {
      type: Number,
      default: 10 // 10%
    },
    emergencyServiceFee: {
      type: Number,
      default: 150 // ₹150 surcharge
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    contactSupportEmail: {
      type: String,
      default: 'support@homeease.com'
    },
    contactSupportPhone: {
      type: String,
      default: '+91 98765 43210'
    }
  },
  {
    timestamps: true
  }
);

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
