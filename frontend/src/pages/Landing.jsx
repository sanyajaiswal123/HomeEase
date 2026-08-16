import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  Mail,
  CheckCircle,
  Car,
  Clock,
  Zap,
  Droplet,
  Wrench,
  Paintbrush,
  Snowflake,
  Search,
  MapPin,
  SearchIcon,
  Activity,
  Camera,
  Monitor,
  Box,
  Heart,
  Settings,
  Bug,
  LayoutGrid,
  Award
} from 'lucide-react';

export const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const [showMoreServices, setShowMoreServices] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/ai-diagnose');
    }
  };

  const faqs = [
    {
      q: 'How are the professionals verified?',
      a: 'Every professional undergoes a strict 5-step background check, including identity verification and skill assessments.'
    },
    {
      q: "What happens if I'm not satisfied?",
      a: "We offer a 100% satisfaction guarantee. If you're unhappy, we will send another professional to fix the issue for free."
    },
    {
      q: 'How does the AI diagnostic work?',
      a: 'Simply describe your issue, and our AI will analyze the problem, suggest the right service, and estimate the cost.'
    },
    {
      q: 'How do I know the professional visiting my home is trustworthy?',
      a: 'All HomeEase professionals undergo identity verification, background checks, and skill assessments before joining the platform. You can also view ratings, reviews, and completed jobs before booking.'
    },
    {
      q: 'Can I cancel or reschedule my booking?',
      a: 'Yes. You can easily cancel or reschedule your booking from the "My Bookings" section. Cancellation policies may vary depending on how close the service time is.'
    }
  ];

  const services = [
    {
      name: 'Electrician',
      desc: 'Electrical repairs, wiring, installations',
      price: '₹299',
      rating: '4.9',
      reviews: '12,450',
      eta: '20 mins',
      img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Plumbing',
      desc: 'Leakages, blockages, fittings',
      price: '₹199',
      rating: '4.8',
      reviews: '15,200',
      eta: '30 mins',
      img: 'https://images.unsplash.com/photo-1607472586893-edb57cb31362?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'AC Servicing',
      desc: 'Repair, gas refill, deep cleaning',
      price: '₹499',
      rating: '4.9',
      reviews: '8,900',
      eta: '45 mins',
      img: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Home Cleaning',
      desc: 'Deep cleaning, sofa, bathroom',
      price: '₹999',
      rating: '4.9',
      reviews: '22,100',
      eta: 'Tomorrow',
      img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Carpentry',
      desc: 'Furniture assembly, repairs',
      price: '₹349',
      rating: '4.7',
      reviews: '5,400',
      eta: '60 mins',
      img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Painting',
      desc: 'Wall painting, touchups',
      price: '₹1999',
      rating: '4.8',
      reviews: '3,200',
      eta: 'Schedule',
      img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop'
    }
  ];

  const pills = [
    { icon: Zap, label: 'Electrician' },
    { icon: Droplet, label: 'Plumbing' },
    { icon: Sparkles, label: 'Cleaning' },
    { icon: Snowflake, label: 'AC Repair' },
    { icon: Paintbrush, label: 'Painting' },
    { icon: Wrench, label: 'Carpentry' }
  ];

  const moreServicesList = [
    { icon: Settings, label: 'Appliance Repair' },
    { icon: Bug, label: 'Pest Control' },
    { icon: Camera, label: 'CCTV Installation' },
    { icon: LayoutGrid, label: 'Curtain Cleaning' },
    { icon: SearchIcon, label: 'Home Inspection' },
    { icon: Box, label: 'Deep Cleaning' }
  ];

  return (
    <div className="flex flex-col w-full bg-white selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Deep Teal Animated Hero Section */}
      <section className="relative w-full pt-24 pb-20 md:pt-28 md:pb-32 px-6 overflow-hidden bg-gradient-to-br from-[#042F2E] via-[#053D3B] to-[#042F2E]">
        {/* Subtle Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_6s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-teal-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>

          <svg
            className="absolute w-full h-full opacity-10"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,200 C300,100 600,300 1440,50 C1440,50 1440,800 1440,800 L0,800 Z"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="1.5"
              className="animate-[pulse_10s_ease-in-out_infinite]"
            />
            <path
              d="M-200,400 C200,200 800,500 1600,200"
              fill="none"
              stroke="#5EEAD4"
              strokeWidth="1"
              opacity="0.4"
              className="animate-[pulse_12s_ease-in-out_infinite_reverse]"
            />
          </svg>

          <div className="absolute top-1/2 left-10 w-2 h-2 rounded-full bg-teal-400/50 animate-[bounce_3s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/4 right-20 w-3 h-3 rounded-full bg-primary/40 animate-[bounce_4s_ease-in-out_infinite_0.5s]"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-white/30 animate-[bounce_5s_ease-in-out_infinite_1s]"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-10">
          {/* Left Content (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col items-start text-left lg:pt-4 animate-fade-in z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-primary-light font-bold text-xs tracking-wider mb-6 hover:bg-white/20 transition-colors cursor-default shadow-sm backdrop-blur-sm">
              <Sparkles size={14} className="animate-pulse" /> PREMIUM HOME SERVICES
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.75rem] font-extrabold leading-[1.05] tracking-tight text-white font-outfit mb-6">
              Home Services <br />
              Made{' '}
              <span className="text-primary-light inline-block hover:scale-105 transition-transform duration-300">
                Easy.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-teal-50/80 leading-relaxed font-medium mb-10 max-w-lg">
              Book trusted, verified professionals for all your home needs in minutes with AI
              assistance.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() => navigate('/services')}
                className="px-8 py-3.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-hover hover:scale-105 transition-all shadow-lg hover:shadow-primary/30"
              >
                Book a Service
              </button>
              <button
                onClick={() => navigate('/services')}
                className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-full font-bold text-sm hover:bg-white hover:text-primary transition-all shadow-md backdrop-blur-sm"
              >
                Explore Services
              </button>
            </div>

            {/* Premium Search Bar */}
            <form
              onSubmit={handleSearch}
              className="w-full relative bg-white rounded-[24px] p-2 flex items-center shadow-2xl transition-all duration-300 mb-8 max-w-xl group focus-within:ring-4 focus-within:ring-primary/40 hover:shadow-primary/20"
            >
              <div className="flex items-center pl-5 pr-4 border-r border-gray-100 text-gray-700 font-bold gap-2 cursor-pointer hover:text-primary transition-colors py-2">
                <MapPin size={18} className="text-primary" />
                <span className="text-sm whitespace-nowrap">Delhi, India</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 flex items-center relative px-4">
                <Search
                  size={20}
                  className="text-gray-400 group-focus-within:text-primary transition-colors"
                />
                <input
                  type="text"
                  placeholder="Search for a service..."
                  className="w-full pl-3 pr-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none font-medium text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="h-14 w-14 rounded-[20px] bg-primary text-white flex items-center justify-center hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
              >
                <ArrowRight size={22} />
              </button>
            </form>

            {/* Service Category Pills - Simplified */}
            <div className="flex flex-wrap items-center gap-3 w-full mb-12">
              {pills.map((pill, idx) => (
                <button
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-white/10 hover:bg-white text-white hover:text-primary text-sm font-bold transition-all duration-300 shadow-sm border border-white/20 hover:border-transparent hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm group"
                >
                  <pill.icon
                    size={16}
                    className="text-white group-hover:text-primary transition-colors"
                  />{' '}
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Premium Stats Row */}
            <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-8 border-t border-white/10 w-full">
              <div className="flex flex-col gap-1.5 group cursor-default">
                <div className="flex items-center gap-2 text-white font-extrabold text-2xl group-hover:scale-105 transition-transform">
                  <Sparkles size={20} className="text-primary-light" /> 100K+
                </div>
                <div className="text-teal-50/60 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Happy Customers
                </div>
              </div>
              <div className="flex flex-col gap-1.5 group cursor-default">
                <div className="flex items-center gap-2 text-white font-extrabold text-2xl group-hover:scale-105 transition-transform">
                  <ShieldCheck size={20} className="text-primary-light" /> 15K+
                </div>
                <div className="text-teal-50/60 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Verified Pros
                </div>
              </div>
              <div className="flex flex-col gap-1.5 group cursor-default">
                <div className="flex items-center gap-2 text-white font-extrabold text-2xl group-hover:scale-105 transition-transform">
                  <Activity size={20} className="text-primary-light" /> 500K+
                </div>
                <div className="text-teal-50/60 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Jobs Completed
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Container (55%) - Uncropped */}
          <div className="w-full lg:w-[55%] flex items-center justify-center mt-12 lg:mt-0 z-20">
            <div
              className="relative w-full max-w-[800px] aspect-[4/3] group animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              {/* Premium rounded container ensuring uncropped full image */}
              <div className="w-full h-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border-4 lg:border-8 border-white/10 bg-white/5 backdrop-blur-sm">
                <img
                  src="/images/hero-electrician.jpg"
                  alt="Professional technician helping customer"
                  className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>

              {/* Floating Verified Badge - Moved to Bottom Right */}
              <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:-right-8 bg-white/95 backdrop-blur-md rounded-[20px] p-4 flex items-center gap-4 shadow-2xl z-30 w-max hover:-translate-y-2 transition-transform duration-300 border border-white/50">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 20}&backgroundColor=f1f5f9`}
                      alt="user"
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                    />
                  ))}
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-gray-900 font-extrabold text-sm">
                    Verified Professional
                  </span>
                  <span className="text-text-secondary text-[11px] font-medium leading-tight mt-0.5">
                    Background Checked
                  </span>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500 ml-1">
                  <ShieldCheck size={20} className="fill-green-100" />
                </div>
              </div>

              {/* Floating Rating Badge - Moved Top Left */}
              <div className="absolute top-10 -left-6 lg:-left-12 bg-white/95 backdrop-blur-md rounded-[20px] p-4 flex flex-col gap-1 shadow-2xl z-30 w-max hover:-translate-y-2 transition-transform duration-300 border border-white/50">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-extrabold text-xl text-gray-900">4.9</span>
                </div>
                <span className="text-text-secondary text-[11px] font-bold uppercase tracking-wider">
                  Rating
                </span>
              </div>

              {/* Floating Arrival Badge - Moved Top Right */}
              <div className="absolute top-10 -right-6 lg:-right-10 bg-primary text-white rounded-[20px] p-4 flex items-center gap-4 shadow-2xl z-30 w-max hover:-translate-y-2 transition-transform duration-300 border border-primary-light/30">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
                <div className="flex flex-col pr-2">
                  <span className="font-extrabold text-lg leading-tight">20 mins</span>
                  <span className="text-white/80 text-[11px] font-bold uppercase tracking-wider mt-0.5">
                    Avg Arrival
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Photo-centric Service Cards */}
      <section className="pt-24 pb-32 px-6 bg-white w-full relative z-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 font-outfit mb-2">
                Popular Services
              </h2>
            </div>
            <Link
              to="/services"
              className="hidden md:flex text-primary font-bold hover:text-primary-hover items-center gap-1 group transition-colors text-sm"
            >
              View all services{' '}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {services.slice(0, 6).map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[16px] border border-gray-100 overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="relative w-full h-40 overflow-hidden bg-gray-100">
                  <img
                    src={service.img}
                    alt={service.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-[1.05] transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center text-primary shadow-sm">
                    {idx === 0 && <Zap size={16} />}
                    {idx === 1 && <Droplet size={16} />}
                    {idx === 2 && <Snowflake size={16} />}
                    {idx === 3 && <Sparkles size={16} />}
                    {idx === 4 && <Wrench size={16} />}
                    {idx === 5 && <Paintbrush size={16} />}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 bg-white">
                  <h3 className="font-extrabold text-lg font-outfit text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3 text-xs font-bold text-gray-900">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span>{service.rating}</span>
                    <span className="text-gray-400 font-medium">
                      ({service.reviews.replace('00', 'K+')})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-text-secondary font-medium">
                      Starting at{' '}
                      <span className="font-bold text-gray-900 text-sm ml-0.5">
                        {service.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4 text-xs font-semibold text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {service.eta}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full rounded-lg shadow-sm py-2 font-bold mt-auto group-hover:bg-primary-hover transition-colors text-sm"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges row (like in the image) */}
      <section className="py-12 px-6 bg-white w-full border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified & Trusted',
              desc: 'All professionals are background checked'
            },
            { icon: Clock, title: 'On-Time Service', desc: 'Quick response & on-time arrival' },
            {
              icon: Award,
              title: 'Transparent Pricing',
              desc: 'No hidden charges, pay what you see'
            },
            { icon: MapPin, title: 'Live Tracking', desc: 'Track your service in real-time' },
            {
              icon: CheckCircle,
              title: 'Secure Payments',
              desc: '100% secure & cashless payments'
            },
            { icon: Heart, title: '24/7 Support', desc: "We're here to help you anytime" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <item.icon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                <span className="text-xs text-gray-500 font-medium leading-tight mt-0.5">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-24 px-6 bg-gray-50 border-t border-border-light w-full">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 font-outfit mb-5">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <button
                  className="w-full text-left px-8 py-6 flex justify-between items-center focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span className="font-bold text-gray-900 text-lg">{faq.q}</span>
                  <div
                    className={`transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}
                  >
                    <ChevronDown
                      size={24}
                      className={activeFaq === idx ? 'text-primary' : 'text-gray-400'}
                    />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-8 pb-6 text-text-secondary font-medium text-base border-t border-gray-100 pt-5 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
