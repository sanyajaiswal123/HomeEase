import React from 'react';
import { Briefcase, Wallet, Clock, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const BecomeProvider = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Wallet,
      title: 'Earn More',
      desc: 'Make up to ₹80,000+ per month. You keep 85% of what you earn, directly deposited every week.'
    },
    {
      icon: Clock,
      title: 'Flexible Hours',
      desc: 'Be your own boss. Choose your working hours, accept jobs when you want, and take time off anytime.'
    },
    {
      icon: ShieldCheck,
      title: 'Insurance Coverage',
      desc: 'Every job is insured up to ₹1,00,000 against accidental damages and medical emergencies.'
    },
    {
      icon: Star,
      title: 'Skill Development',
      desc: 'Get access to HomeEase Academy. Learn new skills, get certified, and increase your earnings.'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Expert Electrician',
      image:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
      quote:
        'Joining HomeEase was the best decision. I went from struggling to find work to having a fully booked calendar. My income has tripled.'
    },
    {
      name: 'Anita Desai',
      role: 'Professional Cleaner',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
      quote:
        'I love the flexibility. I can drop my kids at school and only accept jobs during the day. The weekly payouts are always on time.'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1200&auto=format&fit=crop"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-teal-300 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-primary/30">
            <Briefcase size={16} /> Partner Program
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-outfit mb-6">
            Turn your skills into <br className="hidden md:block" />{' '}
            <span className="text-primary">consistent income.</span>
          </h1>
          <p className="text-lg text-gray-300 font-medium mb-10 max-w-2xl">
            Join thousands of professionals across India who have grown their business and achieved
            financial independence with HomeEase.
          </p>
          <Button
            onClick={() => navigate('/auth?signup=true&role=provider')}
            variant="primary"
            className="text-lg px-10 py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-105"
          >
            Apply Now
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col items-start"
            >
              <div className="w-14 h-14 bg-teal-50 text-primary rounded-2xl flex items-center justify-center mb-6">
                <b.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
              <p className="text-text-secondary text-sm font-medium leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps & Requirements */}
      <section className="py-20 px-6 bg-bg-secondary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit mb-8">
              How to get started
            </h2>
            <div className="flex flex-col gap-8">
              {[
                {
                  step: '1',
                  title: 'Apply Online',
                  desc: 'Fill out a simple application form with your basic details and experience.'
                },
                {
                  step: '2',
                  title: 'Background Check',
                  desc: "Submit your KYC documents. We'll verify your identity and criminal record."
                },
                {
                  step: '3',
                  title: 'Skills Assessment',
                  desc: 'Complete a short virtual interview and a technical skills test.'
                },
                {
                  step: '4',
                  title: 'Start Earning',
                  desc: 'Get your HomeEase kit and start accepting jobs immediately!'
                }
              ].map((s, i) => (
                <div key={i} className="flex gap-6 relative">
                  {i !== 3 && (
                    <div className="absolute left-6 top-14 bottom-[-32px] w-0.5 bg-gray-200"></div>
                  )}
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-primary text-xl border-2 border-primary-light shadow-sm shrink-0 z-10">
                    {s.step}
                  </div>
                  <div className="pt-2">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h4>
                    <p className="text-text-secondary font-medium text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-white p-10 rounded-[32px] shadow-sm border border-border-light w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h3>
            <ul className="flex flex-col gap-4">
              {[
                'At least 2 years of professional experience',
                'Valid Government ID (Aadhaar/PAN)',
                'No criminal background',
                'Smartphone with internet connection',
                'Bank account in your name'
              ].map((req, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                  <ShieldCheck size={20} className="text-success shrink-0" /> {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 font-outfit mb-12">
          Hear from our partners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
            >
              <div className="flex gap-4 items-center mb-6">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{t.name}</h4>
                  <span className="text-sm text-primary font-medium">{t.role}</span>
                </div>
              </div>
              <p className="text-gray-600 italic leading-relaxed text-sm">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-primary text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white font-outfit mb-6">
          Ready to join the team?
        </h2>
        <p className="text-teal-100 font-medium mb-10 max-w-xl mx-auto">
          Registration takes less than 5 minutes. Start your journey today.
        </p>
        <Button
          onClick={() => navigate('/auth?signup=true&role=provider')}
          variant="secondary"
          className="text-primary font-bold px-10 py-4 rounded-xl text-lg hover:scale-105 shadow-lg"
        >
          Apply Now
        </Button>
      </section>
    </div>
  );
};
