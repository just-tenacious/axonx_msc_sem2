import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const UserLayout = () => {
    const { user } = useAuth();

    // If no session, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admins should use AdminLayout
    if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[var(--bg-color)] transition-colors duration-400">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Outlet />
                </div>
            </main>
            <footer className="mt-auto py-10 border-t border-[var(--border-color)] bg-[var(--topbar-bg)] transition-colors duration-400">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-bold text-[var(--text-muted)] tracking-widest uppercase">
                        &copy; 2026 AXONX Health Network
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default UserLayout;
