import React from 'react';
import { Target, Users, ShieldCheck, Heart } from 'lucide-react';

export const About = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-bg-secondary py-20 px-6 text-center border-b border-border-light">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit tracking-tight mb-6">
            Redefining Home Services in India
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed font-medium">
            HomeEase was built with a simple mission: to empower millions of service professionals
            by delivering services at home in a way that has never been experienced before.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-primary/10 transform rotate-3 rounded-3xl"></div>
          <img
            src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop"
            alt="Our Story"
            className="rounded-3xl relative z-10 shadow-lg object-cover aspect-[4/3] w-full"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold text-gray-900 font-outfit mb-6">Our Story</h2>
          <p className="text-text-secondary leading-relaxed mb-6 font-medium">
            Founded in 2026, HomeEase started as a small idea to bridge the gap between skilled
            local professionals and customers looking for high-quality, reliable home services.
          </p>
          <p className="text-text-secondary leading-relaxed font-medium">
            We noticed that finding a reliable plumber, electrician, or cleaner was often a
            stressful experience involving multiple phone calls and uncertain pricing. We created
            HomeEase to standardize this process—bringing transparency, fair pricing, and AI-driven
            diagnostics into everyday home maintenance.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-900 text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center font-outfit mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              {
                icon: Target,
                title: 'Customer Obsession',
                desc: "We prioritize our customers' needs above all else, ensuring a seamless experience."
              },
              {
                icon: ShieldCheck,
                title: 'Trust & Safety',
                desc: 'Every professional is thoroughly background-checked. Safety is non-negotiable.'
              },
              {
                icon: Users,
                title: 'Empowering Pros',
                desc: 'We help professionals grow their business and increase their monthly earnings.'
              },
              {
                icon: Heart,
                title: 'Quality First',
                desc: 'We never compromise on the quality of service. Excellence is our standard.'
              }
            ].map((v, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary-light mb-6">
                  <v.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-b border-border-light">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '50+', label: 'Cities' },
            { num: '15,000+', label: 'Professionals' },
            { num: '1M+', label: 'Happy Customers' },
            { num: '4.8', label: 'Average Rating' }
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-primary font-outfit mb-2">
                {s.num}
              </div>
              <div className="text-gray-900 font-bold uppercase tracking-wider text-xs">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 font-outfit mb-16">
          Meet The Leadership
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          {[
            {
              name: 'Rahul Verma',
              role: 'CEO & Founder',
              img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop'
            },
            {
              name: 'Priya Sharma',
              role: 'Chief Operating Officer',
              img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop'
            },
            {
              name: 'Vikram Singh',
              role: 'Chief Technology Officer',
              img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop'
            }
          ].map((t, i) => (
            <div key={i} className="flex flex-col items-center">
              <img
                src={t.img}
                alt={t.name}
                className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white mb-4"
              />
              <h4 className="text-lg font-bold text-gray-900">{t.name}</h4>
              <p className="text-sm text-primary font-medium">{t.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
