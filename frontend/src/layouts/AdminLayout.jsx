import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  CalendarCheck,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Providers', path: '/admin/providers', icon: <Briefcase size={20} /> },
    { name: 'Verification', path: '/admin/verification', icon: <ShieldCheck size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <Settings size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <CalendarCheck size={20} /> },
    { name: 'Complaints', path: '/admin/complaints', icon: <AlertTriangle size={20} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare size={20} /> }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-secondary font-sans text-gray-900">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-border-light flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } shrink-0 shadow-sm`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-light shrink-0">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold tracking-tight text-gray-900 truncate">
                Admin Panel
              </span>
            )}
          </Link>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-bg-alternate text-primary'
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
            className={`flex items-center gap-3 w-full px-3 py-2 text-text-secondary hover:text-error hover:bg-red-50 rounded-xl transition-all font-medium ${!sidebarOpen && 'justify-center'}`}
            title="Log Out"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-gray-900 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button className="text-text-secondary hover:text-primary transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-border-light"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-bold text-gray-900 hidden sm:block">
                {user?.name || 'Admin User'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 bg-bg-secondary">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
