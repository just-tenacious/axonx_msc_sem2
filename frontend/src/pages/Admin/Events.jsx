import React, { useState, useEffect } from 'react';
import { 
    Calendar, MapPin, Users, Ticket, CheckCircle2, Clock, XCircle, 
    Search, Filter, ChevronRight, ArrowLeft, Plus, Eye, Edit2, 
    Activity, Info, CalendarDays, ExternalLink, RefreshCw, X, Check,
    ShieldCheck, Briefcase, Award
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE = 'http://localhost:5000/api';

const Events = () => {
    const [view, setView] = useState('dashboard'); // dashboard, list, detail, edit
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ all: 48, upcoming: 12, ongoing: 5, completed: 25, cancelled: 6 });
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '', date: '', location: '', status: '', category: '', attendees: 0
    });

    useEffect(() => {
        fetchStats();
        if (view === 'list') fetchEvents();
    }, [view, selectedStatus]);

    const fetchStats = async () => {
        try { setStats({ all: 48, upcoming: 12, ongoing: 5, completed: 25, cancelled: 6 }); } catch (err) {}
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const mock = Array.from({ length: 20 }).map((_, i) => ({
                _id: `evt-${i+5000}`,
                title: `${['Medical Summit', 'Surgical Workshop', 'Clinical Research Symposium', 'Health Expo'][i % 4]} 2026`,
                date: '2026-05-15',
                location: ['Mumbai', 'Delhi', 'Pune', 'Bangalore'][i % 4],
                status: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'][i % 4],
                category: ['Conference', 'Workshop', 'Seminar'][i % 3],
                attendees: Math.floor(Math.random() * 500) + 50,
                desc: 'Strategic medical collaborative event focusing on the next generation of clinical data integrity and specialist networking within the AXONX ecosystem.'
            }));
            setEvents(mock);
        } catch (err) { toast.error("Failed to load events"); }
        finally { setLoading(false); }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        toast.success("Protocol Updated Successfully");
        setView('list');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Upcoming':  return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Ongoing':   return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default:          return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    /* ── DASHBOARD VIEW ─────────────────────────────────────────────────── */
    if (view === 'dashboard') {
        const cardConfig = [
            { id: 'All',       name: 'Global Events', count: stats.all,       icon: CalendarDays, color: 'from-blue-500 to-blue-600',   bg: 'bg-blue-50 text-blue-600' },
            { id: 'Upcoming',  name: 'Upcoming',     count: stats.upcoming,  icon: Clock,        color: 'from-sky-400 to-sky-600',    bg: 'bg-sky-50 text-sky-600' },
            { id: 'Ongoing',   name: 'Live Mode',    count: stats.ongoing,   icon: Activity,     color: 'from-amber-400 to-orange-500',bg: 'bg-amber-50 text-amber-600' },
            { id: 'Completed', name: 'Completed',    count: stats.completed, icon: CheckCircle2, color: 'from-emerald-400 to-teal-600',bg: 'bg-emerald-50 text-emerald-600' },
            { id: 'Cancelled', name: 'Cancelled',    count: stats.cancelled, icon: XCircle,      color: 'from-rose-400 to-rose-600',   bg: 'bg-rose-50 text-rose-600' },
        ];

        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase">Event Management</h1>
                    <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
                    <p className="text-[var(--text-muted)] text-sm font-bold opacity-60 italic uppercase tracking-widest">Medical Hub Networking and Specialist Summits</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cardConfig.map((card) => (
                        <button key={card.id} onClick={() => { setSelectedStatus(card.id); setView('list'); }} className="group relative p-10 bg-white dark:bg-[#1e293b]/50 rounded-[48px] border border-[var(--border-color-light)] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className={`p-6 rounded-3xl ${card.bg} w-fit shadow-lg group-hover:rotate-12 transition-transform`}><card.icon size={42} strokeWidth={2} /></div>
                                <div>
                                    <h3 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{card.count}</h3>
                                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{card.name}</p>
                                </div>
                                <div className="pt-2 flex items-center text-blue-500 font-black text-[0.65rem] uppercase tracking-tighter group-hover:gap-2 transition-all">Audit Entries <ChevronRight size={14} /></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ──────────────────────────────────────────────────────── */
    if (view === 'list') {
        const filtered = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-[var(--border-color-light)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('dashboard')} className="p-3 rounded-2xl bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={20} /></button>
                        <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                           <span className="opacity-50">Admin</span><ChevronRight size={12} className="opacity-30" />
                           <button onClick={() => setView('dashboard')} className="hover:text-blue-500">Events</button><ChevronRight size={12} className="opacity-30" />
                           <span className="text-blue-500 bg-blue-50 px-3 py-1 rounded-xl">{selectedStatus} Log</span>
                        </nav>
                    </div>
                </div>
                <div className="pro-card p-0 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[var(--border-color-light)] flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} /><input type="text" placeholder="Search events…" className="pro-input w-full pl-11 h-12" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
                        <div className="flex bg-[var(--bg-color)] p-1 rounded-2xl border border-[var(--border-color)]">
                            {['All', 'Upcoming', 'Ongoing', 'Completed'].map(s => (
                                <button key={s} onClick={() => setSelectedStatus(s)} className={`px-4 py-2 text-[0.6rem] font-black uppercase rounded-xl transition-all ${selectedStatus === s ? 'bg-white text-blue-500 shadow-sm' : 'text-[var(--text-muted)]'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-[#f8fafc] border-b border-[var(--border-color-light)]"><tr><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">SR NO</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest ">Protocol/Title</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Region</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-[var(--border-color-light)]">
                                {loading ? (<tr><td colSpan={5} className="px-8 py-20 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-blue-500 opacity-20" /></td></tr>) : 
                                filtered.map((evt, idx) => (
                                    <tr key={evt._id} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-8 py-6 text-xs font-bold text-[var(--text-muted)] opacity-40 italic">{idx+1}</td>
                                        <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 font-black italic">{evt.category[0]}</div><div><p className="text-sm font-black text-[var(--text-main)] leading-tight">{evt.title}</p><p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase tracking-widest italic">{evt.category}</p></div></div></td>
                                        <td className="px-8 py-6"><div className="flex items-center gap-2 text-xs font-black text-[var(--text-main)]"><MapPin size={14} className="text-blue-500" /> {evt.location}</div></td>
                                        <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-xl border text-[0.55rem] font-black uppercase tracking-[0.1em] ${getStatusStyle(evt.status)}`}>{evt.status}</span></td>
                                        <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2.5">
                                            <button onClick={() => { setSelectedEvent(evt); setView('detail'); }} className="p-3 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Eye size={16} /></button>
                                            <button onClick={() => { setSelectedEvent(evt); setEditForm({...evt}); setView('edit'); }} className="p-3 text-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    /* ── DETAIL VIEW ────────────────────────────────────────────────────── */
    if (view === 'detail' && selectedEvent) {
        const e = selectedEvent;
        return (
            <div className="animate-in zoom-in-95 duration-500 max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-4 rounded-[28px] bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={24} /></button>
                    <nav className="flex items-center gap-3 text-[0.7rem] font-black uppercase tracking-widest text-[var(--text-muted)]"><button onClick={() => setView('dashboard')}>Events</button><ChevronRight size={12} className="opacity-30" /><span className="text-blue-500 italic">Dossier</span></nav>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="pro-card p-12 bg-white shadow-xl rounded-[48px] border-0 relative overflow-hidden text-center">
                            <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${getStatusStyle(e.status).split(' ')[0]}`}></div>
                            <h4 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-10">Event Protocol</h4>
                            <div className={`p-8 rounded-[36px] border-2 shadow-inner inline-block w-full ${getStatusStyle(e.status)}`}><p className="text-3xl font-black italic tracking-widest uppercase">{e.status}</p></div>
                            <div className="mt-12 p-8 bg-slate-50 rounded-[32px] border border-slate-200 text-center space-y-4">
                                <div className="p-3 bg-white rounded-xl text-blue-500 w-fit mx-auto shadow-sm"><ShieldCheck size={24} /></div>
                                <div><h4 className="text-[0.65rem] font-black text-slate-800 uppercase mb-2">Facility Authorization</h4><p className="text-[0.65rem] font-bold text-slate-600 italic">This summit is fully authorized by AXONX network.</p></div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="pro-card p-12 bg-white shadow-xl border-0 rounded-[48px]">
                            <h4 className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-12 flex items-center gap-3"><CalendarDays size={18} className="text-blue-500" /> Identity and Region</h4>
                            <div className="flex items-start gap-8">
                                <div className="w-28 h-28 rounded-[40px] bg-blue-50 flex items-center justify-center text-blue-500 border-4 border-white shadow-2xl text-4xl font-black">{e.category[0]}</div>
                                <div className="flex-1 space-y-8">
                                    <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1.5 ml-1">Event Designation</p><p className="text-2xl font-black text-slate-800 tracking-tight">{e.title}</p><p className="text-xs font-bold text-blue-500 mt-1 italic uppercase tracking-widest">{e.category}</p></div>
                                    <div className="p-6 bg-slate-50 rounded-[32px] border flex items-center gap-6"><div className="flex-1"><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1">Location</p><p className="text-sm font-black text-slate-700">{e.location}, IN</p></div><div className="flex-1 text-right text-blue-500"><MapPin size={24} /></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'edit' && selectedEvent) {
        return (
            <div className="animate-in slide-in-from-bottom-6 duration-500 max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4"><button onClick={() => setView('detail')} className="p-4 rounded-[28px] bg-white border border-[var(--border-color)] shadow-sm"><X size={24} /></button></div>
                <div className="pro-card p-14 bg-white shadow-2xl border-0 rounded-[56px] relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div><div className="mb-14"><h2 className="text-4xl font-black text-slate-800 tracking-tighter">Update Record</h2><div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full"></div></div>
                    <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-12">
                        <div className="col-span-2 space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Event Label</label><input type="text" className="pro-input w-full h-16 px-6 font-bold" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}/></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Date</label><input type="date" className="pro-input w-full h-16 px-6 font-bold" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})}/></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Status Protocol</label><select className="pro-input w-full h-16 px-6 font-bold" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}><option value="Upcoming">Upcoming</option><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
                        <div className="col-span-2 pt-10 flex gap-6 text-center"><button type="button" onClick={() => setView('detail')} className="flex-1 py-5 border-2 text-slate-400 font-extrabold rounded-[28px] uppercase text-xs tracking-widest">Cancel</button><button type="submit" className="flex-1 py-5 bg-emerald-500 text-white font-extrabold rounded-[28px] shadow-2xl uppercase text-xs tracking-widest">Update</button></div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default Events;
