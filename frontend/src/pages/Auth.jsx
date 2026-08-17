import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS, USER_ROLES } from '../config/constants';
import { Sparkles, Mail, Lock, User, Phone, Briefcase, MapPin, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isRegisterParam = searchParams.get('signup') === 'true';

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Common Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(USER_ROLES.CUSTOMER);

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Provider details
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [experience, setExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state with URL param
  useEffect(() => {
    setIsRegister(isRegisterParam);
  }, [isRegisterParam]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTarget = location.state?.redirect || searchParams.get('redirect');
      if (redirectTarget && user.role === USER_ROLES.CUSTOMER) {
        navigate(redirectTarget, { replace: true });
      } else if (user.role === USER_ROLES.CUSTOMER) {
        navigate('/dashboard', { replace: true });
      } else if (user.role === USER_ROLES.PROVIDER) {
        navigate('/provider-dashboard', { replace: true });
      } else if (user.role === USER_ROLES.ADMIN) {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, navigate, location.state, searchParams]);

  // Load service categories for provider registration
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.SERVICES);
        setCategories(res.data.data.services);
        if (res.data.data.services.length > 0) {
          setSelectedCategory(res.data.data.services[0]._id);
        }
      } catch (err) {
        console.error('Failed to load services list', err.friendlyMessage);
      }
    };
    if (isRegister && role === USER_ROLES.PROVIDER) {
      loadCategories();
    }
  }, [isRegister, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isRegister) {
      // Setup payload
      const address = { street, city, state, zipCode, coordinates: [77.209, 28.613] };
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        address
      };

      if (role === USER_ROLES.PROVIDER) {
        payload.providerDetails = {
          serviceCategory: selectedCategory,
          experience: Number(experience),
          hourlyRate: Number(hourlyRate)
        };
      }

      const res = await register(payload);
      if (!res.success) {
        setErrorMsg(res.message);
        setLoading(false);
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-white text-gray-900 selection:bg-teal-100">
      {/* Left Content (Form) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12 relative overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Sparkles size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 font-outfit tracking-tight">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-text-secondary font-medium">
              {isRegister
                ? 'Join thousands of users booking top-tier home services.'
                : 'Enter your credentials to access your account.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 text-sm font-bold flex items-center gap-2 shadow-sm animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isRegister && (
              <div className="animate-fade-in flex flex-col gap-5">
                {/* Role Toggle */}
                <div className="flex bg-gray-50 p-1 rounded-xl border border-border-light shadow-inner mb-2">
                  <button
                    type="button"
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      role === USER_ROLES.CUSTOMER
                        ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setRole(USER_ROLES.CUSTOMER)}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      role === USER_ROLES.PROVIDER
                        ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setRole(USER_ROLES.PROVIDER)}
                  >
                    Service Provider
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Full Name"
                    type="text"
                    required
                    icon={<User size={18} />}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    wrapperClassName="mb-0"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    required
                    icon={<Phone size={18} />}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    wrapperClassName="mb-0"
                  />
                </div>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              required
              icon={<Mail size={18} />}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              wrapperClassName="mb-0"
            />

            <Input
              label="Password"
              type="password"
              required
              icon={<Lock size={18} />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              wrapperClassName="mb-0"
            />

            {/* Provider specific inputs */}
            {isRegister && role === USER_ROLES.PROVIDER && (
              <div className="bg-bg-alternate border border-primary-light p-6 rounded-2xl flex flex-col gap-5 mt-2 animate-fade-in">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Briefcase size={18} /> Provider Details
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Speciality</label>
                  <select
                    className="block w-full bg-white border border-border-light rounded-xl text-gray-900 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all font-medium shadow-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="Exp (Years)"
                    type="number"
                    min="0"
                    required
                    placeholder="5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    wrapperClassName="mb-0"
                  />
                  <Input
                    label="Rate (₹/hr)"
                    type="number"
                    min="0"
                    required
                    placeholder="350"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    wrapperClassName="mb-0"
                  />
                </div>
              </div>
            )}

            {/* Address Details */}
            {isRegister && (
              <div className="bg-gray-50 border border-border-light p-6 rounded-2xl flex flex-col gap-5 mt-2 animate-fade-in">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <MapPin size={18} className="text-gray-400" /> Service Location
                </div>
                <Input
                  label="Street Address"
                  type="text"
                  required
                  placeholder="H-15, Main Block"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  wrapperClassName="mb-0"
                />
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="City"
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    wrapperClassName="mb-0"
                  />
                  <Input
                    label="Pincode"
                    type="text"
                    required
                    placeholder="Pincode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    wrapperClassName="mb-0"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-4 py-4 rounded-xl font-extrabold shadow-elevated group"
              size="lg"
              loading={loading}
            >
              <span className="flex items-center gap-2 justify-center">
                {isRegister ? 'Create Account' : 'Sign In'}
                {!loading && (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </span>
            </Button>
          </form>

          {/* Toggle link */}
          <div className="text-center mt-8 text-sm text-text-secondary font-medium">
            <span>{isRegister ? 'Already have an account?' : "Don't have an account?"} </span>
            <button
              className="text-primary font-bold hover:text-primary-hover transition-colors rounded"
              onClick={() => setIsRegister(!isRegister)}
              type="button"
            >
              {isRegister ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Content (Image Cover) */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-hero-dark">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-hero-dark via-hero-dark/60 to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-primary/20 mix-blend-multiply"></div>
        <img
          src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=1200&auto=format&fit=crop"
          alt="Premium home service"
          className="absolute inset-0 w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-[10s]"
        />

        {/* Floating Accent Elements */}
        <div className="absolute z-20 bottom-16 left-16 right-16">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-outfit font-extrabold text-white mb-3 tracking-tight">
              Premium Services. Instantly.
            </h3>
            <p className="text-teal-50 font-medium leading-relaxed">
              Join the platform where quality meets convenience. We connect you with top-rated
              professionals for all your household needs.
            </p>
            <div className="flex gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-white text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
                >
                  <Sparkles size={14} className="text-primary-light" /> Trust
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
