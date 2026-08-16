import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import providerService from '../services/providerService';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Filter,
  ArrowLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';

export const ProviderList = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceName = searchParams.get('serviceName') || 'Service';
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState('Top Rated');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const filters = { verifiedOnly };
      // If user typed a search query, use global search, otherwise filter by service
      let res;
      if (searchQuery) {
        res = await providerService.searchProviders(searchQuery);
        // If we are on a specific service page, we could further filter the search results, but global is fine
      } else {
        res = await providerService.getProvidersByService(serviceName, filters, sortBy);
      }
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line
  }, [serviceName, sortBy, verifiedOnly, searchQuery]);

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header Area */}
      <section className="bg-bg-secondary pt-12 pb-16 border-b border-border-light relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            size="sm"
            className="mb-8 rounded-full border-border-light shadow-sm bg-white"
            icon={<ArrowLeft size={16} />}
          >
            Back to Dashboard
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit tracking-tight mb-4">
            Select a Professional
          </h1>
          <p className="text-lg text-text-secondary font-medium mb-0">
            Showing top-rated {serviceName} experts near you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {/* Filters Toolbar */}
        <div className="bg-white p-4 md:p-6 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="flex-1 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              wrapperClassName="mb-0"
              className="bg-gray-50 border-none shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              Verified Only
            </label>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-primary focus:border-primary block p-2.5 outline-none"
              >
                <option>Top Rated</option>
                <option>Nearest</option>
                <option>Lowest Price</option>
                <option>Most Experienced</option>
                <option>Most Booked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            title="No professionals found"
            description="Try adjusting your filters or search query."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} serviceId={serviceId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ProviderCard = ({ provider, serviceId }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(13,148,136,0.12)] transition-all duration-300 relative">
      {/* Top Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center p-4">
        {/* We use the photo as an avatar overlay over a gradient background to mimic Urban Company's clean look */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-bg-secondary z-0"></div>
        <img
          src={provider.photo}
          alt={provider.name}
          loading="lazy"
          className="w-32 h-32 rounded-full object-cover shadow-md z-10 border-4 border-white group-hover:scale-105 transition-transform duration-500"
        />
        {provider.verifiedBadge && (
          <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-md shadow-sm flex items-center gap-1 z-20">
            <CheckCircle size={14} className="text-primary" />
            <span className="text-[10px] font-extrabold uppercase text-primary">Verified</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight mb-1">
            {provider.name}
          </h3>
          <p className="text-sm text-text-secondary font-medium">{provider.serviceCategory}</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-5 border-b border-gray-100 pb-5">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 font-extrabold text-gray-900">
              <Star size={14} className="text-yellow-500 fill-yellow-500" /> {provider.rating}
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">
              {provider.reviewsCount} Reviews
            </span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 font-extrabold text-gray-900">
              <Briefcase size={14} className="text-primary" /> {provider.experienceYears}y
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Experience</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs font-bold text-gray-600 mb-6 flex-grow">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" /> {provider.distance} km away
            </span>
            <span className="text-gray-900 font-extrabold">{provider.completedJobs}+ jobs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" /> Arrival
            </span>
            <span className="text-gray-900 font-extrabold">{provider.estimatedArrivalTime}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] text-text-secondary font-extrabold uppercase tracking-widest">
              Starting at
            </span>
            <strong className="text-lg font-extrabold text-gray-900">
              ₹{provider.startingPrice}
            </strong>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/services/provider/${provider.id}?serviceId=${serviceId}`}
              className="flex-1"
            >
              <Button
                variant="secondary"
                className="w-full rounded-xl py-2.5 text-sm font-bold shadow-sm"
              >
                View Profile
              </Button>
            </Link>
            <Link to={`/service/${serviceId}?providerId=${provider.id}`} className="flex-1">
              <Button
                variant="primary"
                className="w-full rounded-xl py-2.5 text-sm font-bold shadow-sm"
              >
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
