import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ChevronDown, Menu, X, Bell, Globe } from 'lucide-react';
import Logo from './Logo';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, toggleTheme, theme, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Signed out successfully");
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="sticky top-0 z-50 bg-[var(--topbar-bg)] border-b border-[var(--border-color)] transition-colors duration-400 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <Logo className="w-12 h-12" showText />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to={`/dashboard/${user.role}`} className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--primary-accent)] transition-colors uppercase tracking-widest">Dashboard</Link>
                        <Link to="/appointments" className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--primary-accent)] transition-colors uppercase tracking-widest">Services</Link>
                        <Link to="/research" className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--primary-accent)] transition-colors uppercase tracking-widest">Research</Link>
                        
                        <div className="flex items-center gap-4 ml-8 border-l border-[var(--border-color)] pl-8">
                            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--primary-accent)] transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#0ea5e9] rounded-full animate-pulse" />
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 p-1 rounded-full hover:bg-[var(--hover-bg)] transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 shadow-lg border border-[var(--border-color)] overflow-hidden">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="User Avatar" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#0ea5e9] text-white font-black text-xl">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-64 bg-[var(--topbar-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                                            <div className="px-4 py-3 border-b border-[var(--border-color)] mb-1 bg-[var(--bg-color)]/20">
                                                <p className="text-sm font-black text-[var(--text-main)] truncate">{user.name}</p>
                                                <p className="text-[0.65rem] text-[var(--text-muted)] font-black uppercase tracking-[0.1em]">{user.role}</p>
                                            </div>
                                            <Link 
                                                to="/dashboard/profile" 
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-main)] hover:bg-[var(--hover-bg)] transition-all"
                                            >
                                                <UserCircle size={18} className="text-blue-500" /> Account Settings
                                            </Link>
                                            <button 
                                                onClick={toggleTheme}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-main)] hover:bg-[var(--hover-bg)] transition-all"
                                            >
                                                {theme === 'light' ? <><Moon size={18} className="text-indigo-600" /> Toggle Dark View</> : <><Sun size={18} className="text-amber-500" /> Toggle Light View</>}
                                            </button>
                                            <div className="border-t border-[var(--border-color)] mt-2 pt-2">
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                >
                                                    <LogOut size={18} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-main)]">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[var(--topbar-bg)] border-t border-[var(--border-color)] p-4 space-y-4 animate-in slide-in-from-top duration-300">
                    <Link to={`/dashboard/${user.role}`} className="block px-4 py-2 text-lg font-bold text-[var(--text-main)]">My Dashboard</Link>
                    <Link to="/appointments" className="block px-4 py-2 text-lg font-bold text-[var(--text-main)]">Healthcare Services</Link>
                    <Link to="/dashboard/profile" className="block px-4 py-2 text-lg font-bold text-[var(--text-main)]">Personal Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-lg font-bold text-red-500">Sign Out</button>
                </div>
            )}
        </nav>
    );
};

// Internal icon import since ChevronDown was used but UserCircle wasn't imported from lucide
import { UserCircle } from 'lucide-react';

export default Navbar;
