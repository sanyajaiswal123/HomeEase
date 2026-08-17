const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false // Exclude password by default in queries
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer'
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number']
    },
    avatar: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: [Number], // [Longitude, Latitude]
        index: '2dsphere'
      }
    },
    providerDetails: {
      serviceCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      },
      experience: {
        type: Number,
        default: 0
      },
      hourlyRate: {
        type: Number,
        default: 0
      },
      isVerified: {
        type: Boolean,
        default: false
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      verificationHistory: [
        {
          action: String,
          reason: String,
          date: { type: Date, default: Date.now }
        }
      ],
      isAvailable: {
        type: Boolean,
        default: true
      },
      rating: {
        type: Number,
        default: 5
      },
      documentUrl: {
        type: String,
        default: ''
      },
      idProofType: {
        type: String,
        default: 'Aadhaar Card'
      },
      idProofNumber: {
        type: String,
        default: ''
      },
      bio: {
        type: String,
        default: ''
      },
      skills: [
        {
          type: String
        }
      ],
      languages: [
        {
          type: String
        }
      ],
      aiSummary: {
        type: String,
        default: ''
      },
      serviceRadiusKm: {
        type: Number,
        default: 25
      },
      servedCities: [
        {
          type: String
        }
      ],
      servedZipCodes: [
        {
          type: String
        }
      ],
      workingHours: {
        monday: { isEnabled: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
        tuesday: { isEnabled: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
        wednesday: { isEnabled: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
        thursday: { isEnabled: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
        friday: { isEnabled: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
        saturday: { isEnabled: { type: Boolean, default: true }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
        sunday: { isEnabled: { type: Boolean, default: false }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } }
      },
      breakHours: {
        isEnabled: { type: Boolean, default: true },
        startTime: { type: String, default: '13:00' },
        endTime: { type: String, default: '14:00' }
      },
      blockedDates: [
        {
          date: { type: String },
          reason: { type: String, default: 'Personal Leave' }
        }
      ],
      payoutAccount: {
        accountType: { type: String, enum: ['bank_account', 'upi'], default: 'bank_account' },
        accountHolderName: { type: String, default: '' },
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        upiId: { type: String, default: '' }
      }
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password validity
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
