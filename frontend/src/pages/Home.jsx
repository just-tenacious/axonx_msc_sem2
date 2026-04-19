import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-main)',
            textAlign: 'center',
            padding: '20px'
        }}>
            <ThemeToggle />
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>AxonX</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
                The next generation of clinical collaboration and research integration.
            </p>
            <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                <Link to="/login" className="pro-hover-lift" style={{
                    padding: '12px 30px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary-accent)',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: '600'
                }}>Get Started</Link>
            </div>
        </div>
    );
};

export default Home;
