const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./src/models/Service');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/homeease';

const servicesToSeed = [
  {
    name: 'Electrician',
    description: 'Professional electrical wiring, repairs, and installations.',
    basePrice: 499
  },
  {
    name: 'Plumbing',
    description: 'Expert plumbing solutions for leaks, blockages, and pipe repairs.',
    basePrice: 399
  },
  {
    name: 'House Cleaning',
    description: 'Standard house cleaning including sweeping, mopping, and dusting.',
    basePrice: 799
  },
  {
    name: 'AC Repair',
    description: 'AC servicing, gas refilling, and cooling issue repairs.',
    basePrice: 599
  },
  {
    name: 'Carpentry',
    description: 'Furniture assembly, repair, and custom woodwork.',
    basePrice: 350
  },
  {
    name: 'Painting',
    description: 'Interior and exterior wall painting and touch-ups.',
    basePrice: 1999
  },
  {
    name: 'Appliance Repair',
    description: 'Repairing household appliances like microwaves and ovens.',
    basePrice: 299
  },
  {
    name: 'Pest Control',
    description: 'Comprehensive pest control for termites, roaches, and rodents.',
    basePrice: 899
  },
  {
    name: 'CCTV Installation',
    description: 'Security camera installation and wiring.',
    basePrice: 1499
  },
  {
    name: 'Home Deep Cleaning',
    description: 'Intense deep cleaning of every corner, including bathrooms.',
    basePrice: 2499
  },
  {
    name: 'Water Purifier Service',
    description: 'Filter replacement and servicing for water purifiers.',
    basePrice: 449
  },
  {
    name: 'Sofa & Carpet Cleaning',
    description: 'Deep shampooing and vacuuming for sofas and carpets.',
    basePrice: 699
  },
  {
    name: 'Refrigerator Repair',
    description: 'Cooling issues, compressor repairs, and gas refilling.',
    basePrice: 499
  },
  {
    name: 'Washing Machine Repair',
    description: 'Drum repairs, drainage issues, and motor fixes.',
    basePrice: 399
  },
  {
    name: 'Geyser Repair',
    description: 'Thermostat fixes, element replacement, and leak repairs.',
    basePrice: 349
  },
  {
    name: 'RO Installation',
    description: 'New RO system installation and pipe setup.',
    basePrice: 499
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    for (const s of servicesToSeed) {
      await Service.findOneAndUpdate(
        { name: s.name },
        { $setOnInsert: s },
        { upsert: true, new: true }
      );
    }
    console.log('Successfully seeded 16 services.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
