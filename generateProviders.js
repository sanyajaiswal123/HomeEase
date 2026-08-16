const fs = require('fs');
const path = require('path');

const services = [
  'Electrician', 'Plumbing', 'House Cleaning', 'AC Repair', 'Carpentry',
  'Painting', 'Appliance Repair', 'Pest Control', 'CCTV Installation',
  'Home Deep Cleaning', 'Water Purifier Service', 'Sofa & Carpet Cleaning',
  'Refrigerator Repair', 'Washing Machine Repair', 'Geyser Repair', 'RO Installation'
];

const maleNames = ["Rajesh Kumar", "Amit Singh", "Suresh Sharma", "Vikram Patel", "Rahul Verma", "Deepak Gupta", "Sunil Yadav", "Ravi Teja", "Manoj Tiwari", "Anil Reddy"];
const femaleNames = ["Priya Sharma", "Anita Desai", "Sunita Rao", "Kavita Singh", "Pooja Mishra", "Sneha Joshi", "Neha Kapoor", "Aarti Patel", "Meena Kumari", "Ritu Jain"];

const malePhotos = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
];

const femalePhotos = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598550874175-4d0ef43ce418?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
];

const locations = ["Connaught Place", "Green Park", "Hauz Khas", "Dwarka", "Vasant Kunj", "Saket", "Lajpat Nagar", "Karol Bagh"];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = (prob = 0.5) => Math.random() < prob;

const providers = [];

for (let i = 1; i <= 40; i++) {
  const isFemale = randomBool(0.3); // 30% female
  const name = isFemale ? randomItem(femaleNames) : randomItem(maleNames);
  const photo = isFemale ? randomItem(femalePhotos) : randomItem(malePhotos);
  const service = randomItem(services);

  providers.push({
    id: `prov_${i.toString().padStart(3, '0')}`,
    name: name,
    photo: photo,
    coverImage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop",
    serviceCategory: service,
    experienceYears: randomInt(2, 15),
    rating: parseFloat(randomFloat(4.0, 5.0)),
    reviewsCount: randomInt(10, 800),
    completedJobs: randomInt(50, 3000),
    startingPrice: randomInt(199, 1500),
    location: randomItem(locations),
    distance: parseFloat(randomFloat(1.0, 15.0)),
    languages: randomBool(0.7) ? ["English", "Hindi"] : ["Hindi"],
    availability: randomBool(0.8) ? "Available Today" : "Available Tomorrow",
    verifiedBadge: true,
    policeVerified: true,
    backgroundChecked: randomBool(0.9),
    about: `Hi, I am ${name}. I have over ${randomInt(2, 15)} years of experience in ${service}. I pride myself on providing top-quality service, being punctual, and ensuring 100% customer satisfaction. I have completed hundreds of jobs with great feedback.`,
    skills: [service, "Customer Service", "Punctual", randomItem(["Advanced Tools", "Safety First", "Deep Cleaning"])],
    certificates: ["Urban Pro Certified", "Background Cleared"],
    responseTime: `${randomInt(5, 30)} mins`,
    estimatedArrivalTime: `${randomInt(30, 90)} mins`,
    successRate: `${randomInt(90, 100)}%`,
    cancellationRate: `${randomInt(0, 5)}%`,
    customerSatisfaction: `${randomInt(90, 100)}%`,
    todayAvailability: randomBool(0.8),
    reviews: [
      {
        id: `rev_${i}_1`,
        author: randomItem(["Ankit Verma", "Smriti Irani", "Rahul Gandhi", "Narendra Modi"]),
        authorPhoto: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
        date: "2 days ago",
        rating: 5,
        comment: "Very professional. Arrived on time. Solved my issue quickly."
      },
      {
        id: `rev_${i}_2`,
        author: randomItem(["Vikas Khanna", "Neha Dhupia", "Karan Johar"]),
        authorPhoto: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop",
        date: "1 week ago",
        rating: randomInt(4, 5),
        comment: "Very polite. Highly recommended."
      }
    ]
  });
}

const dir = path.join(__dirname, 'frontend', 'src', 'data');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const fileContent = `// DO NOT EDIT - AUTOGENERATED DUMMY DATA FOR PROVIDERS
export const DUMMY_PROVIDERS = ${JSON.stringify(providers, null, 2)};
`;

fs.writeFileSync(path.join(dir, 'dummyProviders.js'), fileContent);
console.log('Successfully generated frontend/src/data/dummyProviders.js');
