import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../utils/api';
import toast from 'react-hot-toast';
import { Mail, Lock, ClipboardCheck } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import Logo from '../../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser({ 
          identifier: credentials.identifier, 
          password: credentials.password 
      });

      const foundUser = response.data.data;

      if (foundUser.isActive === false) {
        navigate('/suspended');
        setLoading(false);
        return;
      }

      // ✅ Authenticate and synchronize session
      login(foundUser);
      toast.success(`Welcome back, ${foundUser.name}`);

    } catch (err) {
      toast.error(err.response?.data?.error || 'Connection to security node failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(`/dashboard/${user.role}`);
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen pt-24 pb-8 flex items-center justify-center bg-[var(--bg-color)] px-8 transition-colors duration-500">
      <ThemeToggle />

      <div className="pro-card w-full max-w-[500px] p-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex justify-center mb-6">
          <Logo className="h-14" />
        </div>

        <h1 className="text-2xl font-black text-[var(--text-main)] mb-1">Sign In</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
              <Mail size={10} /> Email / Username
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                <Mail size={16} />
              </div>
              <input
                type="text"
                name="identifier"
                value={credentials.identifier}
                onChange={handleChange}
                placeholder="e.g. username or email"
                className="pro-input w-full pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase ml-2 flex items-center gap-1">
              <Lock size={10} /> Password
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-accent)] z-10 transition-colors">
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="pro-input w-full pl-10"
                required
              />
            </div>
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-sm font-black text-[var(--primary-accent)] hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="pro-hover-lift w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black text-md shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : <><ClipboardCheck size={20} /> Sign In</>}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-color-light)]">
          <p className="text-[var(--text-muted)] text-sm font-bold">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--primary-accent)] hover:underline font-black ml-1 uppercase tracking-tighter">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
