import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import OTPVerify from '../pages/Auth/OTPVerify';
import ResetPassword from '../pages/Auth/ResetPassword';
import AdminDashboard from '../pages/Dashboards/AdminDashboard';
import RoleDashboard from '../pages/Dashboards/RoleDashboard';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<OTPVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Role Specific Routes */}
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/doctor" element={<RoleDashboard role="doctor" />} />
            <Route path="/dashboard/patient" element={<RoleDashboard role="patient" />} />
            <Route path="/dashboard/student" element={<RoleDashboard role="student" />} />
            <Route path="/dashboard/researcher" element={<RoleDashboard role="researcher" />} />
            <Route path="/dashboard/hospital" element={<RoleDashboard role="hospital" />} />
        </Routes>
    );
};

export default AppRoutes;
