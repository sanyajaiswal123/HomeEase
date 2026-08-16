const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeease';

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const adminExists = await User.findOne({ email: 'admin@homeease.com' });
    if (adminExists) {
      console.log('Admin user already exists. Email: admin@homeease.com');
      process.exit(0);
    }

    const newAdmin = await User.create({
      name: 'System Admin',
      email: 'admin@homeease.com',
      password: 'password123',
      role: 'admin',
      phone: '1234567890'
    });

    console.log('Successfully created Admin account!');
    console.log('Email: admin@homeease.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
