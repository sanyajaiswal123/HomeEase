import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wrench,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  Tag,
  Bell,
  Bot,
  BarChart3,
  FileText,
  Headphones,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Providers', path: '/admin/providers', icon: <Briefcase size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <Wrench size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <CalendarCheck size={20} /> },
    { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={20} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare size={20} /> },
    { name: 'Complaints', path: '/admin/complaints', icon: <AlertTriangle size={20} /> },
    { name: 'KYC Verification', path: '/admin/kyc', icon: <ShieldCheck size={20} /> },
    { name: 'Offers & Coupons', path: '/admin/coupons', icon: <Tag size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'AI Management', path: '/admin/ai', icon: <Bot size={20} /> },
    { name: 'Reports & Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: <FileText size={20} /> },
    { name: 'Support', path: '/admin/support', icon: <Headphones size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-secondary font-sans text-gray-900">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex bg-white border-r border-border-light flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } shrink-0 shadow-sm`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-light shrink-0">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold tracking-tight text-gray-900 truncate font-outfit">
                Admin Panel
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-bg-alternate text-primary font-bold shadow-sm'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              title={item.name}
            >
              <div className="shrink-0">{item.icon}</div>
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border-light shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 text-text-secondary hover:text-error hover:bg-red-50 rounded-xl transition-all font-bold text-sm ${
              !sidebarOpen && 'justify-center'
            }`}
            title="Log Out"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay + Drawer) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Sidebar */}
          <aside className="relative flex flex-col w-72 max-w-full bg-white h-full shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-5 border-b border-border-light">
              <Link
                to="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 font-outfit">
                  Admin Panel
                </span>
              </Link>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm ${
                      isActive
                        ? 'bg-bg-alternate text-primary font-bold shadow-sm'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-border-light">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 text-text-secondary hover:text-error hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
              >
                <LogOut size={20} className="shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg text-text-secondary hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Open Navigation"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-gray-50 transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
            </button>

            <div className="w-px h-6 bg-border-light"></div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold font-outfit shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Admin Role
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 bg-bg-secondary">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
