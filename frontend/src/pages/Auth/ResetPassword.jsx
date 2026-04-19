import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';
import { Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Reset Keys | AxonX Healthcare";
    }, []);

    const handleReset = () => {
        toast.success("Security keys updated successfully!");
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-5 transition-colors duration-500">
            <ThemeToggle />
            <div className="pro-card w-full max-w-[450px] p-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                    <Logo className="h-12" />
                </div>
                
                <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">Create New Password</h2>
                <p className="text-[var(--text-muted)] mb-8 text-sm font-bold">Secure your account with a new access key.</p>
                
                <div className="space-y-5">
                    <div className="relative group text-left">
                        <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 mb-1.5 block">New Password</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                placeholder="Min 6 characters" 
                                className="pro-input w-full pl-12" 
                            />
                        </div>
                    </div>

                    <div className="relative group text-left">
                        <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 mb-1.5 block">Confirm Key</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                placeholder="Match new password" 
                                className="pro-input w-full pl-12" 
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={handleReset}
                            className="pro-hover-lift w-full py-4 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black text-md shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            <Save size={20} /> Update Credentials
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
