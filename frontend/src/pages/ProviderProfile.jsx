import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import providerService from '../services/providerService';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  ShieldCheck,
  Award,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export const ProviderProfile = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await providerService.getProviderById(id);
        setProvider(res.data.provider);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <Skeleton.Card className="rounded-[24px]" />
      </div>
    );
  }

  if (!provider) {
    return (
      <EmptyState
        title="Provider not found"
        description="The professional you are looking for does not exist."
        className="max-w-xl mx-auto mt-10"
      />
    );
  }

  return (
    <div className="bg-bg-secondary min-h-screen pb-24">
      {/* Cover Image Header */}
      <div className="h-64 md:h-80 w-full relative">
        <img src={provider.coverImage} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          size="sm"
          className="absolute top-6 left-6 rounded-full border-none shadow-md bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-gray-900 transition-colors"
          icon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24 z-10">
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col md:flex-row gap-10">
          {/* Left Column: Photo & Quick Stats */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="relative mb-6">
              <img
                src={provider.photo}
                alt={provider.name}
                className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-8 border-white shadow-lg"
              />
              {provider.verifiedBadge && (
                <div className="absolute bottom-4 right-0 bg-white p-1 rounded-full shadow-md">
                  <CheckCircle size={32} className="text-primary fill-primary text-white" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 font-outfit tracking-tight mb-2 text-center">
              {provider.name}
            </h1>
            <p className="text-lg text-primary font-bold mb-6">{provider.serviceCategory} Expert</p>

            <div className="w-full bg-gray-50 rounded-2xl p-6 flex flex-col gap-4 border border-gray-100">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-500">Rating</span>
                <span className="text-gray-900 flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" /> {provider.rating} (
                  {provider.reviewsCount})
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-500">Completed Jobs</span>
                <span className="text-gray-900">{provider.completedJobs}+</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-500">Success Rate</span>
                <span className="text-success">{provider.successRate}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                if (serviceId) {
                  navigate(`/service/${serviceId}?providerId=${provider.id}`);
                } else {
                  alert('Please select a service first to book this provider.');
                }
              }}
              variant="primary"
              className="w-full mt-6 py-4 rounded-xl text-lg shadow-md font-bold"
            >
              Book Now - ₹{provider.startingPrice}
            </Button>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 flex flex-col gap-10">
            {/* About */}
            <section>
              <h2 className="text-2xl font-extrabold text-gray-900 font-outfit mb-4">About Me</h2>
              <p className="text-text-secondary leading-relaxed font-medium">{provider.about}</p>
            </section>

            {/* Badges */}
            <div className="grid grid-cols-2 gap-4">
              {provider.policeVerified && (
                <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Police Verified</strong>
                    <span className="text-xs text-gray-500 font-medium">ID Checked</span>
                  </div>
                </div>
              )}
              {provider.backgroundChecked && (
                <div className="flex items-center gap-3 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Background Checked</strong>
                    <span className="text-xs text-gray-500 font-medium">Clear record</span>
                  </div>
                </div>
              )}
            </div>

            {/* Skills & Certificates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-primary" /> Top Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-primary" /> Certificates
                </h3>
                <ul className="flex flex-col gap-3">
                  {provider.certificates.map((cert, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm font-medium text-text-secondary"
                    >
                      <CheckCircle size={16} className="text-success" /> {cert}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Time Slots (Dummy UI) */}
            <section className="bg-bg-alternate p-6 rounded-[24px] border border-primary-light/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> Next Available Slots
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {['Today, 4:00 PM', 'Tomorrow, 9:00 AM', 'Tomorrow, 2:00 PM'].map((slot, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-border-light px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm shrink-0 cursor-pointer hover:border-primary hover:text-primary transition-colors"
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-border-light pb-4">
                <h2 className="text-2xl font-extrabold text-gray-900 font-outfit">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" /> {provider.rating}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {provider.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex gap-5"
                  >
                    <img
                      src={review.authorPhoto}
                      alt={review.author}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <strong className="block text-gray-900 font-bold">{review.author}</strong>
                          <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? 'fill-yellow-500'
                                  : 'text-gray-200 fill-gray-200'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary font-medium leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
