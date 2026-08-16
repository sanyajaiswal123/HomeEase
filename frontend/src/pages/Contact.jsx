import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="bg-bg-secondary min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-text-secondary font-medium">
            We're here to help. Get in touch with our support team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-border-light">
          {/* Contact Info */}
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Get in Touch</h2>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-primary shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Head Office</h4>
                <p className="text-text-secondary text-sm leading-relaxed font-medium mt-1">
                  HomeEase Technologies Pvt. Ltd.
                  <br />
                  123 Tech Park, Phase 1, Whitefield
                  <br />
                  Bengaluru, Karnataka, India - 560066
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-primary shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Phone</h4>
                <p className="text-text-secondary text-sm font-medium mt-1">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-primary shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Email</h4>
                <p className="text-text-secondary text-sm font-medium mt-1">support@homeease.com</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-primary shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Working Hours</h4>
                <p className="text-text-secondary text-sm font-medium mt-1">
                  Monday–Saturday: 8:00 AM – 9:00 PM
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" required />
                <Input label="Last Name" placeholder="Doe" required />
              </div>
              <Input label="Email Address" type="email" placeholder="john@example.com" required />
              <Input label="Subject" placeholder="How can we help?" required />
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-sm font-bold text-gray-900">Message</label>
                <textarea
                  rows="4"
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block p-3 outline-none transition-shadow"
                  placeholder="Tell us more about your query..."
                  required
                ></textarea>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="py-3.5 w-full justify-center shadow-md font-bold text-base"
                icon={<Send size={18} />}
              >
                {sent ? 'Message Sent!' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>

        {/* Dummy Map Placeholder */}
        <div className="mt-12 w-full h-80 bg-gray-200 rounded-3xl border border-border-light relative overflow-hidden flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
            alt="Map"
            className="w-full h-full object-cover opacity-50 grayscale"
          />
          <div className="absolute inset-0 bg-primary/10"></div>
          <div className="absolute flex flex-col items-center bg-white p-4 rounded-2xl shadow-xl">
            <MapPin className="text-primary mb-2" size={32} />
            <strong className="text-gray-900">HomeEase HQ</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
