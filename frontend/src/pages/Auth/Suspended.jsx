import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, LifeBuoy, Mail } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';

const Suspended = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-6 transition-colors duration-500">
            <ThemeToggle />
            <div className="pro-card w-full max-w-lg p-12 text-center animate-in zoom-in duration-500 shadow-2xl border-t-4 border-red-500">
                <div className="flex justify-center mb-8">
                    <Logo className="h-14 opacity-50 grayscale" />
                </div>
                
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                    <ShieldAlert size={40} />
                </div>
                
                <h1 className="text-3xl font-black text-[var(--text-main)] mb-3 tracking-tight">Access Suspended</h1>
                <p className="text-[var(--text-muted)] font-bold text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                    Your account has been temporarily restricted by the system administrator. Secure credentials are required for hospital portal access.
                </p>
                
                <div className="space-y-4">
                    <a 
                        href="mailto:support@axonx.com" 
                        className="w-full py-4 rounded-xl bg-[var(--text-main)] text-white font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        <Mail size={18} /> Contact Admin Registry
                    </a>
                    
                    <Link 
                        to="/login" 
                        className="w-full py-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-black text-sm flex items-center justify-center gap-2 hover:bg-[var(--hover-bg)]"
                    >
                        Return to Sign In
                    </Link>
                </div>

                <div className="mt-12 flex justify-center gap-6">
                    <button className="text-[0.65rem] font-black uppercase text-[var(--text-muted)] tracking-widest hover:text-blue-500 transition-colors flex items-center gap-2">
                        <LifeBuoy size={14} /> Help Center
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Suspended;
