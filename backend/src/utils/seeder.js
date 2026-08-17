const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Review = require('../models/Review');
const Setting = require('../models/Setting');
const dotenv = require('dotenv');

dotenv.config();

const services = [
  {
    name: 'Electrical',
    description: 'Fix wiring, lights, switches, fuses, appliances, or resolve circuit trips.',
    icon: 'Zap',
    basePrice: 299,
    subServices: [
      { name: 'Fan Repair & Installation', price: 150, description: 'Fix regulator, condenser, motor noise.' },
      { name: 'Switchboard Replacement', price: 250, description: 'Install new modular switches and plates.' },
      { name: 'Fuse / MCB Trip Fix', price: 199, description: 'Detect overload points and replace burnt fuses.' }
    ]
  },
  {
    name: 'Plumbing',
    description: 'Resolve water leakages, pipeline blocks, taps, basins, and toilet flushing.',
    icon: 'Droplet',
    basePrice: 399,
    subServices: [
      { name: 'Tap / Mixer Repair', price: 149, description: 'Replace internal washers, spindles, or faucet.' },
      { name: 'Sink / Drain Unclogging', price: 299, description: 'Clear waste blocking kitchen/bathroom lines.' },
      { name: 'Geyser Repair & Fit', price: 499, description: 'Inspect heating element and thermostat.' }
    ]
  },
  {
    name: 'AC & Appliance',
    description: 'General cleaning, cooling checks, filter cleaning, and appliance servicing.',
    icon: 'Tv',
    basePrice: 499,
    subServices: [
      { name: 'Split AC Deep Cleaning', price: 599, description: 'Jet wash outdoor/indoor coil filters.' },
      { name: 'Gas Leak Charging', price: 1500, description: 'Seal leakage points and refill gas.' },
      { name: 'Washing Machine Repair', price: 450, description: 'Resolve drain pump or PCB errors.' }
    ]
  },
  {
    name: 'Cleaning',
    description: 'Deep sanitization, stain removal, kitchen, washroom, and upholstery vacuuming.',
    icon: 'Sparkles',
    basePrice: 299,
    subServices: [
      { name: 'Bathroom Deep Cleaning', price: 399, description: 'Descaling wall tiles and washbasin scrubbing.' },
      { name: 'Kitchen Deep Cleaning', price: 999, description: 'Remove kitchen cabinet grease and chimney scrub.' }
    ]
  },
  {
    name: 'Carpentry',
    description: 'Repair wooden items, hinges, handles, cabinets, beds, and lock installations.',
    icon: 'Hammer',
    basePrice: 349,
    subServices: [
      { name: 'Door Lock Installation', price: 350, description: 'Mount secure mortise locks.' },
      { name: 'Wooden Chair / Table Repair', price: 299, description: 'Re-glue loose joints and support bars.' }
    ]
  },
  {
    name: 'Painting',
    description: 'Internal/external wall painting, textured wall finish, and damp repair treatment.',
    icon: 'Paintbrush',
    basePrice: 999,
    subServices: [
      { name: 'Single Accent Wall Texture', price: 1999, description: 'Apply designer royal play paint patterns.' },
      { name: 'Wall Dampness Waterproofing', price: 1499, description: 'Scrape salt scales and apply sealer.' }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homeease');
    console.log('Connected to MongoDB for full marketplace seeding...');

    // Clear old services
    await Service.deleteMany({});
    const seededServices = await Service.insertMany(services);
    console.log(`Seeded ${seededServices.length} Service Categories.`);

    // 1. Ensure Admin User
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = new User({
        name: 'HomeEase Admin',
        email: 'admin@homeease.com',
        password: 'adminpassword123',
        phone: '9999999999',
        role: 'admin'
      });
    } else {
      admin.password = 'adminpassword123';
    }
    await admin.save();
    console.log('Admin User set: admin@homeease.com / adminpassword123');

    // 2. Seed Customers
    let customer1 = await User.findOne({ email: 'customer1@homeease.com' });
    if (!customer1) {
      customer1 = await User.create({
        name: 'Rohan Sharma',
        email: 'customer1@homeease.com',
        password: 'password123',
        phone: '9876543210',
        role: 'customer',
        address: { street: 'Connaught Place', city: 'New Delhi', zipCode: '110001' }
      });
    }

    let customer2 = await User.findOne({ email: 'customer2@homeease.com' });
    if (!customer2) {
      customer2 = await User.create({
        name: 'Priya Verma',
        email: 'customer2@homeease.com',
        password: 'password123',
        phone: '9876543211',
        role: 'customer',
        address: { street: 'Sector 62', city: 'Noida', zipCode: '201301' }
      });
    }

    // 3. Seed Verified Providers
    const electricService = seededServices.find((s) => s.name === 'Electrical');
    const plumbingService = seededServices.find((s) => s.name === 'Plumbing');
    const acService = seededServices.find((s) => s.name === 'AC & Appliance');

    let provider1 = await User.findOne({ email: 'amit@homeease.com' });
    if (!provider1) {
      provider1 = await User.create({
        name: 'Amit Sharma (Electrician)',
        email: 'amit@homeease.com',
        password: 'password123',
        phone: '8888888888',
        role: 'provider',
        address: { street: 'Main Block', city: 'New Delhi', coordinates: [77.209, 28.613] },
        providerDetails: {
          serviceCategory: electricService._id,
          experience: 5,
          hourlyRate: 350,
          isVerified: true,
          verificationStatus: 'approved',
          isAvailable: true,
          rating: 4.8,
          documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'
        }
      });
    }

    let provider2 = await User.findOne({ email: 'rajesh@homeease.com' });
    if (!provider2) {
      provider2 = await User.create({
        name: 'Rajesh Kumar (Plumber)',
        email: 'rajesh@homeease.com',
        password: 'password123',
        phone: '7777777777',
        role: 'provider',
        address: { street: 'Sector 4', city: 'Noida', coordinates: [77.391, 28.535] },
        providerDetails: {
          serviceCategory: plumbingService._id,
          experience: 8,
          hourlyRate: 400,
          isVerified: true,
          verificationStatus: 'approved',
          isAvailable: true,
          rating: 4.9,
          documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'
        }
      });
    }

    // 4. Seed Pending Verification Provider (for KYC Hub test)
    let pendingProvider = await User.findOne({ email: 'vikram.kyc@homeease.com' });
    if (!pendingProvider) {
      pendingProvider = await User.create({
        name: 'Vikram Singh (HVAC Tech)',
        email: 'vikram.kyc@homeease.com',
        password: 'password123',
        phone: '9811223344',
        role: 'provider',
        address: { street: 'Cyber Hub', city: 'Gurugram', zipCode: '122002' },
        providerDetails: {
          serviceCategory: acService._id,
          experience: 4,
          hourlyRate: 450,
          isVerified: false,
          verificationStatus: 'pending',
          isAvailable: true,
          rating: 5,
          documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          aiSummary: 'Aadhaar Card & ITI Refrigeration Certificate submitted. Verified background.'
        }
      });
      console.log('Seeded Pending Provider for KYC verification testing.');
    }

    // 5. Seed System Settings
    await Setting.findOneAndUpdate(
      { key: 'global_config' },
      {
        platformCommission: 20,
        cancellationFeePercent: 10,
        emergencyServiceFee: 150,
        maintenanceMode: false,
        contactSupportEmail: 'support@homeease.com',
        contactSupportPhone: '+91 98765 43210'
      },
      { upsert: true }
    );

    // 6. Seed Sample Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      const b1 = await Booking.create({
        customer: customer1._id,
        provider: provider1._id,
        service: electricService._id,
        subServicesSelected: ['Fan Repair & Installation'],
        scheduledDate: new Date(),
        status: 'completed',
        totalAmount: 449,
        paymentStatus: 'paid',
        address: customer1.address,
        otp: '4829',
        trackingLog: [{ status: 'completed', timestamp: Date.now() }]
      });

      const b2 = await Booking.create({
        customer: customer2._id,
        provider: provider2._id,
        service: plumbingService._id,
        subServicesSelected: ['Sink / Drain Unclogging'],
        scheduledDate: new Date(),
        status: 'accepted',
        totalAmount: 698,
        paymentStatus: 'paid',
        address: customer2.address,
        otp: '1294',
        trackingLog: [{ status: 'accepted', timestamp: Date.now() }]
      });

      // Review
      await Review.create({
        booking: b1._id,
        customer: customer1._id,
        provider: provider1._id,
        rating: 5,
        comment: 'Punctual and very efficient electrician! Fixed my ceiling fan within 20 mins.',
        sentiment: 'positive'
      });

      // Complaint
      await Complaint.create({
        user: customer2._id,
        booking: b2._id,
        subject: 'Provider delayed by 15 mins',
        description: 'The technician called and mentioned traffic delay. Please update ETA tracking.',
        priority: 'medium',
        status: 'open'
      });

      console.log('Seeded sample bookings, review, and complaint.');
    }

    console.log('Full marketplace seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
