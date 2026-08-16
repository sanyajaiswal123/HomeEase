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
      aiSummary: {
        type: String,
        default: ''
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
