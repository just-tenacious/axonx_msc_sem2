import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const ResetPassword = () => {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
            <ThemeToggle />
            <div className="pro-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Reset Password</h2>
                <div style={{ marginBottom: '15px' }}>
                    <input type="password" placeholder="New Password" className="pro-input" style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <input type="password" placeholder="Confirm New Password" className="pro-input" style={{ width: '100%' }} />
                </div>
                <button 
                    onClick={() => navigate('/login')}
                    className="pro-hover-lift"
                    style={{
                        width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
                        background: 'linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)', color: 'white', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    Update Password
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;
