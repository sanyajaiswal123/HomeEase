import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../config/constants';
import {
  Star,
  Clock,
  Zap,
  Droplet,
  Snowflake,
  Wrench,
  Paintbrush,
  ShieldCheck,
  Box,
  Settings,
  Camera,
  Bug,
  Sparkles,
  Search,
  MapPin,
  X,
  SlidersHorizontal
} from 'lucide-react';
import Button from '../components/ui/Button';

// Default Icon Map
const ICON_MAP = {
  Electrical: Zap,
  Electrician: Zap,
  Plumbing: Droplet,
  Plumber: Droplet,
  Cleaning: Sparkles,
  'House Cleaning': Sparkles,
  'Deep Cleaning': Box,
  'AC & Appliance': Snowflake,
  'AC Repair': Snowflake,
  'Appliance Repair': Settings,
  Painting: Paintbrush,
  Carpentry: Wrench,
  Carpenter: Wrench,
  'Pest Control': Bug,
  'CCTV Installation': Camera,
  'Water Purifier': ShieldCheck,
  'RO Service': ShieldCheck
};

// Comprehensive Realistic Sample Services
const SAMPLE_SERVICES = [
  {
    _id: 'sample-electrician',
    name: 'Electrician',
    category: 'Electrical',
    desc: 'Electrical repairs, wiring, installations & panel upgrades by certified pros.',
    price: '₹299',
    basePrice: 299,
    rating: '4.9',
    reviews: '12.4K',
    eta: '20 mins',
    icon: Zap,
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-plumbing',
    name: 'Plumbing',
    category: 'Plumbing',
    desc: 'Leakages, pipe fittings, drain unblocking, faucet & geyser installation.',
    price: '₹199',
    basePrice: 199,
    rating: '4.8',
    reviews: '15.2K',
    eta: '30 mins',
    icon: Droplet,
    img: 'https://images.unsplash.com/photo-1607472586893-edb57cb31362?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-cleaning',
    name: 'Cleaning',
    category: 'Cleaning',
    desc: 'Sofa cleaning, bathroom deep sanitization, kitchen & floor scrubbing.',
    price: '₹499',
    basePrice: 499,
    rating: '4.9',
    reviews: '22.1K',
    eta: 'Tomorrow',
    icon: Sparkles,
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-ac-repair',
    name: 'AC Repair',
    category: 'AC & Appliance',
    desc: 'Gas refilling, jet wash deep cleaning, noise fix & compressor repair.',
    price: '₹399',
    basePrice: 399,
    rating: '4.9',
    reviews: '8.9K',
    eta: '45 mins',
    icon: Snowflake,
    img: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-appliance',
    name: 'Appliance Repair',
    category: 'AC & Appliance',
    desc: 'Washing machine, refrigerator, microwave oven & geyser service.',
    price: '₹299',
    basePrice: 299,
    rating: '4.8',
    reviews: '6.1K',
    eta: '45 mins',
    icon: Settings,
    img: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-painting',
    name: 'Painting',
    category: 'Painting',
    desc: 'Interior wall painting, texture finish, touchups & damp proofing.',
    price: '₹1,999',
    basePrice: 1999,
    rating: '4.8',
    reviews: '3.2K',
    eta: 'Schedule',
    icon: Paintbrush,
    img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-carpentry',
    name: 'Carpenter',
    category: 'Carpentry',
    desc: 'Furniture assembly, lock installation, cabinet repair & woodwork.',
    price: '₹349',
    basePrice: 349,
    rating: '4.7',
    reviews: '5.4K',
    eta: '60 mins',
    icon: Wrench,
    img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-pest-control',
    name: 'Pest Control',
    category: 'Pest Control',
    desc: 'Safe & odorless termite, cockroach, ant & rodent pest eradication.',
    price: '₹899',
    basePrice: 899,
    rating: '4.6',
    reviews: '4.3K',
    eta: 'Tomorrow',
    icon: Bug,
    img: 'https://images.unsplash.com/photo-1596440263301-443b7fbdf601?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-water-purifier',
    name: 'Water Purifier',
    category: 'AC & Appliance',
    desc: 'RO system installation, filter replacement, membrane check & repair.',
    price: '₹299',
    basePrice: 299,
    rating: '4.8',
    reviews: '7.8K',
    eta: '2 Hrs',
    icon: ShieldCheck,
    img: 'https://images.unsplash.com/photo-1634140026265-27a3c3d52674?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-deep-cleaning',
    name: 'Deep Cleaning',
    category: 'Cleaning',
    desc: 'Full home intensive deep cleaning, move-in/move-out sanitization.',
    price: '₹2,999',
    basePrice: 2999,
    rating: '4.9',
    reviews: '9.1K',
    eta: 'Schedule',
    icon: Box,
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-cctv',
    name: 'CCTV Installation',
    category: 'Electrical',
    desc: 'HD security camera setup, DVR configuration & wiring solutions.',
    price: '₹999',
    basePrice: 999,
    rating: '4.7',
    reviews: '2.5K',
    eta: 'Tomorrow',
    icon: Camera,
    img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop'
  },
  {
    _id: 'sample-ro-service',
    name: 'RO Service',
    category: 'AC & Appliance',
    desc: 'Filter cleaning, booster pump repair, TDS balancing & AMC plans.',
    price: '₹499',
    basePrice: 499,
    rating: '4.8',
    reviews: '5.2K',
    eta: '3 Hrs',
    icon: ShieldCheck,
    img: 'https://images.unsplash.com/photo-1590425313904-7a33da6043af?q=80&w=800&auto=format&fit=crop'
  }
];

