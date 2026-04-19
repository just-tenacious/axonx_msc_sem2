import React from 'react';

const AdminDashboard = () => (
    <div className="pro-card p-8">
        <h2 className="text-2xl font-bold mb-4">Admin Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-blue-600 font-semibold mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-blue-900">1,280</h3>
            </div>
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-emerald-600 font-semibold mb-1">Active Events</p>
                <h3 className="text-3xl font-bold text-emerald-900">24</h3>
            </div>
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-amber-600 font-semibold mb-1">Pending Support</p>
                <h3 className="text-3xl font-bold text-amber-900">12</h3>
            </div>
        </div>
    </div>
);

export default AdminDashboard;
