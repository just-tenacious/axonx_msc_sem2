import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'patient',
        gender: '',
        dob: ''
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
            padding: '40px 20px'
        }}>
            <ThemeToggle />
            
            <div className="pro-card" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '40px',
                backgroundColor: 'var(--topbar-bg)',
                textAlign: 'center'
            }}>
                <h1 style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: 'var(--text-main)', 
                    marginBottom: '10px' 
                }}>
                    Create Account
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Join the AxonX clinical network</p>

                <form>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <input type="text" name="name" placeholder="Full Name" className="pro-input" value={formData.name} onChange={handleChange} required />
                        <input type="text" name="username" placeholder="Username" className="pro-input" value={formData.username} onChange={handleChange} required />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <input type="email" name="email" placeholder="Email Address" className="pro-input" style={{ width: '100%' }} value={formData.email} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <select name="gender" className="pro-input" value={formData.gender} onChange={handleChange} style={{ width: '100%' }}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="date" name="dob" className="pro-input" value={formData.dob} onChange={handleChange} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <select name="role" className="pro-input" style={{ width: '100%' }} value={formData.role} onChange={handleChange}>
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="student">Student</option>
                            <option value="researcher">Researcher</option>
                            <option value="hospital">Hospital</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <input type="password" name="password" placeholder="Password" className="pro-input" style={{ width: '100%' }} value={formData.password} onChange={handleChange} required />
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
                        Sign Up
                    </button>
                </form>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Already have an account? {' '}
                    <Link to="/login" style={{ 
                        color: 'var(--primary-accent)', 
                        textDecoration: 'none',
                        fontWeight: '600'
                    }}>
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
