import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export const FAQ = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Booking & Cancellations',
      q: 'How do I book a service?',
      a: 'You can book a service by selecting a category from the homepage or Services page, choosing a verified professional based on their profile and reviews, selecting a date and time, and confirming your booking.'
    },
    {
      category: 'Booking & Cancellations',
      q: 'Can I cancel or reschedule my booking?',
      a: 'Yes, you can cancel or reschedule for free up to 4 hours before the scheduled time. Late cancellations may incur a nominal fee.'
    },
    {
      category: 'Booking & Cancellations',
      q: "What happens if the professional doesn't show up?",
      a: 'Our professionals have a 99% on-time record. In the rare event of a no-show, you will receive a full refund and a ₹500 credit for your next booking.'
    },

    {
      category: 'Professionals & Quality',
      q: 'Are the professionals verified?',
      a: 'Absolutely. Every professional undergoes a strict 5-step background check, including identity verification, criminal record check, and skill assessments.'
    },
    {
      category: 'Professionals & Quality',
      q: "What if I'm not satisfied with the service?",
      a: "We offer a 100% Satisfaction Guarantee. If you're not happy with the work, we will send a different professional to redo the job at zero additional cost."
    },
    {
      category: 'Professionals & Quality',
      q: 'Do the professionals carry their own tools?',
      a: 'Yes, all our professionals come fully equipped with standard tools and supplies required for the specific job.'
    },

    {
      category: 'Pricing & Payments',
      q: 'How are payments handled?',
      a: 'Payments are handled securely through our app. You can pay via Credit/Debit card, UPI, or Wallet after the service is completed. We do not accept cash.'
    },
    {
      category: 'Pricing & Payments',
      q: 'Are there any hidden charges?',
      a: 'No. The price you see during checkout is final. If any additional spare parts are needed during the repair, the professional will add them to the bill via the app for your approval.'
    },
    {
      category: 'Pricing & Payments',
      q: 'When do I pay?',
      a: 'You only pay after the service is successfully completed and you are satisfied with the result.'
    },

    {
      category: 'AI Diagnosis',
      q: 'How does AI Diagnosis work?',
      a: "You simply describe your household problem (e.g., 'My AC is making a rattling noise'). Our AI will analyze the symptoms, diagnose the likely issue, and recommend the exact service you need."
    },
    {
      category: 'AI Diagnosis',
      q: 'Is the AI Diagnosis cost estimate accurate?',
      a: 'The AI provides a highly accurate estimate based on thousands of historical jobs. However, the final price may vary slightly if the professional discovers underlying issues during the physical inspection.'
    },

    {
      category: 'Insurance & Safety',
      q: 'Is my home insured during the service?',
      a: 'Yes, all HomeEase jobs are covered by a general service damage protection insurance up to ₹10,000 against accidental damages.'
    },
    {
      category: 'Insurance & Safety',
      q: 'What safety protocols are followed?',
      a: 'Professionals use OTP verification before entering your home. You can track their live location before they arrive, and share their details with family members.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-bg-secondary min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-outfit mb-4">
            Help Center
          </h1>
          <p className="text-lg text-text-secondary font-medium mb-8">
            Everything you need to know about using HomeEase.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:ring-2 focus:ring-primary text-gray-900 font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No results found for "{searchQuery}"
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full text-left px-8 py-5 flex justify-between items-center focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                  <div
                    className={`transition-transform duration-300 shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`}
                  >
                    <ChevronDown
                      size={20}
                      className={activeFaq === idx ? 'text-primary' : 'text-gray-400'}
                    />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-8 pb-6 text-text-secondary font-medium text-base border-t border-gray-50 pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
