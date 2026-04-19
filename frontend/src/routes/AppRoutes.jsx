import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import OTPVerify from '../pages/Auth/OTPVerify';
import ResetPassword from '../pages/Auth/ResetPassword';
import Departments from '../pages/Departments';
import Events from '../pages/Events';
import Research from '../pages/Research';
import Contact from '../pages/Contact'; // Public high-fidelity contact node

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import MainLayout from '../layouts/MainLayout';
import Suspended from '../pages/Auth/Suspended';

// Shared Pages
import Profile from '../pages/Shared/Profile';

// Admin Specific Pages
import AdminDashboard from '../pages/Dashboards/AdminDashboard';
import Users from '../pages/Admin/Users';
import AdminDepartments from '../pages/Admin/Departments';
import Appointments from '../pages/Admin/Appointments';
import AdminEvents from '../pages/Admin/Events';
import AdminResearch from '../pages/Admin/Research';
import Chats from '../pages/Admin/Chats';
import Support from '../pages/Admin/Support';
import Analytics from '../pages/Admin/Analytics';

// Role Specific Dashboards
import RoleDashboard from '../pages/Dashboards/RoleDashboard';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/otp-verify" element={<OTPVerify />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/suspended" element={<Suspended />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/events" element={<Events />} />
                <Route path="/research" element={<Research />} />
                <Route path="/contact" element={<Contact />} />
            </Route>
            
            {/* Admin Portal (Sidebar Layout) */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="departments" element={<AdminDepartments />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="research" element={<AdminResearch />} />
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
