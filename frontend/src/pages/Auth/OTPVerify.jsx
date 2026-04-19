import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const OTPVerify = () => {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
            <ThemeToggle />
            <div className="pro-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Verify OTP</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Enter the 6-digit code sent to your email.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                    {[1,2,3,4,5,6].map(i => (
                        <input key={i} type="text" maxLength="1" className="pro-input" style={{ width: '45px', textAlign: 'center', padding: '10px' }} />
                    ))}
                </div>
                <button 
                    onClick={() => navigate('/reset-password')}
                    className="pro-hover-lift"
                    style={{
                        width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
                        background: 'linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)', color: 'white', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    Verify & Proceed
                </button>
            </div>
        </div>
    );
};

export default OTPVerify;
