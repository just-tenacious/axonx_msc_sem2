import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Activity, Database, Globe, Heart, ShieldCheck, 
    MapPin, Phone, Mail 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#0b1121] border-t border-slate-200 dark:border-slate-800 pt-24 pb-12 mt-auto w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mb-32 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between gap-16 relative z-10">
        <div className="max-w-md space-y-8 text-left">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '-0.025em'
          }} className="text-slate-900 dark:text-white font-black italic">
            Axon<span style={{
              background: 'linear-gradient(135deg, #38bdf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>X</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-bold opacity-70 italic">
            Pioneering the connective tissue of modern medicine. AxonX is the ultimate ecosystem bridging the gap between clinical healing, academic research, and community support.
          </p>
          <div className="flex gap-4">
              {[Globe, Activity, Heart, ShieldCheck].map((Icon, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 transition-all cursor-pointer">
                      <Icon size={18} />
                  </div>
              ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-12 lg:gap-24">
          <div className="text-left">
            <h3 className="text-xs font-black text-slate-900 dark:text-white mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                <Database size={14} className="text-blue-500" /> Infrastructure
            </h3>
            <ul className="flex flex-col gap-4 list-none p-0 m-0">
              <li><Link to="/departments" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors text-[0.65rem] font-black uppercase tracking-widest no-underline">Departments</Link></li>
              <li><Link to="/events" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors text-[0.65rem] font-black uppercase tracking-widest no-underline">Medical Events</Link></li>
              <li><Link to="/research" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors text-[0.65rem] font-black uppercase tracking-widest no-underline">Research Hub</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="text-xs font-black text-slate-900 dark:text-white mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe size={14} className="text-emerald-500" /> Support Node
            </h3>
            <ul className="flex flex-col gap-4 list-none p-0 m-0">
              <li><Link to="/contact" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors text-[0.65rem] font-black uppercase tracking-widest no-underline">Contact Ops</Link></li>
              <li><Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors text-[0.65rem] font-black uppercase tracking-widest no-underline">Identity Login</Link></li>
              <li><Link to="/register" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors text-[0.65rem] font-black uppercase tracking-widest no-underline">Network Join</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-24 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[0.6rem] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            © {new Date().getFullYear()} AXONX BIOMEDICAL NETWORK. ALL SYSTEMS OPERATIONAL.
        </p>
        <div className="flex gap-8 items-center opacity-40">
            <div className="flex items-center gap-2"><MapPin size={12} /><span className="text-[0.6rem] font-black uppercase">Maharashtra, IN</span></div>
            <div className="flex items-center gap-2"><ShieldCheck size={12} /><span className="text-[0.6rem] font-black uppercase">AES-256 SECURED</span></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
