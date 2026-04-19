import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const MainLayout = ({ children, role }) => {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <ThemeToggle />

            {/* Sidebar Placeholder */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--sidebar-bg)',
                color: 'var(--sidebar-text)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '40px', color: 'white' }}>
                    AxonX <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{role.toUpperCase()}</span>
                </div>

                <nav style={{ flexGrow: 1 }}>
                    <div style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-text)' }}>
                        Dashboard
                    </div>
                </nav>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Logout
                </button>
            </aside>

            {/* Content Area */}
            <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--text-main)' }}>Welcome back, {role}</h2>
                </header>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
