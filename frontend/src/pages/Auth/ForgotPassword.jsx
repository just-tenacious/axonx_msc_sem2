import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Recovery | AxonX Healthcare";
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-5 transition-colors duration-500">
            <ThemeToggle />
            <div className="pro-card w-full max-w-[450px] p-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                    <Logo className="h-12" />
                </div>
                
                <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">Recover Access</h2>
                <p className="text-[var(--text-muted)] mb-8 text-sm font-bold">Provide your email address to receive a security code.</p>
                
                <div className="space-y-6">
                    <div className="relative group text-left">
                        <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 mb-1.5 block">Account Email</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="pro-input w-full pl-12" 
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/otp-verify')}
                        className="pro-hover-lift w-full py-4 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black text-md shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        <KeyRound size={20} /> Request OTP
                    </button>
                    
                    <div className="pt-4 border-t border-[var(--border-color-light)]">
                        <Link to="/login" className="flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary-accent)] text-xs font-black uppercase tracking-widest transition-colors">
                            <ArrowLeft size={14} /> Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