const CATEGORY_TABS = [
  'All',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'AC & Appliance',
  'Painting',
  'Carpentry',
  'Pest Control'
];

export const Services = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { location: userLocation } = useContext(LocationContext);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [services, setServices] = useState(SAMPLE_SERVICES);
  const [loading, setLoading] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  // Load API services & merge with sample metadata
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(API_ENDPOINTS.SERVICES);
        const apiServices = res.data.data.services || [];

        if (apiServices.length > 0) {
          // Merge API services into list
          const merged = SAMPLE_SERVICES.map((sample) => {
            const matched = apiServices.find(
              (a) =>
                a.name.toLowerCase() === sample.name.toLowerCase() ||
                a.name.toLowerCase().includes(sample.name.toLowerCase()) ||
                sample.name.toLowerCase().includes(a.name.toLowerCase())
            );
            if (matched) {
              return {
                ...sample,
                _id: matched._id,
                name: matched.name,
                desc: matched.description || sample.desc,
                basePrice: matched.basePrice || sample.basePrice,
                price: `₹${matched.basePrice || sample.basePrice}`
              };
            }
            return sample;
          });
          setServices(merged);
        }
      } catch (err) {
        console.warn('API services fetch error (using fallback):', err.friendlyMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Filter logic
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      s.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      s.name.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleBookService = (service) => {
    const targetUrl = `/services/${service._id}/providers?serviceName=${encodeURIComponent(service.name)}`;
    if (!user) {
      navigate('/auth', { state: { redirect: targetUrl } });
    } else {
      navigate(targetUrl);
    }
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  return (
    <div className="bg-bg-secondary min-h-screen py-16 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-wider mb-4">
            <Sparkles size={14} /> TRUSTED HOME SERVICES IN {userLocation.toUpperCase()}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit mb-4 tracking-tight">
            All Home Services
          </h1>
          <p className="text-lg text-text-secondary font-medium">
            Book top-rated, background-checked professionals for all your home needs. 100% satisfaction guaranteed.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 mb-12 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services (e.g. Plumbing, Electrician, Cleaning)..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                const newParams = new URLSearchParams(searchParams);
                if (val) newParams.set('search', val);
                else newParams.delete('search');
                setSearchParams(newParams);
              }}
              className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-base transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200 w-full md:w-auto">
            <MapPin size={16} className="text-primary" />
            <span className="whitespace-nowrap">{userLocation}</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-3 mb-10 max-w-5xl mx-auto hide-scrollbar justify-start md:justify-center">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-[24px] p-12 text-center max-w-lg mx-auto border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-outfit mb-2">No Services Found</h3>
            <p className="text-sm text-text-secondary font-medium mb-6">
              We couldn't find any services matching "{searchQuery || selectedCategory}". Try clearing your search or filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSearchParams({});
              }}
              variant="secondary"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredServices.map((service) => {
              const ServiceIcon = service.icon || ICON_MAP[service.name] || Sparkles;
              return (
                <div
                  key={service._id}
                  className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden group hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(13,148,136,0.15)] transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                    <img
                      src={service.img}
                      alt={service.name}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm text-sm font-extrabold text-gray-900">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      {service.rating}
                    </div>
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center text-primary shadow-sm">
                      <ServiceIcon size={20} />
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight">
                        {service.name}
                      </h3>
                    </div>

                    <p className="text-sm text-text-secondary line-clamp-2 mb-6 font-medium">
                      {service.desc}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-bold text-gray-600 mb-6">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-md">
                        <Clock size={14} className="text-primary" /> {service.eta}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        {service.reviews} reviews
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-4">
                      <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                        <div>
                          <div className="text-[10px] text-text-secondary font-extrabold uppercase tracking-widest mb-0.5">
                            Starting at
                          </div>
                          <div className="text-lg font-extrabold text-gray-900">{service.price}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleBookService(service)}
                          variant="primary"
                          className="w-full py-3 rounded-xl text-sm font-bold shadow-md"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
