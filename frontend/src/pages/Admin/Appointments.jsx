import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, CheckCircle2, CheckCircle, XCircle,
    Search, Filter, ChevronRight, ChevronLeft, ArrowLeft,
    User, Mail, Phone, MapPin, Activity, Stethoscope,
    CalendarDays, Clock3, MoreVertical, LayoutGrid, List,
    Eye, Download, RefreshCw, Edit2, X, FileText, Check,
    AlertCircle, Briefcase, UserCheck, ShieldCheck, Info
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '../../components/Admin/Pagination';

const BASE = 'http://localhost:5000/api';

const Appointments = () => {
    const [view, setView] = useState('dashboard'); // dashboard, list, detail, edit
    const [stats, setStats] = useState({ all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [editForm, setEditForm] = useState({
        date: '', time: '', status: '', type: ''
    });

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (view === 'list') fetchAppointments();
    }, [view, selectedStatus]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${BASE}/appointments/stats`);
            if (data.success) setStats(data.data);
        } catch (err) { console.error("Stats fetch error:", err); }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/appointments?status=${selectedStatus}`);
            if (data.success) setAppointments(data.data);
        } catch (err) { toast.error("Failed to load records"); }
        finally { setLoading(false); }
    };

    const handleStatClick = (status) => {
        setSelectedStatus(status);
        setView('list');
        setCurrentPage(1);
    };

    const openDetail = (appt) => {
        setSelectedAppointment(appt);
        setView('detail');
    };

    const openEdit = (appt) => {
        setSelectedAppointment(appt);
        setEditForm({
            date: appt.date ? appt.date.substring(0, 10) : '',
            time: appt.time || '',
            status: appt.status || 'Pending',
            type: appt.type || 'offline'
        });
        setView('edit');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const t = toast.loading('Updating…');
            await axios.put(`${BASE}/appointments/${selectedAppointment._id}`, editForm);
            toast.success('Updated successfully', { id: t });
            setView('list');
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Update failed');
        }
    };

    const filteredAppts = appointments.filter(a => {
        const patientName = a.patientId?.name?.toLowerCase() || '';
        const doctorName = a.doctorId?.name?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return patientName.includes(term) || doctorName.includes(term);
    });

    const totalPages = Math.ceil(filteredAppts.length / itemsPerPage);
    const pagedAppts = filteredAppts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    /* ── DASHBOARD VIEW ─────────────────────────────────────────────────── */
    if (view === 'dashboard') {
        const cardConfig = [
            { id: 'All', name: 'All Logs', count: stats.all, icon: LayoutGrid, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
            { id: 'Pending', name: 'Pending', count: stats.pending, icon: Clock, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50' },
            { id: 'Confirmed', name: 'Confirmed', count: stats.confirmed, icon: UserCheck, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50' },
            { id: 'Completed', name: 'Completed', count: stats.completed, icon: CheckCircle, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50' },
            { id: 'Cancelled', name: 'Cancelled', count: stats.cancelled, icon: AlertCircle, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
        ];

        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter">Appointment Management</h1>
                    <div className="w-24 h-1.5 bg-indigo-500 mx-auto rounded-full"></div>
                    <p className="text-[var(--text-muted)] text-sm font-bold opacity-60 italic">Centralized node for clinical booking lifecycle and specialist allocation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cardConfig.map((card) => (
                        <button key={card.id} onClick={() => handleStatClick(card.id)} className="group relative p-10 bg-white dark:bg-[#1e293b]/50 rounded-[48px] border border-[var(--border-color-light)] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110`}></div>
                            <div className="relative z-10 space-y-8">
                                <div className={`p-6 rounded-3xl ${card.bg} text-indigo-600 w-fit shadow-lg group-hover:rotate-12 transition-transform`}>
                                    <card.icon size={42} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{card.count}</h3>
                                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{card.name}</p>
                                    <p className="text-[0.65rem] font-bold text-[var(--text-muted)] opacity-50 italic mt-3">Manage all {card.id.toLowerCase()} sessions</p>
                                </div>
                                <div className="pt-2 flex items-center text-indigo-500 font-black text-[0.65rem] uppercase tracking-tighter group-hover:gap-2 transition-all">
                                    Open Log <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ──────────────────────────────────────────────────────── */
    if (view === 'list') {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-[var(--border-color-light)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('dashboard')} className="p-3 rounded-2xl bg-white text-[var(--text-muted)] hover:text-indigo-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={20} /></button>
                        <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            <span className="opacity-50">Admin</span><ChevronRight size={12} className="opacity-30" />
                            <button onClick={() => setView('dashboard')} className="hover:text-indigo-500">Appointments</button><ChevronRight size={12} className="opacity-30" />
                            <span className="text-indigo-500 bg-indigo-50 px-3 py-1 rounded-xl">{selectedStatus} Log</span>
                        </nav>
                    </div>
                </div>

                <div className="pro-card p-0 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[var(--border-color-light)] flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} /><input type="text" placeholder="Search entries…" className="pro-input w-full pl-11 h-12" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} /></div>
                        <div className="flex bg-[var(--bg-color)] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
                            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                                <button key={s} onClick={() => { setSelectedStatus(s); setCurrentPage(1); }} className={`px-4 py-2 text-[0.6rem] font-black uppercase rounded-xl transition-all whitespace-nowrap ${selectedStatus === s ? 'bg-white text-indigo-500 shadow-sm' : 'text-[var(--text-muted)]'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                            <thead className="bg-[#f8fafc] border-b border-[var(--border-color-light)]"><tr><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest w-20 text-center">SR NO</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Client Identity</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Medical lead</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Schedule</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-[var(--border-color-light)]">
                                {loading ? (<tr><td colSpan={6} className="px-8 py-20 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-indigo-500 opacity-20" /></td></tr>) :
                                    pagedAppts.map((appt, idx) => (
                                        <tr key={appt._id} className="hover:bg-indigo-50/5 transition-colors group">
                                            <td className="px-8 py-6 text-xs font-bold text-[var(--text-muted)] opacity-40 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black border border-indigo-100 overflow-hidden">{appt.patientId?.avatar ? <img src={appt.patientId?.avatar} className="w-full h-full object-cover" /> : appt.patientId?.username?.[0]}</div><div><p className="text-sm font-black text-[var(--text-main)] tracking-tight">{appt.patientId?.name || 'Unknown'}</p><p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase tracking-widest italic">{appt.patientId?.role}</p></div></div></td>
                                            <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100"><Stethoscope size={18} /></div><div><p className="text-sm font-black text-[var(--text-main)] tracking-tight">Dr. {appt.doctorId?.name}</p><p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase italic">{appt.doctorId?.email}</p></div></div></td>
                                            <td className="px-8 py-6"><div className="space-y-1"><div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase"><Calendar size={12} /> {new Date(appt.date).toLocaleDateString()}</div><div className="flex items-center gap-1.5 text-[0.6rem] font-black text-[var(--text-muted)]"><Clock size={12} /> {appt.time}</div></div></td>
                                            <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-xl border text-[0.55rem] font-black uppercase tracking-[0.1em] ${getStatusStyle(appt.status)}`}>{appt.status}</span></td>
                                            <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2.5"><button onClick={() => openDetail(appt)} className="p-3 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Eye size={18} /></button><button onClick={() => openEdit(appt)} className="p-3 text-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Edit2 size={18} /></button></div></td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-[var(--border-color-light)] bg-slate-50/50">
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredAppts.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── DETAIL VIEW ────────────────────────────────────────────────────── */
    if (view === 'detail' && selectedAppointment) {
        const a = selectedAppointment;
        return (
            <div className="animate-in zoom-in-95 duration-500 max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-4 rounded-[28px] bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={24} /></button>
                    <nav className="flex items-center gap-3 text-[0.7rem] font-black uppercase tracking-widest text-[var(--text-muted)]"><button onClick={() => setView('dashboard')}>Appointments</button><ChevronRight size={12} className="opacity-30" /><button onClick={() => setView('list')}>{selectedStatus} Log</button><ChevronRight size={12} className="opacity-30" /><span className="text-blue-500 italic">{a.patientId?.name || 'Unknown Patient'}</span></nav>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-start">
                    {/* Left Column (Ratio 5) - Patient and Doctor Profiles */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="pro-card p-10 bg-white shadow-xl border-0 rounded-[48px]">
                            <h4 className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-10 flex items-center gap-3"><User size={18} className="text-indigo-500" /> Patient Identity</h4>
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-[36px] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden"><img src={a.patientId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.patientId?.username}`} className="w-full h-full object-cover" /></div>
                                <div className="flex-1 text-left">
                                    <div className="space-y-4">
                                        <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Full Name</p><p className="text-sm font-black text-slate-800">{a.patientId?.name || 'N/A'}</p></div>
                                        <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Username</p><p className="text-sm font-black text-slate-600">@{a.patientId?.username || 'N/A'}</p></div>
                                        <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Email</p><p className="text-xs font-black text-blue-500 italic truncate" title={a.patientId?.email}>{a.patientId?.email || 'N/A'}</p></div>
                                        <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Role</p><p className="text-sm font-black text-slate-600 capitalize">{a.patientId?.role || 'Patient'}</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pro-card p-10 bg-white shadow-xl border-0 rounded-[48px] border-l-[16px] border-indigo-500">
                            <h4 className="text-[0.65rem] font-black text-indigo-500 uppercase tracking-widest mb-10 flex items-center gap-3"><Stethoscope size={18} /> Medical Lead</h4>
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-[32px] bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-xl border-4 border-white"><Briefcase size={36} /></div>
                                <div className="flex-1 space-y-4 text-left">
                                    <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Full Name</p><p className="text-sm font-black text-slate-800">Dr. {a.doctorId?.name || 'N/A'}</p></div>
                                    <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Username</p><p className="text-sm font-black text-slate-600">@{a.doctorId?.username || 'N/A'}</p></div>
                                    <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Email</p><p className="text-xs font-black text-indigo-600 italic truncate" title={a.doctorId?.email}>{a.doctorId?.email || 'N/A'}</p></div>
                                    <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1 ml-1">Role</p><p className="text-sm font-black text-slate-600 capitalize">{a.doctorId?.role || 'Doctor'}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Ratio 6) - Appointment Details */}
                    <div className="lg:col-span-6 h-full">
                        <div className="pro-card p-12 bg-white shadow-xl border-0 rounded-[48px] border-t-[16px] border-emerald-500 h-full flex flex-col">
                            <h4 className="text-[0.65rem] font-black text-emerald-500 uppercase tracking-widest mb-12 flex items-center justify-between border-b pb-6">
                                <div className="flex items-center gap-3"><Calendar size={22} /> Session Protocol</div>
                                <button onClick={() => openEdit(a)} className="text-[0.65rem] font-black bg-emerald-50 text-emerald-600 px-5 py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"><Edit2 size={14} /> Update Record</button>
                            </h4>

                            <div className="grid grid-cols-2 gap-y-12 gap-x-8 text-left flex-1 content-start">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><Calendar size={14} /> Scheduled Date</p>
                                    <p className="text-lg font-black text-slate-800">{a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><Clock size={14} /> Allocated Time</p>
                                    <p className="text-lg font-black text-slate-800">{a.time || 'N/A'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><Briefcase size={14} /> Modality</p>
                                    <p className="text-lg font-black text-slate-800 capitalize">{a.type || 'Offline'}</p>
                                </div>
                                <div className={`p-6 rounded-3xl border shadow-sm ${getStatusStyle(a.status)}`}>
                                    <p className="text-[0.65rem] font-black uppercase mb-2 ml-1 tracking-widest flex items-center gap-2 opacity-70"><CheckCircle size={14} /> Current Status</p>
                                    <p className="text-xl font-black uppercase tracking-wider italic">{a.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── EDIT VIEW ──────────────────────────────────────────────────────── */
    if (view === 'edit' && selectedAppointment) {
        return (
            <div className="animate-in slide-in-from-bottom-6 duration-500 max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4"><button onClick={() => setView('detail')} className="p-4 rounded-[28px] bg-white border border-[var(--border-color)] shadow-sm"><X size={24} /></button></div>
                <div className="pro-card p-14 bg-white shadow-2xl border-0 rounded-[56px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div><div className="mb-14"><h2 className="text-4xl font-black text-slate-800 tracking-tighter">Update Record</h2><div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full"></div></div>
                    <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-12 text-left">
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Date</label><input type="date" required className="pro-input w-full h-16 px-6 rounded-[24px] font-bold" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} /></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Slot Time</label><input type="time" required className="pro-input w-full h-16 px-6 rounded-[24px] font-bold" value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} /></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Status Protocol</label><select className="pro-input w-full h-16 px-6 rounded-[24px] font-bold italic" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}><option value="Pending">Pending</option><option value="Confirmed">Confirmed</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Mode</label><select className="pro-input w-full h-16 px-6 rounded-[24px] font-bold" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}><option value="online">Online</option><option value="offline">Offline</option></select></div>
                        <div className="col-span-2 pt-10 flex gap-6 text-center"><button type="button" onClick={() => setView('detail')} className="flex-1 py-5 border-2 text-slate-400 font-extrabold rounded-[28px] hover:bg-slate-50 transition-all uppercase text-[0.7rem] tracking-widest">Cancel</button><button type="submit" className="flex-1 py-5 bg-emerald-500 text-white font-extrabold rounded-[28px] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all uppercase text-[0.7rem] tracking-widest">Update</button></div>
                    </form>
                </div>
            </div>
        );
    }
    return null;
};

export default Appointments;
