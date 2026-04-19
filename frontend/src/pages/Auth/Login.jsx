import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: '', // email or username
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-color)',
            padding: '20px'
        }}>
            <ThemeToggle />
            
            <div className="pro-card" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '40px',
                backgroundColor: 'var(--topbar-bg)',
                textAlign: 'center'
            }}>
                {/* Logo Section */}
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid #00b4d8',
                        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{ width: '20px', height: '20px', border: '2px solid #00b4d8', clipPath: 'inherit' }} />
                    </div>
                </div>

                <h1 style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: 'var(--text-main)', 
                    marginBottom: '30px' 
                }}>
                    Welcome Back
                </h1>

                <form>
                    <div style={{ marginBottom: '20px' }}>
                        <input 
                            type="text"
                            name="identifier"
                            placeholder="Email or Username"
                            className="pro-input"
                            style={{ width: '100%', backgroundColor: '#eef3ff' }}
                            value={formData.identifier}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <input 
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="pro-input"
                            style={{ width: '100%', backgroundColor: '#eef3ff' }}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <Link to="/forgot-password" style={{ 
                                color: 'var(--primary-accent)', 
                                fontSize: '0.85rem', 
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="pro-hover-lift"
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: 'none',
                            borderRadius: '12px',
                            background: 'linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        Sign In
                    </button>
                </form>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Don't have an account? {' '}
                    <Link to="/register" style={{ 
                        color: 'var(--primary-accent)', 
                        textDecoration: 'none',
                        fontWeight: '600'
                    }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
