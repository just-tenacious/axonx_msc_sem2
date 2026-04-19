import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useAuth();

    return (
        <button 
            onClick={toggleTheme}
            className="fixed top-6 right-6 p-2.5 bg-[var(--topbar-bg)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl shadow-lg z-[1000] hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
            <div className="relative w-6 h-6 flex items-center justify-center">
                {theme === 'light' ? (
                    <Moon size={20} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
                ) : (
                    <Sun size={20} className="text-amber-500 group-hover:rotate-45 transition-transform" />
                )}
            </div>
            
            {/* Subtle Tooltip */}
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--sidebar-bg)] text-white text-[0.65rem] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {theme === 'light' ? 'Enable Night Mode' : 'Enable Day Mode'}
            </span>
        </button>
    );
};

export default ThemeToggle;
