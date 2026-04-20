import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, LayoutDashboard, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) =>
    `text-sm font-bold transition-all relative py-1 ${isActive(path)
      ? 'text-blue-500 underline decoration-2 underline-offset-8'
      : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
    }`;

  const handleLogout = () => {
    logout();
    toast.success("Identity Cleared. Logged Out.");
    navigate('/login');
  };

  return (
    <nav
      style={{ minHeight: '5rem' }}
      className="fixed top-0 left-0 w-full z-50 flex flex-col bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300"
    >
      <div className="w-full h-20 max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center">

        {/* 🔷 LOGO */}
        <Link to="/" className="flex items-center gap-3 no-underline group transition-transform hover:scale-105 active:scale-95">
          <span className="font-black italic">
            <img src="/light-mode.png" alt="AxonX Logo" className="h-10 w-auto" />
          </span>

          <span
            style={{ fontSize: '1.75rem', fontWeight: 900 }}
            className="font-black text-slate-900 dark:text-white tracking-tighter hidden sm:block"
          >
            Axon
            <span
              style={{
                background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              X
            </span>
          </span>
        </Link>

        {/* 🔷 CENTER NAV */}
        <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
          <li><Link to="/" className={linkClass('/')}>Home</Link></li>
          <li><Link to="/departments" className={linkClass('/departments')}>Departments</Link></li>
          <li><Link to="/events" className={linkClass('/events')}>Events</Link></li>
          <li><Link to="/research" className={linkClass('/research')}>Research</Link></li>
          <li><Link to="/contact" className={linkClass('/contact')}>Contact Us</Link></li>
        </ul>

        {/* 🔷 RIGHT SIDE */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* 🌙 Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-xl hover:scale-110 transition-transform"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!user ? (
            <div className="hidden sm:flex items-center gap-6 ml-2">
              <Link to="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
                Log In
              </Link>

              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-slate-950 dark:bg-slate-800 hover:bg-slate-800 transition-all active:scale-95 shadow-md"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : `/dashboard/${user.role}`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest bg-blue-500 text-white shadow-lg active:scale-95 transition-all"
              >
                <LayoutDashboard size={14} /> {user.role === 'admin' ? 'Admin Hub' : 'My Portal'}
              </Link>

              <button
                onClick={handleLogout}
                className="p-3 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}

          {/* 🍔 Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden flex flex-col bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-4 shadow-lg">
          <ul className="flex flex-col gap-4 list-none m-0 p-0 mb-6">
            <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={linkClass('/')}>Home</Link></li>
            <li><Link to="/departments" onClick={() => setIsMobileMenuOpen(false)} className={linkClass('/departments')}>Departments</Link></li>
            <li><Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className={linkClass('/events')}>Events</Link></li>
            <li><Link to="/research" onClick={() => setIsMobileMenuOpen(false)} className={linkClass('/research')}>Research</Link></li>
            <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={linkClass('/contact')}>Contact Us</Link></li>
          </ul>

          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-900 dark:text-white py-2">
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-3 text-center rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : `/dashboard/${user.role}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[0.75rem] font-black uppercase tracking-widest bg-blue-500 text-white shadow-lg active:scale-95 transition-all"
                >
                  <LayoutDashboard size={16} /> {user.role === 'admin' ? 'Admin Hub' : 'My Portal'}
                </Link>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="p-3 rounded-2xl bg-rose-50 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
