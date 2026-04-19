import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Connect to our local clinical node
      const { data: users } = await axios.get(`http://localhost:5000/api/users?email=${credentials.email}`);
      
      if (users.length === 0) {
        toast.error('Identity not found in clinical database');
        setLoading(false);
        return;
      }

      const foundUser = users[0];

      if (foundUser.password !== credentials.password) {
        toast.error('Invalid security credentials');
        setLoading(false);
        return;
      }

      if (foundUser.isActive === false) {
        toast.error('Account is currently de-activated');
        setLoading(false);
        return;
      }

      // ✅ Authenticate and synchronize session
      login(foundUser);
      toast.success(`Welcome back, ${foundUser.name}`);
      
    } catch (err) {
      toast.error('Connection to security node failed');
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

  const inputStyle = {
    width: '100%',
    backgroundColor: 'rgba(248,250,252,0.8)',
    borderRadius: '1.25rem',
    padding: '1.25rem 1.5rem',
    border: '1px solid rgba(203,213,225,0.8)',
    outline: 'none',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    fontWeight: '700'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1121] flex items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-[32rem] bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[48px] p-16 shadow-2xl relative z-10 text-center">
        
        <div style={{
          fontSize: '3.5rem',
          background: 'linear-gradient(135deg, #38bdf8, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }} className="font-black italic drop-shadow-sm">⬡</div>

        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase">
          Portal Login
        </h2>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-12 italic">Execute identity handshake to access the AxonX network.</p>

        <form onSubmit={handleLogin} className="space-y-6 flex flex-col text-left">
          <div className="space-y-2">
            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Command Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="e.g. operator@axonx.medical"
              style={inputStyle}
              className="dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Credential Key</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              style={inputStyle}
              className="dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-[24px] uppercase tracking-widest text-[0.7rem] shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Synchronize Identity'}
          </button>
        </form>

        <div className="mt-12 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">
          New Node?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Request Access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
