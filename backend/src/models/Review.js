const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment for review']
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    isReported: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Update provider average rating after review is saved
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { provider: this.provider } },
    { $group: { _id: '$provider', avgRating: { $avg: '$rating' } } }
  ]);

  if (stats.length > 0) {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.provider, {
      'providerDetails.rating': Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.provider, {
      'providerDetails.rating': 5 // Default rating if no reviews left
    });
  }
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Review = doc.constructor;
    const stats = await Review.aggregate([
      { $match: { provider: doc.provider } },
      { $group: { _id: '$provider', avgRating: { $avg: '$rating' } } }
    ]);

    if (stats.length > 0) {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(doc.provider, {
        'providerDetails.rating': Math.round(stats[0].avgRating * 10) / 10
      });
    } else {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(doc.provider, {
        'providerDetails.rating': 5 // Default rating if no reviews left
      });
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
