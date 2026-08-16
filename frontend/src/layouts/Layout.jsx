import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LogOut,
  Sparkles,
  Calendar,
  ClipboardList,
  Shield,
  Award,
  Menu,
  X,
  ChevronDown,
  MapPin
} from 'lucide-react';
import Button from '../components/ui/Button';

export const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState('Detecting location...');

  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return (
      <div className="min-h-screen flex bg-bg-secondary text-text-primary font-sans">
        {children}
      </div>
    );
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              'Unknown';
            const country = data.address.country || 'Location';
            setUserLocation(`${city}, ${country}`);
          } catch (error) {
            setUserLocation('Select your location');
          }
        },
        () => {
          setUserLocation('Select your location');
        }
      );
    } else {
      setUserLocation('Select your location');
    }
  }, []);

  const isLanding = location.pathname === '/';
  // On landing, we want it to blend perfectly with the dark teal background.
  // It shouldn't turn white when scrolled if we want to match the image, or maybe it should.
  // Let's make it slightly translucent dark teal when scrolled.
  const isTransparent = isLanding && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // New NavItem style based on the image
  const NavItem = ({ to, children, hasDropdown = false }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm
        ${
          isLanding
            ? 'text-teal-50 hover:text-white'
            : isActive(to)
              ? 'text-primary'
              : 'text-text-secondary hover:text-primary'
        }
      `}
    >
      {children}
      {hasDropdown && (
        <ChevronDown size={14} className={isLanding ? 'text-teal-200' : 'text-gray-400'} />
      )}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg-secondary text-text-primary font-sans selection:bg-primary/30">
      {/* Top Navigation Bar */}
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          isLanding
            ? scrolled
              ? 'bg-hero-dark/95 backdrop-blur-md shadow-sm py-4'
              : 'bg-transparent py-6'
            : 'bg-white/95 backdrop-blur-md border-b border-border-light shadow-sm py-4'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLanding ? 'text-primary-light' : 'bg-primary text-white'}`}
            >
              <Sparkles size={24} className="currentColor" />
            </div>
            <span
              className={`text-2xl font-bold tracking-tight ${isLanding ? 'text-white' : 'text-gray-900'}`}
            >
              HomeEase
            </span>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <div className="hidden lg:flex items-center gap-6">
            {!user ? (
              <>
                <NavItem to="/services" hasDropdown>
                  Services
                </NavItem>
                <NavItem to="/how-it-works">How It Works</NavItem>
                <NavItem to="/ai-diagnose">AI Assistant</NavItem>
                <NavItem to="/become-provider">Become a Provider</NavItem>
                <NavItem to="/about">About Us</NavItem>
                <NavItem to="/contact">Contact Us</NavItem>
              </>
            ) : (
              <>
                {user.role === 'customer' && (
                  <>
                    <NavItem to="/dashboard">Services</NavItem>
                    <NavItem to="/ai-diagnose">AI Assistant</NavItem>
                    <NavItem to="/bookings">My Bookings</NavItem>
                  </>
                )}
                {user.role === 'provider' && (
                  <>
                    <NavItem to="/provider-dashboard">Job Board</NavItem>
                    <NavItem to="/provider-earnings">Earnings</NavItem>
                  </>
                )}
                {user.role === 'admin' && <NavItem to="/admin">Admin Panel</NavItem>}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Location Selector */}
            <div
              className={`flex items-center gap-2 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${isLanding ? 'text-white' : 'text-gray-700'}`}
            >
              <MapPin size={16} className={isLanding ? 'text-teal-200' : 'text-gray-400'} />
              <span>{userLocation}</span>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className={`w-px h-6 ${isLanding ? 'bg-white/20' : 'bg-border-light'}`}></div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm ${isLanding ? 'bg-white/20 text-white border border-white/30' : 'bg-bg-secondary border border-border-light text-primary'}`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`text-sm font-bold ${isLanding ? 'text-white' : 'text-gray-900'}`}
                  >
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 text-sm font-bold ml-4 transition-colors ${isLanding ? 'text-teal-200 hover:text-white' : 'text-text-secondary hover:text-error'}`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/auth')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${isLanding ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/auth?signup=true')}
                  className="px-5 py-2 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-all shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`lg:hidden relative z-50 p-2 transition-colors ${isLanding ? 'text-white' : 'text-gray-900'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} className="text-gray-900" /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl py-6 px-6 flex flex-col gap-6 animate-fade-in text-gray-900">
            {/* Render simplified mobile menu for brevity */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}
                variant="secondary"
                className="w-full justify-center"
              >
                Log In
              </Button>
              <Button
                onClick={() => {
                  navigate('/auth?signup=true');
                  setMobileMenuOpen(false);
                }}
                variant="primary"
                className="w-full justify-center"
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Body content */}
      <main
        className={`flex-1 w-full mx-auto flex flex-col ${!isLanding ? 'max-w-[1440px] px-4 sm:px-6 py-8 md:py-12 mt-20' : ''}`}
      >
        {children}
      </main>

      {/* Premium Elegant Footer */}
      <footer className="bg-accent text-white pt-16 pb-8 mt-auto border-t-0">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
                  <Sparkles size={16} className="text-accent" />
                </div>
                <span className="text-xl font-extrabold text-white font-outfit">HomeEase</span>
              </Link>
              <p className="text-sm text-accent-light leading-relaxed font-medium">
                The premium AI-powered marketplace connecting you with trusted, background-checked
                household service professionals instantly.
              </p>
              <div className="flex items-center gap-4 text-accent-light">
                <a href="#" className="hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  LinkedIn
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">
                Company
              </h4>
              <Link
                to="/about"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/careers"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Careers
              </Link>
              <Link
                to="/press"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Press
              </Link>
              <Link
                to="/blog"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Blog
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">
                Services
              </h4>
              <Link
                to="/services"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                All Services
              </Link>
              <Link
                to="/services"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Cleaning
              </Link>
              <Link
                to="/services"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Electrician
              </Link>
              <Link
                to="/services"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Plumbing
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">
                Support
              </h4>
              <Link
                to="/faq"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Help Center / FAQs
              </Link>
              <Link
                to="/contact"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/become-provider"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Become a Provider
              </Link>
              <Link
                to="/cancellation-policy"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Cancellation Policy
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-accent-hover flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-accent-light font-medium">
              © {new Date().getFullYear()} HomeEase Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                to="/privacy"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-accent-light hover:text-white font-medium transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
