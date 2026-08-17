const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Standard middlewares
app.use(
  cors({
    origin: '*', // Customize for production as needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HomeEase API is running smoothly',
    timestamp: new Date()
  });
});

// Import and mount routers (we will define these next)
const authRouter = require('./routes/auth');
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const reviewsRouter = require('./routes/reviews');
const aiRouter = require('./routes/ai');
const adminRouter = require('./routes/admin');
const complaintsRouter = require('./routes/complaints');
const notificationRouter = require('./routes/notifications');
const offersRouter = require('./routes/offers');

app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/offers', offersRouter);

// Global 404 Route handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #090b11; color: white;">
        <div style="text-align: center;">
          <h1>HomeEase API Engine</h1>
          <p>The backend server is running successfully.</p>
          <a href="http://localhost:5173" style="color: #6366f1;">Go to Frontend</a>
        </div>
      </body>
    </html>
  `);
});

app.use((req, res, next) => {
  const AppError = require('./utils/AppError');
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Centralized error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack
    });
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong! Please try again later.'
      });
    }
  }
});

module.exports = app;
