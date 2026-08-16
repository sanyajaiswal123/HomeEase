const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

let genAI = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI client:', error.message);
  }
} else {
  console.warn(
    'WARNING: GEMINI_API_KEY is not defined in .env. AI features will run in Demo/Mock mode.'
  );
}

module.exports = genAI;
