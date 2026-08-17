const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const genAI = require('../config/gemini');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { BOOKING_STATUS } = require('../config/constants');

// Analyze review comment sentiment using Gemini
const analyzeSentiment = async (comment, rating) => {
  // If Gemini API is available, analyze sentiment. Otherwise fallback to simple rating-based sentiment.
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze the sentiment of the following customer service review. Respond with exactly one word: 'positive', 'neutral', or 'negative'.

Review: "${comment}"`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().toLowerCase();

      if (['positive', 'neutral', 'negative'].includes(text)) {
        return text;
      }
    } catch (error) {
      console.error('Gemini sentiment analysis failed:', error.message);
    }
  }

  // Fallback rating-based sentiment analysis
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
};

exports.createReview = catchAsync(async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found.', 404));
  }

  if (booking.customer.toString() !== req.user.id) {
    return next(new AppError('You can only review your own bookings.', 403));
  }

  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    return next(new AppError('You can only review completed services.', 400));
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this service.', 400));
  }

  // Analyze Sentiment
  const sentiment = await analyzeSentiment(comment, rating);

  const review = await Review.create({
    booking: bookingId,
    customer: req.user._id,
    provider: booking.provider,
    rating,
    comment,
    sentiment
  });

  // Generate AI Summary for provider profiles based on recent reviews
  // Trigger asynchronously so API responds fast
  generateProviderAISummary(booking.provider).catch((err) =>
    console.error('Failed to trigger provider bio summary update:', err.message)
  );

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.getProviderReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ provider: req.params.providerId, isHidden: false })
    .populate('customer', 'name avatar')
    .populate('service', 'name icon')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.getMyProviderReviews = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'provider') {
    return next(new AppError('Only providers can access provider review management.', 403));
  }

  const providerId = req.user._id;
  const { ratingFilter = 'all', sort = 'newest' } = req.query;

  let query = { provider: providerId };
  if (ratingFilter !== 'all') {
    query.rating = Number(ratingFilter);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
  if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

  const reviews = await Review.find(query)
    .populate('customer', 'name avatar email phone')
    .populate('booking', 'scheduledDate totalAmount')
    .sort(sortOption);

  // Compute breakdown stats from all reviews for this provider
  const allProviderReviews = await Review.find({ provider: providerId });

  const totalReviews = allProviderReviews.length;
  const star5Count = allProviderReviews.filter((r) => r.rating === 5).length;
  const star4Count = allProviderReviews.filter((r) => r.rating === 4).length;
  const star3Count = allProviderReviews.filter((r) => r.rating === 3).length;
  const star2Count = allProviderReviews.filter((r) => r.rating === 2).length;
  const star1Count = allProviderReviews.filter((r) => r.rating === 1).length;

  const totalSum = allProviderReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalReviews > 0 ? Math.round((totalSum / totalReviews) * 10) / 10 : 5.0;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      stats: {
        avgRating,
        totalReviews,
        star5Count,
        star4Count,
        star3Count,
        star2Count,
        star1Count,
        star5Percent: totalReviews > 0 ? Math.round((star5Count / totalReviews) * 100) : 0,
        star4Percent: totalReviews > 0 ? Math.round((star4Count / totalReviews) * 100) : 0,
        star3Percent: totalReviews > 0 ? Math.round((star3Count / totalReviews) * 100) : 0,
        star2Percent: totalReviews > 0 ? Math.round((star2Count / totalReviews) * 100) : 0,
        star1Percent: totalReviews > 0 ? Math.round((star1Count / totalReviews) * 100) : 0
      },
      reviews
    }
  });
});

exports.replyToReview = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'provider') {
    return next(new AppError('Only providers can reply to reviews.', 403));
  }

  const { id } = req.params;
  const { reply } = req.body;

  if (!reply || !reply.trim()) {
    return next(new AppError('Please provide a valid reply message.', 400));
  }

  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError('Review not found.', 404));
  }

  if (review.provider.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to reply to this review.', 403));
  }

  review.providerReply = {
    message: reply.trim(),
    repliedAt: new Date()
  };

  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Reply submitted successfully.',
    data: {
      review
    }
  });
});

// Background helper to compile provider reviews and update the bio summary using Gemini AI
const generateProviderAISummary = async (providerId) => {
  if (!genAI) return;

  try {
    const reviews = await Review.find({ provider: providerId }).select('comment rating');
    if (reviews.length < 2) return;

    const reviewTextList = reviews
      .map((r) => `- [Stars: ${r.rating}/5]: "${r.comment}"`)
      .join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Based on these customer reviews for a service provider, write a professional, concise 2-sentence profile summary highlighting their strengths (e.g. speed, cleanup, expertise) and general attitude. Write in the third person. Keep it under 250 characters.

Customer Reviews:
${reviewTextList}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    await User.findByIdAndUpdate(providerId, {
      'providerDetails.aiSummary': summary
    });
    console.log(`Successfully generated AI Profile Summary for provider ${providerId}`);
  } catch (err) {
    console.error('AI Profile Summary generation error:', err.message);
  }
};
