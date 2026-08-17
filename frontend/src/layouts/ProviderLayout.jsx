import React, { useContext, useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import apiClient from '../services/apiClient';
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Calendar,
  Users,
  DollarSign,
  CreditCard,
  Bell,
  User,
  ShieldCheck,
  Star,
  MapPin,
  Tag,
  BarChart3,
  LifeBuoy,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export const ProviderLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { city, detectLocation } = useContext(LocationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get('/notifications');
        const count = (res.data.data?.notifications || []).filter((n) => !n.isRead).length;
        setUnreadCount(count);
      } catch (err) {
        // Ignore error
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/provider-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Bookings', path: '/provider-bookings', icon: <CalendarCheck size={20} /> },
    { name: 'My Services', path: '/provider-services', icon: <Wrench size={20} /> },
    { name: 'Calendar & Availability', path: '/provider-calendar', icon: <Calendar size={20} /> },
    { name: 'My Customers', path: '/provider-customers', icon: <Users size={20} /> },
    { name: 'Earnings', path: '/provider-earnings', icon: <DollarSign size={20} /> },
    { name: 'Payouts', path: '/provider-payouts', icon: <CreditCard size={20} /> },
    { name: 'Notifications', path: '/provider-notifications', icon: <Bell size={20} />, badge: unreadCount },
    { name: 'KYC Verification', path: '/provider-verification', icon: <ShieldCheck size={20} /> },
    { name: 'Reviews & Ratings', path: '/provider-reviews', icon: <Star size={20} /> },
    { name: 'Location & Area', path: '/provider-location', icon: <MapPin size={20} /> },
    { name: 'Offers & Discounts', path: '/provider-offers', icon: <Tag size={20} /> },
    { name: 'Reports & Analytics', path: '/provider-analytics', icon: <BarChart3 size={20} /> },
    { name: 'Complaints & Support', path: '/provider-complaints', icon: <LifeBuoy size={20} /> },
    { name: 'My Profile', path: '/provider-profile', icon: <User size={20} /> },
    { name: 'Security', path: '/provider-security', icon: <ShieldAlert size={20} /> }
  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentItem = navItems.find((item) => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Provider Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Desktop Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 relative z-30 shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <Link to="/provider-dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
              H
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-gray-900 font-outfit tracking-tight leading-none">
                  HomeEase
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary mt-1">
                  Provider Panel
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-all shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Provider Profile Summary Widget (When Expanded) */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-xs font-extrabold text-gray-900 truncate font-outfit">
                  {user?.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant={user?.providerDetails?.isVerified ? 'success' : 'warning'} className="text-[9px] px-1.5 py-0 font-extrabold uppercase">
                    {user?.providerDetails?.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                  <span className="text-[10px] text-yellow-600 font-bold flex items-center gap-0.5">
                    ★ {user?.providerDetails?.rating || '5.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative group ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'}`}>
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <span className="truncate flex-1 font-medium">{item.name}</span>
                )}

                {!isCollapsed && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Badge Pill */}
                {isCollapsed && item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="p-3 border-t border-gray-100 shrink-0 space-y-1">
          <Link
            to="/"
            title={isCollapsed ? 'Public Landing Page' : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Home size={18} className="text-gray-500" />
            {!isCollapsed && <span>Public Home</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header & Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 font-outfit tracking-tight truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Location Pill */}
            <button
              onClick={detectLocation}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-xs font-bold transition-all"
              title="Click to detect current service location"
            >
              <MapPin size={14} className="text-primary" />
              <span className="max-w-[120px] truncate">{city || 'Detect City'}</span>
            </button>

            {/* Notifications Shortcut */}
            <Link
              to="/provider-notifications"
              className="relative w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Provider Profile Avatar Link */}
            <Link
              to="/provider-profile"
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-all"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover border border-gray-200"
              />
              <span className="hidden lg:inline text-xs font-bold text-gray-900 font-outfit max-w-[100px] truncate">
                {user?.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/60">
          <Outlet />
        </main>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative flex-1 max-w-xs w-full bg-white flex flex-col h-full shadow-2xl z-10">
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
              <Link to="/provider-dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                  H
                </div>
                <span className="text-lg font-extrabold text-gray-900 font-outfit">
                  HomeEase Provider
                </span>
              </Link>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">{user?.name}</h4>
                  <span className="text-[10px] text-gray-500 font-medium">{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.name}</span>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                <Home size={18} /> Public Home
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderLayout;
