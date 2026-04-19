import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';
import { ShieldCheck, Timer } from 'lucide-react';
import toast from 'react-hot-toast';

const OTPVerify = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60); // 60 second timer
    const inputRefs = useRef([]);

    useEffect(() => {
        document.title = "Verify OTP | AxonX Healthcare";
        
        const timer = timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length < 6) {
            toast.error("Please enter the full 6-digit code");
            return;
        }
        if (timeLeft === 0) {
            toast.error("Code expired. Please resend.");
            return;
        }
        toast.success("Security code verified!");
        navigate('/reset-password');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-5 transition-colors duration-500">
            <ThemeToggle />
            <div className="pro-card w-full max-w-[450px] p-10 text-center animate-in fade-in zoom-in duration-500 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <Logo className="h-12" />
                </div>
                
                <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">Verify Security Code</h2>
                <p className="text-[var(--text-muted)] mb-8 text-sm font-bold italic tracking-tight">Access code sent to your registered channel.</p>
                
                <div className="flex gap-2 justify-center mb-8">
                    {otp.map((data, i) => (
                        <input 
                            key={i}
                            ref={el => inputRefs.current[i] = el}
                            type="text" 
                            maxLength="1" 
                            className="pro-input !p-0 w-12 h-14 text-center text-xl font-black focus:scale-110 focus:border-[#0ea5e9] transition-all" 
                            value={data}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                        />
                    ))}
                </div>

                <div className="mb-8 flex items-center justify-center gap-2 font-black">
                    <Timer size={18} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-[var(--primary-accent)]'} />
                    <span className={timeLeft < 10 ? 'text-red-500' : 'text-[var(--text-main)]'}>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                </div>
                
                <button 
                    onClick={handleVerify}
                    className="pro-hover-lift w-full py-4 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black text-md shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={timeLeft === 0}
                >
                    <ShieldCheck size={20} /> Verify & Continue
                </button>

                <div className="mt-8 flex items-center justify-between">
                    <button 
                        onClick={() => setTimeLeft(60)}
                        disabled={timeLeft > 0}
                        className="text-[var(--primary-accent)] text-xs font-black uppercase tracking-widest hover:underline disabled:opacity-30 disabled:no-underline"
                    >
                        Resend Code
                    </button>
                    <button onClick={() => navigate('/login')} className="text-[var(--text-muted)] text-xs font-bold hover:text-[var(--text-main)]">
                        Cancel Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OTPVerify;
