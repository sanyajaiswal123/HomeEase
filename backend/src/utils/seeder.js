const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const services = [
  {
    name: 'Electrical',
    description: 'Fix wiring, lights, switches, fuses, appliances, or resolve circuit trips.',
    icon: 'Zap',
    basePrice: 299,
    subServices: [
      {
        name: 'Fan Repair & Installation',
        price: 150,
        description: 'Fix regulator, condenser, motor noise, or mount fan.'
      },
      {
        name: 'Switchboard Replacement',
        price: 250,
        description: 'Install new modular switches and plates.'
      },
      {
        name: 'Fuse / MCB Trip Fix',
        price: 199,
        description: 'Detect overload points and replace burnt fuses.'
      }
    ]
  },
  {
    name: 'Plumbing',
    description: 'Resolve water leakages, pipeline blocks, taps, basins, and toilet flushing.',
    icon: 'Droplet',
    basePrice: 399,
    subServices: [
      {
        name: 'Tap / Mixer Repair',
        price: 149,
        description: 'Replace internal washers, spindles, or entire faucet.'
      },
      {
        name: 'Sink / Drain Unclogging',
        price: 299,
        description: 'Clear organic/mechanical waste blocking kitchen/bathroom lines.'
      },
      {
        name: 'Gizzer Repair & Fit',
        price: 499,
        description: 'Inspect heating element, thermostat, and water hoses.'
      }
    ]
  },
  {
    name: 'AC & Appliance',
    description: 'General cleaning, cooling checks, filter cleaning, and appliance servicing.',
    icon: 'Tv',
    basePrice: 499,
    subServices: [
      {
        name: 'Split AC Deep Cleaning',
        price: 599,
        description: 'Jet wash outdoor/indoor coil filters and drain trays.'
      },
      {
        name: 'Gas Leak Charging',
        price: 1500,
        description: 'Seal leakage points, vacuum line, and refill eco-refrigerant.'
      },
      {
        name: 'Washing Machine Repair',
        price: 450,
        description: 'Resolve drain pump, spin tub noise, or PCB errors.'
      }
    ]
  },
  {
    name: 'Cleaning',
    description: 'Deep sanitization, stain removal, kitchen, washroom, and upholstery vacuuming.',
    icon: 'Sparkles',
    basePrice: 299,
    subServices: [
      {
        name: 'Bathroom Deep Cleaning',
        price: 399,
        description: 'Descaling wall tiles, washbasin scrubbing, and toilet disinfection.'
      },
      {
        name: 'Kitchen Deep Cleaning',
        price: 999,
        description: 'Remove kitchen cabinet grease, chimney outer cleaning, and slab scrub.'
      },
      {
        name: 'Sofa Vacuum & Scrub',
        price: 499,
        description: 'Wet vacuum fabric seats to remove dirt, mud, and drink stains.'
      }
    ]
  },
  {
    name: 'Carpentry',
    description:
      'Repair broken wooden items, hinges, handles, cabinets, beds, and lock installations.',
    icon: 'Hammer',
    basePrice: 349,
    subServices: [
      {
        name: 'Hinge / Hydraulic Replacement',
        price: 120,
        description: 'Install soft-closing kitchen cabinet hydraulics.'
      },
      {
        name: 'Door Lock Installation',
        price: 350,
        description: 'Drill and mount secure mortise locks or cylinder locks.'
      },
      {
        name: 'Wooden Chair / Table Repair',
        price: 299,
        description: 'Re-glue loose joints, replace support bars, and nail adjustments.'
      }
    ]
  },
  {
    name: 'Painting',
    description:
      'Internal/external wall painting, textured wall finish, and damp repair treatment.',
    icon: 'Paintbrush',
    basePrice: 999,
    subServices: [
      {
        name: 'Single Accent Wall Texture',
        price: 1999,
        description: 'Apply designer royal play or custom trowel paint patterns.'
      },
      {
        name: 'Wall Dampness Waterproofing',
        price: 1499,
        description: 'Scrape salt scales, coat waterproof sealers, and re-putty surface.'
      }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homeease');
    console.log('DB connected for seeding.');

    // Clear old services
    await Service.deleteMany({});
    console.log('Old services removed.');

    // Insert new services
    const seededServices = await Service.insertMany(services);
    console.log(`Successfully seeded ${seededServices.length} service categories.`);

    // Create a default admin user if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'HomeEase Admin',
        email: 'admin@homeease.com',
        password: 'adminpassword123',
        phone: '9999999999',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Seeded default Admin User: admin@homeease.com / adminpassword123');
    }

    // Create a couple of default providers for testing
    const providerExists = await User.findOne({ role: 'provider' });
    if (!providerExists) {
      const electricService = seededServices.find((s) => s.name === 'Electrical');
      const plumbingService = seededServices.find((s) => s.name === 'Plumbing');

      const provider1 = new User({
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
          isAvailable: true,
          rating: 4.8
        }
      });
      await provider1.save();

      const provider2 = new User({
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
          isAvailable: true,
          rating: 4.9
        }
      });
      await provider2.save();

      console.log(
        'Seeded default Providers:\n- amit@homeease.com / password123\n- rajesh@homeease.com / password123'
      );
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
