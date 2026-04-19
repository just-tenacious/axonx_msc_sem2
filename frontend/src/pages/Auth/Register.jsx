import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';
import { registerUser } from '../../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Calendar, ClipboardCheck } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        gender: '',
        dob: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Sign Up | AxonX Healthcare";
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const { name, username, email, password, confirmPassword, gender, dob } = formData;
        if (!name || !username || !email || !password || !confirmPassword || !gender || !dob) {
            toast.error("Please fill all fields");
            return false;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const loadingToast = toast.loading("Creating account...");
        try {
            const response = await registerUser(formData);
            if (response.data.success) {
                toast.success("Registration successful! Please sign in.", { id: loadingToast });
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-8 transition-colors duration-500">
            <ThemeToggle />
            
            <div className="pro-card w-full max-w-[650px] p-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-center mb-6">
                    <Logo className="h-14" />
                </div>
                
                <h1 className="text-2xl font-black text-[var(--text-main)] mb-1">Sign Up</h1>
                <p className="text-[var(--text-muted)] mb-8 font-bold text-sm">Create your AxonX account</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
                                <User size={10} /> Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                    <User size={16} />
                                </div>
                                <input type="text" name="name" placeholder="Full Name" className="pro-input w-full pl-10" value={formData.name} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
                                <User size={10} /> Username
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                    <User size={16} />
                                </div>
                                <input type="text" name="username" placeholder="Username" className="pro-input w-full pl-10" value={formData.username} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
                            <Mail size={10} /> Email
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                <Mail size={16} />
                            </div>
                            <input type="email" name="email" placeholder="Email Address" className="pro-input w-full pl-10" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2">Gender</label>
                            <select name="gender" className="pro-input w-full" value={formData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
                                <Calendar size={10} /> Birth Date
                            </label>
                            <div className="relative group">
                                <input type="date" name="dob" className="pro-input w-full pl-10" value={formData.dob} onChange={handleChange} />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                                    <Calendar size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2">Select User Role</label>
                        <select name="role" className="pro-input w-full font-bold" value={formData.role} onChange={handleChange}>
                            <option value="patient">Patient / User</option>
                            <option value="doctor">Medical Practitioner</option>
                            <option value="student">Medical Student</option>
                            <option value="researcher">Clinical Researcher</option>
                            <option value="hospital">Healthcare Facility</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
                                <Lock size={10} /> Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input type="password" name="password" placeholder="Password" className="pro-input w-full pl-10" value={formData.password} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
                                <Lock size={10} /> Confirm
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input type="password" name="confirmPassword" placeholder="Confirm" className="pro-input w-full pl-10" value={formData.confirmPassword} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="pro-hover-lift w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black text-md shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : <><ClipboardCheck size={20} /> Sign Up</>}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--border-color-light)]">
                    <p className="text-[var(--text-muted)] text-sm font-bold">
                        Already have an account? {' '}
                        <Link to="/login" className="text-[var(--primary-accent)] hover:underline font-black ml-1 uppercase tracking-tighter">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
