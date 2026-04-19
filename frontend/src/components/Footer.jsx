import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 mt-auto w-full font-sans text-slate-800">
      <div className="max-w-[1200px] mx-auto px-8 flex flex-col md:flex-row justify-between gap-16 relative z-10">
        
        {/* Left Section */}
        <div className="max-w-md space-y-4 text-left">
          <h2 className="text-2xl font-bold text-[#0f172a]">
            Axon<span className="text-[#14b8a6]">X</span>
          </h2>
          <p className="text-[0.9rem] text-[#64748b] leading-relaxed font-medium">
            Connecting patients, students, researchers, doctors, and hospitals on a unified healthcare community platform.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex gap-24 lg:pr-24 text-left">
          {/* Platform Column */}
          <div className="space-y-6">
            <h3 className="text-[0.95rem] font-bold text-[#0f172a]">Platform</h3>
            <ul className="flex flex-col gap-4 list-none p-0 m-0 text-sm text-[#64748b] font-medium">
              <li><Link to="/features" className="hover:text-[#14b8a6] transition-colors">Features</Link></li>
              <li><Link to="/community" className="hover:text-[#14b8a6] transition-colors">Community</Link></li>
              <li><Link to="/events" className="hover:text-[#14b8a6] transition-colors">Events</Link></li>
            </ul>
          </div>
          
          {/* Roles Column */}
          <div className="space-y-6">
            <h3 className="text-[0.95rem] font-bold text-[#0f172a]">Roles</h3>
            <ul className="flex flex-col gap-4 list-none p-0 m-0 text-sm text-[#64748b] font-medium">
              <li><Link to="/students" className="hover:text-[#14b8a6] transition-colors">Students</Link></li>
              <li><Link to="/doctors" className="hover:text-[#14b8a6] transition-colors">Doctors</Link></li>
              <li><Link to="/patients" className="hover:text-[#14b8a6] transition-colors">Patients</Link></li>
              <li><Link to="/researchers" className="hover:text-[#14b8a6] transition-colors">Researchers</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 mt-16 pt-6 border-t border-slate-200">
        <p className="text-center text-[0.85rem] font-medium text-[#64748b]">
            © 2026 AxonX. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
