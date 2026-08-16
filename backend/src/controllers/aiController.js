const genAI = require('../config/gemini');
const Service = require('../models/Service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.diagnoseIssue = catchAsync(async (req, res, next) => {
  const { issueText } = req.body;

  if (!issueText || issueText.trim() === '') {
    return next(new AppError('Validation Error: Please describe your issue in more detail.', 400));
  }

  // Ensure Gemini is initialized
  if (!genAI) {
    return next(
      new AppError(
        'Invalid API Key: AI service is temporarily unavailable because of an authentication issue.',
        500
      )
    );
  }

  // Fetch all available service category names from DB to prompt Gemini precisely
  const dbServices = await Service.find().select('name');
  const serviceNames = dbServices.map((s) => s.name);

  // Add explicit intelligence for classification
  const defaultCategories = [
    'Plumbing',
    'Electrician',
    'AC Repair',
    'Painting',
    'Carpentry',
    'Appliance Repair',
    'Cleaning'
  ];

  const categoriesToUse = serviceNames.length > 0 ? serviceNames : defaultCategories;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a Senior Household Service Diagnostic Expert.
Analyze this user issue: "${issueText}"

INSTRUCTIONS:
1. Identify the core problem.
2. Recommend ONE exact service category from this list: ${JSON.stringify(categoriesToUse)}. 
   - Examples: Water leakage -> Plumbing, Switch sparks -> Electrician, Fan not working -> Electrician, Paint peeling -> Painting, Furniture broken -> Carpentry, AC noise -> AC Repair, Washing machine vibrating -> Appliance Repair, Dirty sofa -> Cleaning.
3. Determine urgency (Low / Medium / High / Emergency).
4. Provide a single, clear safety advice sentence.
5. Provide a realistic estimated price range in INR (e.g. "₹500 - ₹1200").
6. Provide an estimated repair time (e.g. "45 - 90 minutes").
7. Provide 1-2 preventive tips.
8. Answer whether they should book immediately (Yes / No).
9. Provide a confidence score (0-100%).

OUTPUT STRICT JSON ONLY. Structure:
{
  "issueDetected": "Short description of the issue detected",
  "possibleCause": "Most likely technical cause",
  "urgency": "Low|Medium|High|Emergency",
  "safetyAdvice": "One important safety tip",
  "recommendedService": "Name of service category from the list",
  "estimatedPrice": "₹Min - ₹Max",
  "estimatedTime": "Min - Max minutes",
  "preventiveTips": ["Tip 1", "Tip 2"],
  "bookImmediately": "Yes|No",
  "confidenceScore": "XX%"
}`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', textResponse);
      return next(
        new AppError('Backend Offline: Unable to connect to the AI service correctly.', 500)
      );
    }

    // Match service ID
    const matchedService = await Service.findOne({
      name: { $regex: new RegExp(jsonResponse.recommendedService, 'i') }
    });
    jsonResponse.serviceId = matchedService ? matchedService._id : null;

    return res.status(200).json({
      status: 'success',
      data: jsonResponse
    });
  } catch (error) {
    console.error('Gemini API Error:', error);

    const errMessage = error.message.toLowerCase();
    if (errMessage.includes('timeout')) {
      return next(
        new AppError(
          'Gemini Timeout: The AI is taking longer than expected. Please try again.',
          408
        )
      );
    } else if (
      errMessage.includes('429') ||
      errMessage.includes('quota') ||
      errMessage.includes('rate')
    ) {
      return next(new AppError('Rate Limit: Too many requests. Please wait a moment.', 429));
    } else if (errMessage.includes('api key') || errMessage.includes('auth')) {
      return next(
        new AppError(
          'Invalid API Key: AI service is temporarily unavailable because of an authentication issue.',
          500
        )
      );
    } else {
      return next(new AppError('Backend Offline: Unable to connect to the AI service.', 500));
    }
  }
});
