import React from 'react';
import { Search, MousePointerClick, CalendarCheck, MapPin, ShieldCheck, Smile } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      icon: Search,
      title: 'Search for a Service',
      desc: 'Tell us what you need help with. Describe your issue or simply browse our categories.'
    },
    {
      id: 2,
      icon: MousePointerClick,
      title: 'Choose a Professional',
      desc: 'Compare verified professionals based on ratings, price, and distance. Pick the one that fits your needs.'
    },
    {
      id: 3,
      icon: CalendarCheck,
      title: 'Book an Appointment',
      desc: 'Select a convenient date and time. Get instant confirmation of your booking.'
    },
    {
      id: 4,
      icon: MapPin,
      title: 'Live Tracking',
      desc: "Track the professional's arrival in real-time on the map, just like a cab."
    },
    {
      id: 5,
      icon: ShieldCheck,
      title: 'OTP Verification',
      desc: 'Share the secure OTP with the professional before they start the work to ensure safety.'
    },
    {
      id: 6,
      icon: Smile,
      title: 'Service Complete',
      desc: 'Pay securely through the app and leave a review. Your satisfaction is guaranteed.'
    }
  ];

  return (
    <div className="bg-bg-secondary min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit mb-4">
            How HomeEase Works
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-medium">
            Getting your home sorted is now as simple as ordering food. Follow these simple steps to
            get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white rounded-3xl p-8 shadow-sm border border-border-light relative overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div className="text-[120px] font-black text-gray-50 absolute -right-4 -bottom-8 select-none z-0 group-hover:text-teal-50 transition-colors">
                {step.id}
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-teal-50 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-teal-100 group-hover:scale-110 transition-transform">
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed font-medium text-sm">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-primary rounded-[32px] p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-outfit mb-4 relative z-10">
            Ready to get started?
          </h2>
          <p className="text-teal-100 font-medium mb-8 max-w-xl mx-auto relative z-10">
            Join thousands of happy customers who trust HomeEase for their daily home needs.
          </p>
          <Button
            onClick={() => navigate('/services')}
            variant="secondary"
            className="rounded-xl px-8 py-4 font-extrabold text-lg shadow-lg relative z-10 hover:scale-105"
          >
            Explore Services
          </Button>
        </div>
      </div>
    </div>
  );
};
