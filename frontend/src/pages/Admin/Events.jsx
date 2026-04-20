import React, { useState, useEffect, useRef } from 'react';
import { 
    Calendar, MapPin, Users, Ticket, CheckCircle2, Clock, XCircle, 
    Search, Filter, ChevronRight, ArrowLeft, Plus, Eye, Edit2, 
    Activity, Info, CalendarDays, ExternalLink, RefreshCw, X, Check,
    ShieldCheck, Briefcase, Award, AlignLeft, Tag, Layers, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '../../components/Admin/Pagination';

const BASE = 'http://localhost:5000/api';

const Events = () => {
    const [view, setView] = useState('dashboard'); // dashboard, list, detail, edit, create
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ all: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 });
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '', tagline: '', detailedDescription: '', category: 'Conference', location: '',
        startDate: '', endDate: '', timings: '', status: 'Upcoming', image: '',
        departments: [], subDepartments: []
    });
    // Dept/SubDept data for picker
    const [allDepts, setAllDepts] = useState([]);
    const [allSubDepts, setAllSubDepts] = useState([]);
    const [deptOpen, setDeptOpen] = useState(false);
    const [subDeptOpen, setSubDeptOpen] = useState(false);
    const deptRef = useRef();
    const subDeptRef = useRef();

    useEffect(() => {
        fetchStats();
        // Load depts for picker
        axios.get(`${BASE}/departments`).then(({ data }) => { if (data.success) setAllDepts(data.data); }).catch(() => {});
    }, []);

    useEffect(() => {
        if (view === 'list') fetchEvents();
    }, [view, selectedStatus]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (deptRef.current && !deptRef.current.contains(e.target)) setDeptOpen(false);
            if (subDeptRef.current && !subDeptRef.current.contains(e.target)) setSubDeptOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Load sub-depts whenever selected depts change (during edit/create)
    useEffect(() => {
        if (!editForm.departments || editForm.departments.length === 0) { setAllSubDepts([]); return; }
        // Fetch sub-depts for all selected dept IDs
        const ids = editForm.departments;
        Promise.all(ids.map(id => axios.get(`${BASE}/sub-departments?departmentId=${id}`).then(r => r.data.data || []).catch(() => [])))
            .then(results => setAllSubDepts(results.flat()));
    }, [JSON.stringify(editForm.departments)]);

    const fetchStats = async () => {
        try { 
            const { data } = await axios.get(`${BASE}/events/stats`);
            if (data.success) setStats(data.data);
        } catch (err) {}
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const endpoint = selectedStatus === 'All' ? `${BASE}/events` : `${BASE}/events?status=${selectedStatus}`;
            const { data } = await axios.get(endpoint);
            if(data.success) setEvents(data.data);
        } catch (err) { toast.error("Failed to load events"); }
        finally { setLoading(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...editForm,
                // departments & subDepartments are arrays of IDs; store labels for display
                departments: Array.isArray(editForm.departments)
                    ? editForm.departments.map(id => allDepts.find(d => d._id === id)?.name || id)
                    : [],
                subDepartments: Array.isArray(editForm.subDepartments)
                    ? editForm.subDepartments.map(id => allSubDepts.find(s => s._id === id)?.name || id)
                    : [],
            };
            const tid = toast.loading("Updating Protocol...");
            if (view === 'create') {
                await axios.post(`${BASE}/events`, payload);
                toast.success("Event Added Successfully", { id: tid });
            } else {
                await axios.put(`${BASE}/events/${selectedEvent._id}`, payload);
                toast.success("Protocol Updated Successfully", { id: tid });
            }
            setView('list');
            fetchStats();
        } catch(err) {
            toast.error(err.response?.data?.error || "Error saving event");
        }
    };

    const openCreate = () => {
        setEditForm({ title: '', tagline: '', detailedDescription: '', category: 'Conference', location: '', startDate: '', endDate: '', timings: '', status: 'Upcoming', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', departments: [], subDepartments: [] });
        setView('create');
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Upcoming':  return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Ongoing':   return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Finished':  return 'bg-emerald-50 text-emerald-600 border-emerald-100';
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
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const pagedEvents = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                    <button onClick={openCreate} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md flex items-center gap-2">
                        <Plus size={16}/> Add Event
                    </button>
                </div>
                <div className="pro-card p-0 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[var(--border-color-light)] flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} /><input type="text" placeholder="Search events…" className="pro-input w-full pl-11 h-12" value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} /></div>
                        <div className="flex bg-[var(--bg-color)] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
                            {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map(s => (
                                <button key={s} onClick={() => {setSelectedStatus(s); setCurrentPage(1);}} className={`px-4 py-2 text-[0.6rem] font-black uppercase rounded-xl transition-all whitespace-nowrap ${selectedStatus === s ? 'bg-white text-blue-500 shadow-sm' : 'text-[var(--text-muted)]'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-[#f8fafc] border-b border-[var(--border-color-light)]"><tr><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">SR NO</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest ">Protocol/Title</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Region</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-[var(--border-color-light)]">
                                {loading ? (<tr><td colSpan={5} className="px-8 py-20 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-blue-500 opacity-20" /></td></tr>) : 
                                pagedEvents.map((evt, idx) => (
                                    <tr key={evt._id} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-8 py-6 text-xs font-bold text-[var(--text-muted)] opacity-40 italic">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 font-black italic">{evt.category?.[0] || 'E'}</div><div><p className="text-sm font-black text-[var(--text-main)] leading-tight">{evt.title}</p><p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase tracking-widest italic">{evt.category}</p></div></div></td>
                                        <td className="px-8 py-6"><div className="flex items-center gap-2 text-xs font-black text-[var(--text-main)]"><MapPin size={14} className="text-blue-500" /> {evt.location || 'N/A'}</div></td>
                                        <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-xl border text-[0.55rem] font-black uppercase tracking-[0.1em] ${getStatusStyle(evt.status)}`}>{evt.status}</span></td>
                                        <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2.5">
                                            <button onClick={() => { setSelectedEvent(evt); setView('detail'); }} className="p-3 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Eye size={16} /></button>
                                            <button onClick={() => { 
                                                setSelectedEvent(evt); 
                                                const d = {...evt};
                                                if(d.startDate) d.date = new Date(d.startDate).toISOString().substring(0,10);
                                                d.departments = d.departments?.join(', ') || '';
                                                d.subDepartments = d.subDepartments?.join(', ') || '';
                                                setEditForm(d); 
                                                setView('edit'); 
                                            }} className="p-3 text-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                                        </div></td>
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
                                totalItems={filtered.length}
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
    if (view === 'detail' && selectedEvent) {
        const e = selectedEvent;
        return (
            <div className="animate-in zoom-in-95 duration-500 max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-4 rounded-[28px] bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={24} /></button>
                    <nav className="flex items-center gap-3 text-[0.7rem] font-black uppercase tracking-widest text-[var(--text-muted)]"><button onClick={() => setView('dashboard')}>Events</button><ChevronRight size={12} className="opacity-30" /><button onClick={() => setView('list')}>{selectedStatus} Log</button><ChevronRight size={12} className="opacity-30" /><span className="text-blue-500 italic">{e.title || 'Untitled Event'}</span></nav>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-start">
                    {/* Left Column (Ratio 5) - Media & Meta */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="pro-card bg-white shadow-xl border-0 rounded-[48px] overflow-hidden">
                            <div className="h-64 w-full bg-slate-100 relative group overflow-hidden">
                                <img src={e.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <span className={`px-4 py-1.5 rounded-xl border text-[0.55rem] font-black uppercase tracking-[0.1em] shadow-lg ${getStatusStyle(e.status)} border-transparent mb-3 inline-block`}>{e.status}</span>
                                    <h2 className="text-white text-2xl font-black leading-tight drop-shadow-md">{e.title}</h2>
                                </div>
                            </div>
                            <div className="p-10 space-y-8">
                                <div>
                                    <p className="text-[0.65rem] font-black text-blue-500 uppercase flex items-center gap-2 tracking-widest mb-3"><Tag size={16}/> Tagline</p>
                                    <p className="text-base font-bold text-slate-700 italic border-l-4 border-blue-500 pl-4">{e.tagline || 'Pioneering Medical Excellence'}</p>
                                </div>
                                <div>
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest mb-3"><AlignLeft size={16}/> Detailed Brief</p>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{e.detailedDescription || e.description || 'No detailed description provided for this specific event module.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Ratio 6) - Categorization & Protocols */}
                    <div className="lg:col-span-6 h-full flex flex-col space-y-6">
                        <div className="pro-card p-12 bg-white shadow-xl border-0 rounded-[48px] border-t-[16px] border-blue-500 flex-1">
                            <h4 className="text-[0.65rem] font-black text-blue-500 uppercase tracking-widest mb-10 flex items-center justify-between border-b pb-6">
                                <div className="flex items-center gap-3"><Calendar size={22} /> Operations & Timings</div>
                                <button onClick={() => { 
                                    const d = {...e}; 
                                    if(d.startDate) d.date = new Date(d.startDate).toISOString().substring(0,10); 
                                    d.departments = d.departments?.join(', ') || '';
                                    d.subDepartments = d.subDepartments?.join(', ') || '';
                                    setEditForm(d); setView('edit'); 
                                }} className="text-[0.65rem] font-black bg-blue-50 text-blue-600 px-5 py-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"><Edit2 size={14} /> Update Record</button>
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-y-10 gap-x-8 text-left mb-10">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><CalendarDays size={14}/> Proposed Date</p>
                                    <p className="text-base font-black text-slate-800">{e.startDate ? new Date(e.startDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><Clock size={14}/> Event Timings</p>
                                    <p className="text-base font-black text-slate-800">{e.timings || 'N/A'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><MapPin size={14}/> Base Location</p>
                                    <p className="text-base font-black text-slate-800">{e.location || 'N/A'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest flex items-center gap-2"><CalendarDays size={14}/> End Date</p>
                                    <p className="text-base font-black text-slate-800">{e.endDate ? new Date(e.endDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            <h4 className="text-[0.65rem] font-black text-slate-800 uppercase tracking-widest mb-6 border-b pb-4 mt-8 flex items-center gap-2"><Layers size={18} className="text-blue-500" /> Department Engagements</h4>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[0.6rem] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Primary Departments</p>
                                    <div className="flex flex-wrap gap-2">
                                        {e.departments && e.departments.length > 0 ? e.departments.map((dept, i) => (
                                            <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 shadow-sm">{dept}</span>
                                        )) : <span className="text-xs font-bold text-slate-400 italic">No primary departments attached.</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Sub-Division Focus</p>
                                    <div className="flex flex-wrap gap-2">
                                        {e.subDepartments && e.subDepartments.length > 0 ? e.subDepartments.map((sub, i) => (
                                            <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">{sub}</span>
                                        )) : <span className="text-xs font-bold text-slate-400 italic">No sub-divisions attached.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'edit' || view === 'create') {
        const isUpdate = view === 'edit';
        return (
            <div className="animate-in slide-in-from-bottom-6 duration-500 max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-4"><button onClick={() => setView(isUpdate ? 'detail' : 'list')} className="p-4 rounded-[28px] bg-white border border-[var(--border-color)] shadow-sm"><X size={24} /></button></div>
                <div className="pro-card p-14 bg-white shadow-2xl border-0 rounded-[56px] relative overflow-hidden text-left">
                    <div className={`absolute top-0 right-0 w-3 h-full ${isUpdate ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                    <div className="mb-14">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{isUpdate ? 'Update Protocol Record' : 'Initialize New Event'}</h2>
                        <div className={`w-16 h-1.5 mt-4 rounded-full ${isUpdate ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                    </div>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title & Tagline */}
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label><input type="text" required className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}/></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label><input type="text" className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.tagline} onChange={e => setEditForm({...editForm, tagline: e.target.value})}/></div>
                        
                        {/* URL Image & Category */}
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image Source URL</label><input type="url" className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})}/></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Category Registry</label><select required className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}><option value="Conference">Conference</option><option value="Workshop">Workshop</option><option value="Seminar">Seminar</option><option value="Symposium">Symposium</option></select></div>

                        {/* Schedule & Timings */}
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label><input type="date" required className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.startDate || editForm.date || ''} onChange={e => setEditForm({...editForm, startDate: e.target.value, date: e.target.value})}/></div>
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label><input type="date" required className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.endDate ? new Date(editForm.endDate).toISOString().substring(0,10) : ''} onChange={e => setEditForm({...editForm, endDate: e.target.value})}/></div>

                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Clock size={12} className="text-blue-500" /> Event Timings (Range)</label><input type="text" placeholder="10:00 AM - 4:00 PM" className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.timings} onChange={e => setEditForm({...editForm, timings: e.target.value})}/></div>
                        
                        {/* Location & Status */}
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label><input type="text" required className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})}/></div>
                        
                        <div className="space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label><select className="pro-input w-full h-14 px-6 rounded-2xl font-bold" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}><option value="Upcoming">Upcoming</option><option value="Ongoing">Ongoing</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>

                        {/* Multi-select Departments Dropdown */}
                        <div className="space-y-3 relative" ref={deptRef}>
                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={12} className="text-blue-500"/> Departments</label>
                            <button type="button" onClick={() => setDeptOpen(o => !o)}
                                className="pro-input w-full h-14 px-5 rounded-2xl font-bold flex items-center justify-between text-left">
                                <span className={editForm.departments?.length ? 'text-slate-700 text-sm' : 'text-slate-400 text-sm'}>
                                    {editForm.departments?.length ? `${editForm.departments.length} dept${editForm.departments.length > 1 ? 's' : ''} selected` : 'Select departments…'}
                                </span>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                            {editForm.departments?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {editForm.departments.map(id => {
                                        const d = allDepts.find(d => d._id === id);
                                        return d ? <span key={id} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[0.6rem] font-black uppercase border border-indigo-100 flex items-center gap-1">{d.name}<button type="button" onClick={() => setEditForm(f => ({...f, departments: f.departments.filter(x => x !== id), subDepartments: []}))}><X size={10}/></button></span> : null;
                                    })}
                                </div>
                            )}
                            {deptOpen && (
                                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                                        {allDepts.length === 0 && <p className="p-4 text-center text-xs text-slate-400">No departments found</p>}
                                        {allDepts.map(dept => {
                                            const checked = editForm.departments?.includes(dept._id);
                                            return (
                                                <label key={dept._id} className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${checked ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                                    <input type="checkbox" checked={checked} onChange={() => {
                                                        setEditForm(f => ({
                                                            ...f,
                                                            departments: checked ? f.departments.filter(x => x !== dept._id) : [...(f.departments || []), dept._id],
                                                            subDepartments: [] // reset sub-depts on dept change
                                                        }));
                                                    }} className="w-4 h-4 accent-indigo-600 rounded" />
                                                    <span className="text-sm font-bold text-slate-700">{dept.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Multi-select Sub-Departments Dropdown */}
                        <div className="space-y-3 relative" ref={subDeptRef}>
                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Tag size={12} className="text-blue-500"/> Sub-Departments</label>
                            <button type="button" onClick={() => { if (allSubDepts.length === 0 && editForm.departments?.length > 0) return; setSubDeptOpen(o => !o); }}
                                disabled={editForm.departments?.length === 0}
                                className="pro-input w-full h-14 px-5 rounded-2xl font-bold flex items-center justify-between text-left disabled:opacity-40">
                                <span className={editForm.subDepartments?.length ? 'text-slate-700 text-sm' : 'text-slate-400 text-sm'}>
                                    {editForm.departments?.length === 0 ? 'Select departments first…' : editForm.subDepartments?.length ? `${editForm.subDepartments.length} sub-dept${editForm.subDepartments.length > 1 ? 's' : ''} selected` : 'Select sub-departments…'}
                                </span>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                            {editForm.subDepartments?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {editForm.subDepartments.map(id => {
                                        const s = allSubDepts.find(s => s._id === id);
                                        return s ? <span key={id} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[0.6rem] font-black uppercase border border-slate-200 flex items-center gap-1">{s.name}<button type="button" onClick={() => setEditForm(f => ({...f, subDepartments: f.subDepartments.filter(x => x !== id)}))}><X size={10}/></button></span> : null;
                                    })}
                                </div>
                            )}
                            {subDeptOpen && allSubDepts.length > 0 && (
                                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                                        {allSubDepts.map(sub => {
                                            const checked = editForm.subDepartments?.includes(sub._id);
                                            const parentDept = allDepts.find(d => d._id === (sub.departmentId?._id || sub.departmentId));
                                            return (
                                                <label key={sub._id} className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${checked ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                                                    <input type="checkbox" checked={checked} onChange={() => {
                                                        setEditForm(f => ({
                                                            ...f,
                                                            subDepartments: checked ? f.subDepartments.filter(x => x !== sub._id) : [...(f.subDepartments || []), sub._id]
                                                        }));
                                                    }} className="w-4 h-4 accent-slate-600 rounded" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{sub.name}</p>
                                                        {parentDept && <p className="text-[0.6rem] text-slate-400 uppercase tracking-widest">{parentDept.name}</p>}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Textarea for detailed description */}
                        <div className="col-span-2 space-y-3"><label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label><textarea required className="pro-input w-full h-32 p-6 rounded-3xl font-bold resize-none" value={editForm.detailedDescription} onChange={e => setEditForm({...editForm, detailedDescription: e.target.value})}></textarea></div>

                        <div className="col-span-2 pt-10 flex gap-6 text-center">
                            <button type="button" onClick={() => setView(isUpdate ? 'detail' : 'list')} className="flex-1 py-5 border-2 text-slate-400 font-extrabold rounded-3xl hover:bg-slate-50 transition-all uppercase text-[0.7rem] tracking-widest">Cancel</button>
                            <button type="submit" className={`flex-1 py-5 text-white font-extrabold rounded-3xl shadow-2xl transition-all uppercase text-[0.7rem] tracking-widest ${isUpdate ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>{isUpdate ? 'Update Record' : 'Commit New Event'}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default Events;
