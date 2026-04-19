import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import OTPVerify from '../pages/Auth/OTPVerify';
import ResetPassword from '../pages/Auth/ResetPassword';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import Suspended from '../pages/Auth/Suspended';

// Shared Pages
import Profile from '../pages/Shared/Profile';

// Admin Specific Pages
import AdminDashboard from '../pages/Dashboards/AdminDashboard';
import Users from '../pages/Admin/Users';
import Departments from '../pages/Admin/Departments';
import Appointments from '../pages/Admin/Appointments';
import Events from '../pages/Admin/Events';
import Research from '../pages/Admin/Research';
import Chats from '../pages/Admin/Chats';
import Support from '../pages/Admin/Support';
import Analytics from '../pages/Admin/Analytics';

// Role Specific Dashboards
import RoleDashboard from '../pages/Dashboards/RoleDashboard';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<OTPVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/suspended" element={<Suspended />} />
            
            {/* Admin Portal (Sidebar Layout) */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="departments" element={<Departments />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="events" element={<Events />} />
                <Route path="research" element={<Research />} />
                <Route path="chats" element={<Chats />} />
                <Route path="support" element={<Support />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* Standard User Portal (Navbar Layout) */}
            <Route path="/dashboard" element={<UserLayout />}>
                <Route path="doctor" element={<RoleDashboard role="doctor" />} />
                <Route path="patient" element={<RoleDashboard role="patient" />} />
                <Route path="student" element={<RoleDashboard role="student" />} />
                <Route path="researcher" element={<RoleDashboard role="researcher" />} />
                <Route path="hospital" element={<RoleDashboard role="hospital" />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* Redirects */}
            <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
        </Routes>
    );
};

export default AppRoutes;
