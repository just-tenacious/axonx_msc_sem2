import React from 'react';
import { Activity } from 'lucide-react';

const RoleDashboard = ({ role }) => (
    <div className="space-y-12 animate-in fade-in duration-700">
        <div className="text-center space-y-3">
            <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase">{role} Workspace</h1>
            <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
            <p className="text-[var(--text-muted)] text-sm font-bold opacity-60 italic uppercase tracking-widest">Global Dashboard for {role} integration and clinical oversight.</p>
        </div>
        
        <div className="pro-card p-12 bg-white shadow-xl rounded-[48px] border-0 text-center">
            <div className="p-6 bg-blue-50 text-blue-500 w-fit mx-auto rounded-3xl mb-6">
                <Activity size={42} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Access Control Active</h3>
            <p className="text-sm font-bold text-slate-500 max-w-md mx-auto mt-2">Welcome to your dedicated command node. Detailed clinical metrics and operational tools are being synchronized for your role.</p>
        </div>
    </div>
);

export default RoleDashboard;
