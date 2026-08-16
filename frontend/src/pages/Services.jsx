import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Bug
} from 'lucide-react';
import Button from '../components/ui/Button';

export const Services = () => {
  const navigate = useNavigate();

  const servicesList = [
    {
      name: 'Electrician',
      desc: 'Electrical repairs, wiring, installations & panel upgrades',
      price: '₹299',
      rating: '4.9',
      reviews: '12.4K',
      eta: '20 mins',
      icon: Zap,
      img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Plumber',
      desc: 'Leakages, blockages, fittings, pipe installations',
      price: '₹199',
      rating: '4.8',
      reviews: '15.2K',
      eta: '30 mins',
      icon: Droplet,
      img: 'https://images.unsplash.com/photo-1607472586893-edb57cb31362?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Cleaning',
      desc: 'Sofa cleaning, bathroom deep cleaning, floor scrubbing',
      price: '₹499',
      rating: '4.9',
      reviews: '22.1K',
      eta: 'Tomorrow',
      icon: Sparkles,
      img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'AC Repair',
      desc: 'Gas refill, deep cleaning, component repair',
      price: '₹399',
      rating: '4.9',
      reviews: '8.9K',
      eta: '45 mins',
      icon: Snowflake,
      img: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Painting',
      desc: 'Wall painting, touchups, exterior painting',
      price: '₹1999',
      rating: '4.8',
      reviews: '3.2K',
      eta: 'Schedule',
      icon: Paintbrush,
      img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Carpentry',
      desc: 'Furniture assembly, custom fittings, repairs',
      price: '₹349',
      rating: '4.7',
      reviews: '5.4K',
      eta: '60 mins',
      icon: Wrench,
      img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Appliance Repair',
      desc: 'Washing machine, refrigerator, microwave service',
      price: '₹299',
      rating: '4.8',
      reviews: '6.1K',
      eta: '45 mins',
      icon: Settings,
      img: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Pest Control',
      desc: 'Termite, cockroach, ant & rodent control',
      price: '₹899',
      rating: '4.6',
      reviews: '4.3K',
      eta: 'Tomorrow',
      icon: Bug,
      img: 'https://images.unsplash.com/photo-1596440263301-443b7fbdf601?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Water Purifier',
      desc: 'RO installation, filter change, general service',
      price: '₹299',
      rating: '4.8',
      reviews: '7.8K',
      eta: '2 Hrs',
      icon: ShieldCheck,
      img: 'https://images.unsplash.com/photo-1634140026265-27a3c3d52674?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Deep Cleaning',
      desc: 'Full home deep cleaning, move-in/move-out',
      price: '₹2999',
      rating: '4.9',
      reviews: '9.1K',
      eta: 'Schedule',
      icon: Box,
      img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'CCTV Installation',
      desc: 'Setup, wiring, repairs for home security cameras',
      price: '₹999',
      rating: '4.7',
      reviews: '2.5K',
      eta: 'Tomorrow',
      icon: Camera,
      img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'RO Service',
      desc: 'Membrane change, motor repair, AMC',
      price: '₹499',
      rating: '4.8',
      reviews: '5.2K',
      eta: '3 Hrs',
      icon: ShieldCheck,
      img: 'https://images.unsplash.com/photo-1590425313904-7a33da6043af?q=80&w=800&auto=format&fit=crop'
    }
  ];

  return (
    <div className="bg-bg-secondary min-h-screen py-16 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit mb-4">
            All Home Services
          </h1>
          <p className="text-lg text-text-secondary font-medium">
            Book trusted, verified professionals for all your home needs. 100% satisfaction
            guaranteed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {servicesList.map((service, idx) => (
            <div
              key={idx}
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
                  <service.icon size={20} />
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-extrabold text-gray-900 font-outfit tracking-tight mb-2">
                  {service.name}
                </h3>
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
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="primary"
                    className="w-full py-3.5 rounded-xl text-sm font-bold shadow-md"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
