import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Activity, Users, FileText, Calendar, Building, MessageSquare,
    Zap, Clock, ShieldCheck, ArrowUpRight, TrendingUp, RefreshCcw,
    User as UserIcon, MousePointer2, AlertCircle, Sparkles, CircleDot,
    Stethoscope, GraduationCap, Heart, CheckCircle2, XCircle, Layers
} from 'lucide-react';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        patients: 0,
        doctors: 0,
        students: 0,
        researchers: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        totalResearch: 0,
        totalEvents: 0,
        activeEvents: 0,
        totalQueries: 0,
        pendingQueries: 0,
        departments: 0
    });
    const [loading, setLoading] = useState(true);
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resUsers, resApts, resRes, resEvts, resQu, resDepts] = await Promise.all([
                    axios.get(`${BASE_URL}/users`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${BASE_URL}/appointments`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${BASE_URL}/research-papers`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${BASE_URL}/events`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${BASE_URL}/support/queries`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${BASE_URL}/departments`).catch(() => ({ data: { data: [] } }))
                ]);

                const usersData = resUsers.data?.data || [];
                const aptsData = resApts.data?.data || [];
                const evtsData = resEvts.data?.data || [];
                const quData = resQu.data?.data || [];

                setStats({
                    totalUsers: usersData.length,
                    patients: usersData.filter(u => u.role === 'patient').length,
                    doctors: usersData.filter(u => u.role === 'doctor').length,
                    students: usersData.filter(u => u.role === 'student').length,
                    researchers: usersData.filter(u => u.role === 'researcher' || u.role === 'academic').length,

                    totalAppointments: aptsData.length,
                    pendingAppointments: aptsData.filter(a => a.status === 'Pending').length,
                    completedAppointments: aptsData.filter(a => a.status === 'Completed').length,

                    totalResearch: resRes.data?.data?.length || 0,

                    totalEvents: evtsData.length,
                    activeEvents: evtsData.filter(e => e.status === 'Upcoming' || e.status === 'Ongoing').length,

                    totalQueries: quData.length,
                    pendingQueries: quData.filter(q => q.status === 'Pending').length,

                    departments: resDepts.data?.data?.length || 0
                });

            } catch (err) {
                toast.error("Connectivity Issue: Please ensure backend is active", { icon: '🚀' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Socket.io Initialization
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('connect', () => {
            setSocketConnected(true);
            toast.success("Real-time telemetry active", {
                id: 'socket-conn',
                duration: 2000,
                style: { background: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
            });
        });

        socketRef.current.on('disconnect', () => setSocketConnected(false));

        socketRef.current.on('appointment_created', () => {
            setStats(prev => ({
                ...prev,
                totalAppointments: prev.totalAppointments + 1,
                pendingAppointments: prev.pendingAppointments + 1
            }));
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const cards = [
        // User Segments
        { label: 'Total Patients', val: stats.patients, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', trend: 'Global' },
        { label: 'Medical Doctors', val: stats.doctors, icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Verified' },
        { label: 'Clinical Students', val: stats.students, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Academic' },
        { label: 'Researchers', val: stats.researchers, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Scientific' },

        // Operations
        { label: 'Total Bookings', val: stats.totalAppointments, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'All Time' },
        { label: 'Pending Slots', val: stats.pendingAppointments, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Action Req' },
        { label: 'Research Assets', val: stats.totalResearch, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Published' },
        { label: 'Active Events', val: stats.activeEvents, icon: Building, color: 'text-sky-600', bg: 'bg-sky-50', trend: 'Live Now' },

        // Support & Departments
        { label: 'Open Queries', val: stats.pendingQueries, icon: MessageSquare, color: 'text-red-600', bg: 'bg-red-50', trend: 'Urgent' },
        { label: 'Department Nodes', val: stats.departments, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Configured' },
        { label: 'Total Queries', val: stats.totalQueries, icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-50', trend: 'Managed' },
        { label: 'Success Rate', val: stats.totalAppointments > 0 ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) + '%' : '100%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: 'Optimal' }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Telemetry...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700 pb-20 px-2">
            {/* Real-time Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="font-black text-5xl tracking-tight text-slate-900 dark:text-white uppercase italic">
                            Command <span className="text-blue-600 not-italic">Center</span>
                        </h1>
                        <Sparkles className="text-amber-400 animate-pulse" size={24} />
                    </div>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60 italic">Advanced Global Infrastructure Monitoring & Clinical KPI Matrix</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl border font-black text-[0.65rem] uppercase tracking-widest transition-all shadow-sm ${socketConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'}`}>
                        <CircleDot size={12} className={socketConnected ? 'animate-pulse' : ''} />
                        {socketConnected ? 'Real-time Link Active' : 'Offline Mode'}
                    </div>
                    <button onClick={() => window.location.reload()} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:rotate-180 transition-all duration-700 text-slate-400 hover:text-blue-500">
                        <RefreshCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Matrix Grid - Expanded with 12 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cards.map((s, i) => (
                    <div key={i} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[40px] flex flex-col gap-6 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-800 opacity-40 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`flex items-center justify-center rounded-[24px] w-14 h-14 shadow-lg ${s.bg} ${s.color} group-hover:scale-110 transition-transform duration-500`}>
                                <s.icon size={26} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[0.6rem] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 border shadow-sm ${s.bg} ${s.color} border-transparent`}>
                                    <TrendingUp size={10} /> {s.trend}
                                </span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <span className="text-slate-400 text-[0.65rem] font-black uppercase tracking-[0.1em] block mb-2 opacity-70 italic">{s.label}</span>
                            <h2 className="font-black text-4xl text-slate-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm">{s.val.toLocaleString()}</h2>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default AdminDashboard;
