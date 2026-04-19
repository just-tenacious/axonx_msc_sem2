import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, Users, FileText, Calendar, Building, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        doctors: 0,
        appointments: 0,
        research: 0,
        events: 0,
        queries: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                const requests = [
                    axios.get('http://localhost:5000/api/users').catch(() => ({ data: { data: [] } })),
                    axios.get('http://localhost:5000/api/appointments').catch(() => ({ data: { data: [] } })),
                    axios.get('http://localhost:5000/api/researchPapers').catch(() => ({ data: { data: [] } })),
                    axios.get('http://localhost:5000/api/events').catch(() => ({ data: { data: [] } })),
                    axios.get('http://localhost:5000/api/contactQueries').catch(() => ({ data: { data: [] } }))
                ];

                const [resUsers, resApts, resRes, resEvts, resQu] = await Promise.all(requests);

                const usersData = resUsers.data?.data || [];
                const doctorCount = usersData.filter(u => u.role?.toLowerCase() === 'doctor').length;

                setStats({
                    users: usersData.length,
                    doctors: doctorCount,
                    appointments: resApts.data?.data?.length || 0,
                    research: resRes.data?.data?.length || 0,
                    events: resEvts.data?.data?.length || 0,
                    queries: resQu.data?.data?.length || 0
                });
            } catch (err) {
                toast.error("Failed to sync dashboard metrics");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const cards = [
        { label: 'Total Patients', val: stats.users - stats.doctors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Medical Staff', val: stats.doctors, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Live Bookings', val: stats.appointments, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Active Research', val: stats.research, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Current Events', val: stats.events, icon: Building, color: 'text-sky-600', bg: 'bg-sky-100' },
        { label: 'Support Tickets', val: stats.queries, icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-100' }
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="flex flex-col gap-2">
                <h1 className="font-black text-4xl tracking-tight text-slate-900">
                    Control Center Overview
                </h1>
                <p className="text-slate-500 font-medium">System-wide intelligence overview and clinical tracking.</p>
            </div>

            {/* Primary Stats Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards.map((s, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`flex items-center justify-center rounded-2xl w-16 h-16 min-w-[64px] shadow-sm ${s.bg} ${s.color}`}>
                            <s.icon size={26} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-400 text-[0.65rem] font-black uppercase tracking-widest">{s.label}</span>
                            <h2 className="font-black text-3xl mt-1 text-slate-800">{s.val}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simulated Live Architecture Status */}
            <div className="bg-white border border-slate-200 p-10 h-full relative overflow-hidden rounded-[2.5rem] shadow-sm">
                <div className="relative z-10 flex flex-col gap-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-black text-xl mb-2 text-slate-800">Platform Health</h4>
                            <p className="text-slate-500 font-medium text-sm">Engagement efficiency across major domains.</p>
                        </div>
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[0.65rem] font-black uppercase tracking-widest border border-blue-100">All Systems Normal</div>
                    </div>

                    <div className="flex flex-col gap-6 max-w-4xl">
                        {[
                            { l: 'Clinical Consultations Flow', p: '92%', c: 'bg-emerald-500', t: 'text-emerald-600' },
                            { l: 'Research Content Delivery', p: '78%', c: 'bg-purple-500', t: 'text-purple-600' },
                            { l: 'Emergency Request Routing', p: '99%', c: 'bg-blue-500', t: 'text-blue-600' }
                        ].map((m, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="flex justify-between text-[0.65rem] font-black text-slate-500 tracking-widest uppercase">
                                    <span>{m.l}</span>
                                    <span className={m.t}>{m.p} Efficiency</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div className={`${m.c} h-3 rounded-full transition-all duration-1000`} style={{ width: m.p }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
