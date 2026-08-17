import React, { useState } from 'react';
import { Tag, Plus, Percent, CheckCircle2, Copy } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export const OffersCoupons = () => {
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'WELCOME20',
      discount: '20% OFF',
      description: '20% discount on first service booking up to ₹200',
      status: 'Active',
      used: 48
    },
    {
      id: 2,
      code: 'FESTIVE100',
      discount: '₹100 OFF',
      description: 'Flat ₹100 discount on electrical & plumbing bookings',
      status: 'Active',
      used: 112
    },
    {
      id: 3,
      code: 'SUMMERAC',
      discount: '15% OFF',
      description: 'Special 15% discount on AC repair and servicing',
      status: 'Active',
      used: 85
    }
  ]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code ${code} copied to clipboard!`);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-4 sm:py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
            Offers & Promo Coupons
          </h1>
          <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
            Manage promotional discounts, referral campaigns, and seasonal offers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <Card key={c.id} className="p-6 shadow-soft border-border-light rounded-[24px] bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="success">{c.status}</Badge>
                <span className="text-xs text-text-secondary font-bold">{c.used} Redemptions</span>
              </div>
              <strong className="text-2xl text-primary font-extrabold font-outfit tracking-wider block mb-1">
                {c.code}
              </strong>
              <span className="text-sm font-bold text-gray-900 block mb-2">{c.discount}</span>
              <p className="text-xs text-text-secondary font-medium leading-relaxed mb-6">
                {c.description}
              </p>
            </div>

            <Button
              onClick={() => copyCode(c.code)}
              variant="secondary"
              size="sm"
              icon={<Copy size={14} />}
              className="w-full rounded-xl"
            >
              Copy Code
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OffersCoupons;
