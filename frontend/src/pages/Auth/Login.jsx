import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';
import { loginUser } from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        identifier: '', 
        password: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Sign In | AxonX Healthcare";
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!formData.identifier.trim()) {
            toast.error("Please enter email or username");
            return false;
        }
        if (!formData.password) {
            toast.error("Please enter password");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const loadingToast = toast.loading("Checking credentials...");
        
        try {
            const response = await loginUser(formData);
            if (response.data.success) {
                const userData = response.data.data;

                // STATUS CHECK: Block suspended users
                if (userData.isActive === false) {
                    toast.error("Account Restricted", { id: loadingToast });
                    navigate('/suspended');
                    return;
                }

                login(userData);
                toast.success(`Welcome back!`, { id: loadingToast });
                
                if (userData.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate(`/dashboard/${userData.role}`);
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Sign in failed. Invalid credentials.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-5 transition-colors duration-500">
            <ThemeToggle />
            
            <div className="pro-card w-full max-w-[450px] p-10 text-center animate-in fade-in zoom-in duration-500 overflow-hidden">
                {/* Logo Section */}
                <div className="mb-6 flex justify-center">
                    <Logo className="h-16" />
                </div>

                <h1 className="text-2xl font-black text-[var(--text-main)] mb-1">Sign In</h1>
                <p className="text-[var(--text-muted)] mb-8 font-bold text-sm">AxonX Healthcare System</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] transition-colors z-10">
                            <Mail size={18} />
                        </div>
                        <input 
                            type="text"
                            name="identifier"
                            placeholder="Email or Username"
                            className="pro-input w-full pl-12 relative z-0"
                            value={formData.identifier}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] transition-colors z-10">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="pro-input w-full pl-12 relative z-0"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-right">
                            <Link to="/forgot-password" size="sm" className="text-[var(--primary-accent)] text-xs font-bold hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="pro-hover-lift w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black text-md shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : <><LogIn size={18} /> Sign In</>}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--border-color-light)]">
                    <p className="text-[var(--text-muted)] text-sm font-bold">
                        New here? {' '}
                        <Link to="/register" className="text-[var(--primary-accent)] hover:underline font-black ml-1 uppercase tracking-tighter">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
