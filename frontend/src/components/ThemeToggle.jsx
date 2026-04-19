import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <button 
            onClick={toggleTheme}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '10px 15px',
                backgroundColor: 'var(--primary-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000,
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s'
            }}
            className="pro-hover-lift"
        >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
    );
};

export default ThemeToggle;
