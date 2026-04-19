import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const ForgotPassword = () => {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
            <ThemeToggle />
            <div className="pro-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Forgot Password</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Enter your email to receive an OTP.</p>
                <input type="email" placeholder="Email Address" className="pro-input" style={{ width: '100%', marginBottom: '20px' }} />
                <button 
                    onClick={() => navigate('/otp-verify')}
                    className="pro-hover-lift"
                    style={{
                        width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
                        background: 'linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)', color: 'white', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    Send OTP
                </button>
                <Link to="/login" style={{ display: 'block', marginTop: '20px', color: 'var(--primary-accent)', textDecoration: 'none' }}>Back to Login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
