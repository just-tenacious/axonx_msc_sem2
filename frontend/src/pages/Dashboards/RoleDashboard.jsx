import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const RoleDashboard = ({ role }) => (
    <MainLayout role={role}>
        <div className="pro-card" style={{ padding: '30px' }}>
            <h3>{role.charAt(0).toUpperCase() + role.slice(1)} Workspace</h3>
            <p>Welcome to your dedicated dashboard. Content will be added here based on your role logic.</p>
        </div>
    </MainLayout>
);

export default RoleDashboard;
