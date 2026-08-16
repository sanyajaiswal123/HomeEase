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
  const reviews = await Review.find({ provider: req.params.providerId })
    .populate('customer', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Background helper to compile provider reviews and update the bio summary using Gemini AI
const generateProviderAISummary = async (providerId) => {
  if (!genAI) return;

  try {
    const reviews = await Review.find({ provider: providerId }).select('comment rating');
    if (reviews.length < 2) return; // Need at least 2 reviews for summary

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
