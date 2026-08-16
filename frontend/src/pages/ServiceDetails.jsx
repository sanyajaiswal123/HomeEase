import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import providerService from '../services/providerService';
import { API_ENDPOINTS } from '../config/constants';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  CreditCard,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import RetryState from '../components/ui/RetryState';

export const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('providerId');
  const { user } = useContext(AuthContext);

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stepper State
  // 1: Subservices, 2: Address & Schedule, 3: Payment
  const [step, setStep] = useState(1);

  // Scheduling & Location State
  const [scheduledDate, setScheduledDate] = useState('');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');

  // Payment State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const fetchServiceAndProvider = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(API_ENDPOINTS.SERVICES);
      const item = res.data.data.services.find((s) => s._id === id);
      setService(item);

      if (providerId) {
        const provRes = await providerService.getProviderById(providerId);
        setProvider(provRes.data.provider);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceAndProvider();
  }, [id, providerId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <Skeleton.Card className="rounded-[24px]" />
      </div>
    );
  }

  if (error) {
    return (
      <RetryState
        error={error}
        onRetry={fetchServiceAndProvider}
        className="max-w-xl mx-auto mt-10"
      />
    );
  }

  if (!service) {
    return (
      <EmptyState
        title="Service not found"
        description="The service you are looking for does not exist."
        className="max-w-xl mx-auto mt-10"
      />
    );
  }

  const handleSubToggle = (subName) => {
    if (selectedSubs.includes(subName)) {
      setSelectedSubs(selectedSubs.filter((s) => s !== subName));
    } else {
      setSelectedSubs([...selectedSubs, subName]);
    }
  };

  const getSubPrice = (subName) => {
    const sub = service.subServices.find((s) => s.name === subName);
    return sub ? sub.price : 0;
  };

  const calculateTotal = () => {
    let total = service.basePrice;
    selectedSubs.forEach((name) => {
      total += getSubPrice(name);
    });
    return total;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const payload = {
        serviceId: service._id,
        subServicesSelected: selectedSubs,
        scheduledDate: new Date(scheduledDate),
        address: { street, city, state, zipCode }
      };

      const res = await apiClient.post(API_ENDPOINTS.BOOKINGS.BASE, payload);
      setBookingSuccess(res.data.data.booking);
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to place booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
      {/* Back button */}
      <Button
        onClick={() => navigate(-1)}
        variant="secondary"
        size="md"
        className="mb-8 rounded-full border-border-light shadow-sm"
        icon={<ArrowLeft size={16} />}
      >
        Back to Services
      </Button>

      {/* Stepper Progress Header */}
      <div className="flex justify-between items-center bg-white border border-border-light py-5 px-6 md:px-10 rounded-[24px] mb-12 shadow-soft">
        {['1. Select Add-ons', '2. Service Schedule', '3. Checkout & Pay'].map((text, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div
              key={idx}
              className={`flex items-center gap-4 text-sm md:text-base font-bold uppercase tracking-widest ${isActive ? 'text-primary' : isDone ? 'text-success' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2
                  ${isActive ? 'bg-bg-alternate border-primary text-primary shadow-sm' : isDone ? 'bg-green-50 border-success text-success shadow-sm' : 'bg-bg-secondary border-gray-200 text-gray-400'}
                `}
              >
                {isDone ? <Check size={14} className="font-bold" /> : stepNum}
              </div>
              <span className="hidden sm:inline">{text}</span>
            </div>
          );
        })}
      </div>

      {bookingSuccess ? (
        /* Success Screen */
        <Card className="text-center p-16 flex flex-col items-center gap-8 animate-fade-in shadow-soft border-border-light rounded-[32px] max-w-3xl mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-50 text-success flex items-center justify-center border border-green-100 shadow-sm relative">
            <div className="absolute inset-0 rounded-full border-4 border-success animate-ping opacity-20"></div>
            <ShieldCheck size={48} />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900 font-outfit tracking-tight">
              Booking Placed Successfully!
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto font-medium leading-relaxed text-lg">
              Your technician booking for <strong className="text-gray-900">{service.name}</strong>{' '}
              has been registered. You can monitor progress and view live updates below.
            </p>
          </div>

          <div className="bg-bg-secondary p-8 rounded-[24px] border border-border-light text-left w-full shadow-inner my-2">
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                Booking ID
              </span>
              <strong className="text-gray-900 text-base">
                {bookingSuccess._id.slice(-8).toUpperCase()}
              </strong>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                Start Service OTP
              </span>
              <strong className="text-primary text-2xl font-extrabold tracking-[0.2em]">
                {bookingSuccess.otp}
              </strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                Amount Paid
              </span>
              <strong className="text-gray-900 font-extrabold text-lg">
                ₹{bookingSuccess.totalAmount}
              </strong>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/booking/track/${bookingSuccess._id}`)}
            icon={<ArrowRight size={18} />}
            className="flex-row-reverse rounded-xl shadow-md py-4 px-8 font-bold"
            size="lg"
            variant="primary"
          >
            Track Booking Progress
          </Button>
        </Card>
      ) : (
        /* Stepper Flow Cards */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start responsive-checkout-grid">
          <Card className="shadow-soft border-border-light rounded-[32px] overflow-hidden">
            {step === 1 && (
              /* Step 1: Add-ons selection */
              <Card.Body className="animate-fade-in flex flex-col gap-8 p-8 md:p-10">
                <div>
                  <h2 className="text-3xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
                    Select Sub-services
                  </h2>
                  <p className="text-text-secondary font-medium text-lg">
                    Choose from the custom checklist below to customize your job.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {service.subServices.map((sub, idx) => {
                    const isSelected = selectedSubs.includes(sub.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSubToggle(sub.name)}
                        className={`flex justify-between items-center p-6 border rounded-[20px] cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-bg-alternate border-primary-light shadow-sm' : 'bg-white border-border-light hover:border-primary-light hover:shadow-sm'}`}
                      >
                        <div className="flex gap-5 items-center">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center border-2 text-white transition-colors shadow-sm ${isSelected ? 'bg-primary border-primary' : 'bg-bg-secondary border-gray-300 group-hover:border-primary-light'}`}
                          >
                            {isSelected && <Check size={16} className="font-bold" />}
                          </div>
                          <div>
                            <strong className="block text-lg text-gray-900 font-bold">
                              {sub.name}
                            </strong>
                            <span className="text-sm text-text-secondary font-medium mt-1 block">
                              {sub.description}
                            </span>
                          </div>
                        </div>
                        <strong className="text-gray-900 font-extrabold text-xl">
                          +₹{sub.price}
                        </strong>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-border-light">
                  <Button
                    onClick={() => setStep(2)}
                    icon={<ArrowRight size={18} />}
                    className="flex-row-reverse rounded-xl shadow-md py-3.5 px-8 font-bold"
                    variant="primary"
                  >
                    Proceed to Schedule
                  </Button>
                </div>
              </Card.Body>
            )}

            {step === 2 && (
              /* Step 2: Schedule and Address details */
              <Card.Body className="animate-fade-in flex flex-col gap-8 p-8 md:p-10">
                <div>
                  <h2 className="text-3xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
                    Service Address & Time
                  </h2>
                  <p className="text-text-secondary font-medium text-lg">
                    Select when and where the technician should arrive.
                  </p>
                </div>

                <div className="bg-bg-secondary p-8 rounded-[24px] border border-border-light flex flex-col gap-6">
                  {/* Date Selection */}
                  <Input
                    label="Scheduled Date & Time"
                    type="datetime-local"
                    required
                    icon={<Calendar size={18} />}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="bg-white shadow-sm"
                  />

                  {/* Address Form */}
                  <div className="flex flex-col gap-5">
                    <Input
                      label="Street Address"
                      type="text"
                      required
                      placeholder="e.g. H-15, Green Park"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      wrapperClassName="mb-0"
                      className="bg-white shadow-sm"
                    />

                    <div className="grid grid-cols-2 gap-5">
                      <Input
                        label="City"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        wrapperClassName="mb-0"
                        className="bg-white shadow-sm"
                      />
                      <Input
                        label="Pincode"
                        type="text"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        wrapperClassName="mb-0"
                        className="bg-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6 pt-6 border-t border-border-light">
                  <Button
                    onClick={() => setStep(1)}
                    variant="secondary"
                    className="rounded-xl px-6 py-3 font-bold shadow-sm"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!scheduledDate || !street || !city || !zipCode) {
                        alert('Please fill out all fields.');
                        return;
                      }
                      setStep(3);
                    }}
                    icon={<ArrowRight size={18} />}
                    className="flex-row-reverse rounded-xl shadow-md px-8 py-3.5 font-bold"
                    variant="primary"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </Card.Body>
            )}

            {step === 3 && (
              /* Step 3: Checkout Mock Card payment */
              <Card.Body className="animate-fade-in flex flex-col gap-8 p-8 md:p-10">
                <div>
                  <h2 className="text-3xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
                    Secure Mock Payment
                  </h2>
                  <p className="text-text-secondary font-medium text-lg">
                    Demonstration card checkout (Auto-approved sandbox)
                  </p>
                </div>

                <form
                  onSubmit={handleCheckout}
                  className="flex flex-col gap-6 bg-bg-secondary p-8 rounded-[24px] border border-border-light shadow-inner"
                >
                  <Input
                    label="Cardholder Name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    wrapperClassName="mb-0"
                    className="bg-white shadow-sm"
                  />

                  <Input
                    label="Card Number"
                    type="text"
                    maxLength="19"
                    required
                    icon={<CreditCard size={18} />}
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    wrapperClassName="mb-0"
                    className="bg-white shadow-sm font-mono tracking-widest text-lg"
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Expiry (MM/YY)"
                      type="text"
                      maxLength="5"
                      required
                      placeholder="12/28"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      wrapperClassName="mb-0"
                      className="bg-white shadow-sm text-center"
                    />
                    <Input
                      label="CVV"
                      type="password"
                      maxLength="3"
                      required
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      wrapperClassName="mb-0"
                      className="bg-white shadow-sm text-center tracking-[0.2em]"
                    />
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-border-light">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      variant="secondary"
                      className="rounded-xl px-6 py-3 font-bold shadow-sm"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={bookingLoading}
                      icon={<ShieldCheck size={18} />}
                      className="flex-row-reverse rounded-xl shadow-md py-3.5 px-8 font-bold"
                    >
                      Pay ₹{calculateTotal()}
                    </Button>
                  </div>
                </form>
              </Card.Body>
            )}
          </Card>

          {/* Pricing Sidebar Summary */}
          <Card className="flex flex-col gap-6 sticky top-28 shadow-elevated border-border-light rounded-[32px]">
            <Card.Body className="p-8">
              <h3 className="text-2xl font-extrabold border-b border-border-light pb-6 mb-6 text-gray-900 font-outfit tracking-tight">
                Booking Summary
              </h3>

              <div className="flex flex-col gap-4 mb-8">
                {provider && (
                  <div className="flex items-center gap-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 mb-2">
                    <img
                      src={provider.photo}
                      alt={provider.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-700 tracking-widest block mb-0.5">
                        Selected Professional
                      </span>
                      <strong className="text-gray-900 text-sm block">{provider.name}</strong>
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>{service.name} Base Cost</span>
                  <strong className="text-xl">₹{service.basePrice}</strong>
                </div>

                {selectedSubs.length > 0 && (
                  <div className="border-t border-dashed border-gray-300 pt-5 mt-3 flex flex-col gap-4">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">
                      Selected Add-ons
                    </span>
                    {selectedSubs.map((name, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm font-medium"
                      >
                        <span className="text-text-secondary flex items-center gap-1.5">
                          <Plus size={12} /> {name}
                        </span>
                        <strong className="text-gray-900 text-base font-extrabold">
                          ₹{getSubPrice(name)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border-light pt-6 flex justify-between items-center mb-8">
                <span className="font-extrabold text-gray-900 uppercase tracking-widest text-sm">
                  Total Price
                </span>
                <strong className="text-4xl text-primary font-extrabold font-outfit">
                  ₹{calculateTotal()}
                </strong>
              </div>

              <div className="text-xs text-text-secondary font-bold leading-relaxed bg-bg-secondary p-5 rounded-2xl border border-border-light text-center shadow-inner">
                All jobs include general service damage protection insurance up to{' '}
                <strong className="text-gray-900">₹10,000</strong>.
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
