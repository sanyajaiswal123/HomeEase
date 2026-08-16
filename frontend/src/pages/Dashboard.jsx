import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../config/constants';
import { SERVICE_UI_META, DEFAULT_UI_META } from '../constants/serviceUIMeta';
import {
  Search,
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Flame,
  ShieldAlert,
  Calendar,
  X
} from 'lucide-react';

import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

const FILTERS = ['All', 'Popular', 'Nearby', 'Top Rated', 'Most Booked', 'Emergency', 'Newest'];
const POPULAR_SEARCHES = ['AC Repair', 'Plumbing', 'Deep Cleaning', 'Electrician'];

export const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(API_ENDPOINTS.SERVICES);
      setServices(res.data.data.services);
    } catch (err) {
      setError(err);
      console.error('Error fetching services:', err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter logic handled natively on frontend
  const filteredServices = services.filter((service) => {
    const meta = SERVICE_UI_META[service.name] || DEFAULT_UI_META;

    // Search match
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category match
    if (activeFilter === 'All') return true;
    return meta.tags.includes(activeFilter);
  });

  const recommendedServices = services
    .filter((s) => {
      const meta = SERVICE_UI_META[s.name] || DEFAULT_UI_META;
      return meta.tags.includes('Most Booked') || meta.tags.includes('Popular');
    })
    .slice(0, 3); // Top 3

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* 1. Global Search Hero Area */}
      <section className="pt-16 pb-12 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit tracking-tight mb-4">
          What do you need help with?
        </h1>
        <p className="text-lg text-text-secondary font-medium mb-10 max-w-2xl">
          Book trusted, verified professionals for all your home needs. Instant booking, transparent
          pricing.
        </p>

        {/* 2. Massive Search Bar */}
        <div className="w-full md:w-[80%] lg:w-[70%] relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
            <Search size={24} />
          </div>
          <input
            type="text"
            className="w-full h-16 md:h-18 pl-16 pr-14 rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:shadow-[0_8px_30px_rgba(13,148,136,0.12)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg text-gray-900 transition-all font-medium placeholder-gray-400"
            placeholder="Search for services, professionals, or home problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Popular Searches */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="text-sm font-bold text-gray-500 py-2">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm font-bold text-gray-700 hover:bg-teal-50 hover:text-primary hover:border-teal-200 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Recommended Services (Only show if not searching) */}
      {!searchQuery && recommendedServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 font-outfit flex items-center gap-2">
              <Sparkles className="text-primary" size={24} /> Recommended For You
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedServices.map((service) => (
              <ServiceCard key={`rec-${service._id}`} service={service} />
            ))}
          </div>
        </section>
      )}

      {/* 3 & 7. Explore Services & Quick Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 font-outfit mb-6">
            Explore Services
          </h2>

          {/* Quick Filters */}
          <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${
                  activeFilter === filter
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Grid Layout */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
        ) : error ? (
          <RetryState error={error} onRetry={fetchServices} />
        ) : filteredServices.length === 0 ? (
          <EmptyState
            title="No services found"
            description="Try adjusting your search or selecting a different filter."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// 5. Card Design Component
const ServiceCard = ({ service }) => {
  const meta = SERVICE_UI_META[service.name] || DEFAULT_UI_META;

  return (
    <Link
      to={`/services/${service._id}/providers?serviceName=${service.name}`}
      className="block group h-full"
    >
      <div className="flex flex-col h-full bg-white rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(13,148,136,0.12)] transition-all duration-300">
        {/* Large Realistic Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={meta.image}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-extrabold text-gray-900">
              {meta.rating.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight mb-1">
            {service.name}
          </h3>

          <p className="text-sm text-text-secondary line-clamp-1 mb-4 font-medium">
            {service.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 mb-6">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
              <Clock size={14} className="text-primary" /> {meta.arrival}
            </div>
            {meta.tags.includes('Emergency') && (
              <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-md">
                <ShieldAlert size={14} /> Emergency
              </div>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div>
              <div className="text-[10px] text-text-secondary font-extrabold uppercase tracking-widest mb-0.5">
                Starting at
              </div>
              <div className="text-lg font-extrabold text-gray-900">₹{service.basePrice}</div>
            </div>

            <button className="bg-primary/10 text-primary font-bold px-5 py-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-sm flex items-center gap-2">
              Select Provider <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;
