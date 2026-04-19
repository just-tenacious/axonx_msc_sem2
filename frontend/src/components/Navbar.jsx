import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, LayoutDashboard, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) =>
    `text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all relative py-1 ${isActive(path)
      ? 'text-blue-500 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500'
      : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
    }`;

  const handleLogout = () => {
    logout();
    toast.success("Identity Cleared. Logged Out.");
    navigate('/login');
  };

  return (
    <nav
      style={{ height: '5rem' }}
      className="fixed top-0 left-0 w-full z-50 flex items-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300"
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center">

        {/* 🔷 LOGO */}
        <Link to="/" className="flex items-center gap-3 no-underline group transition-transform hover:scale-105 active:scale-95">
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              fontWeight: 900
            }}
            className="font-black italic"
          >
            ⬡
          </span>

          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 900
            }}
            className="font-black text-slate-900 dark:text-white tracking-tighter"
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
        <ul className="hidden lg:flex items-center gap-10 list-none m-0 p-0">
          <li><Link to="/" className={linkClass('/')}>Ecosystem</Link></li>
          <li><Link to="/departments" className={linkClass('/departments')}>Departments</Link></li>
          <li><Link to="/events" className={linkClass('/events')}>Events</Link></li>
          <li><Link to="/research" className={linkClass('/research')}>Research</Link></li>
          <li><Link to="/contact" className={linkClass('/contact')}>Support</Link></li>
        </ul>

        {/* 🔷 RIGHT SIDE */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* 🌙 Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 transition-all shadow-sm"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-[0.65rem] font-black uppercase tracking-widest text-[#0ea5e9] border border-[#0ea5e9]/20 px-6 py-2.5 rounded-2xl hover:bg-[#0ea5e9]/5 transition-all">
                Login
              </Link>

              <Link
                to="/register"
                className="px-8 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                }}
              >
                Join Now
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
