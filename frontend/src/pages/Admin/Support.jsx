import React, { useState } from 'react';
import { 
    HelpCircle, LifeBuoy, AlertTriangle, CheckSquare, Clock, XCircle, 
    Search, Filter, ChevronRight, ArrowLeft, Plus, Eye, Edit2, 
    Activity, Info, RefreshCw, X, Check, ShieldAlert,
    UserCircle, Mail, Phone, MessageCircle
} from 'lucide-react';

const Support = () => {
    const [view, setView] = useState('dashboard'); // dashboard, list, detail
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatClick = (s) => {
        setSelectedStatus(s);
        setView('list');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open':      return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Resolved':  return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Escalated': return 'bg-rose-50 text-rose-600 border-rose-100';
            default:          return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    /* ── DASHBOARD VIEW ─────────────────────────────────────────────────── */
    if (view === 'dashboard') {
        const stats = { all: 482, open: 24, resolved: 442, escalated: 16 };
        const cardConfig = [
            { id: 'All',       name: 'Global Tickets', count: stats.all,       icon: LifeBuoy,      color: 'from-blue-500 to-blue-600',   bg: 'bg-blue-50' },
            { id: 'Open',      name: 'Active Query',   count: stats.open,      icon: HelpCircle,    color: 'from-amber-400 to-amber-600',  bg: 'bg-amber-50' },
            { id: 'Resolved',  name: 'Resolved',       count: stats.resolved,  icon: CheckSquare,   color: 'from-emerald-400 to-emerald-600',bg: 'bg-emerald-50' },
            { id: 'Escalated', name: 'Critical Case',  count: stats.escalated, icon: AlertTriangle, color: 'from-rose-500 to-rose-600',     bg: 'bg-rose-50' },
        ];

        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter">Support Command Center</h1>
                    <div className="w-24 h-1.5 bg-rose-500 mx-auto rounded-full"></div>
                    <p className="text-[var(--text-muted)] text-sm font-bold opacity-60 italic">Resolving technical barriers, clinical queries, and operational bottlenecks.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cardConfig.map((card) => (
                        <button key={card.id} onClick={() => handleStatClick(card.id)} className="group relative p-10 bg-white dark:bg-[#1e293b]/50 rounded-[48px] border border-[var(--border-color-light)] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className={`p-6 rounded-3xl ${card.bg} text-rose-600 w-fit shadow-lg group-hover:rotate-12 transition-transform`}><card.icon size={36} strokeWidth={2} /></div>
                                <div>
                                    <h3 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{card.count}</h3>
                                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{card.name}</p>
                                </div>
                                <div className="pt-2 flex items-center text-rose-500 font-black text-[0.65rem] uppercase tracking-tighter group-hover:gap-2 transition-all">Audit Cases <ChevronRight size={14} /></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ──────────────────────────────────────────────────────── */
    if (view === 'list') {
        const mock = Array.from({ length: 6 }).map((_, i) => ({
            _id: `tkt-${i+2000}`,
            subject: ['Login failure in Node 4', 'Incorrect department mapping', 'Appointment synchronization error', 'Data export failed'][i % 4],
            user: ['Rajesh K.', 'Anita S.', 'Sanjay P.'][i % 3],
            status: ['Open', 'Resolved', 'Escalated'][i % 3],
            priority: ['High', 'Normal', 'Urgent'][i % 3],
            time: '1 hour ago'
        }));

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-[var(--border-color-light)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('dashboard')} className="p-3 rounded-2xl bg-white text-[var(--text-muted)] hover:text-rose-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={20} /></button>
                        <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                           <span className="opacity-50">Admin</span><ChevronRight size={12} className="opacity-30" />
                           <button onClick={() => setView('dashboard')} className="hover:text-rose-500">Support</button><ChevronRight size={12} className="opacity-30" />
                           <span className="text-rose-500 bg-rose-50 px-3 py-1 rounded-xl">{selectedStatus} Dashboard</span>
                        </nav>
                    </div>
                </div>

                <div className="pro-card p-0 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[var(--border-color-light)] flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} /><input type="text" placeholder="Search ticket ID or subject…" className="pro-input w-full pl-11 h-12" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-[#f8fafc] border-b border-[var(--border-color-light)]"><tr><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest ">Case Subject</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Requester</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">SLA Status</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Protocol</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-[var(--border-color-light)]">
                                {mock.map((tkt, idx) => (
                                    <tr key={tkt._id} className="hover:bg-rose-50/5 transition-colors group">
                                        <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 font-black uppercase"><HelpCircle size={18} /></div><div><p className="text-sm font-black text-[var(--text-main)] leading-tight">{tkt.subject}</p><p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase tracking-widest italic">Ticket #{tkt._id}</p></div></div></td>
                                        <td className="px-8 py-6"><div className="flex items-center gap-2 text-xs font-black text-[var(--text-main)]"><UserCircle size={14} className="text-rose-500" /> {tkt.user}</div></td>
                                        <td className="px-8 py-6"><div className="space-y-1"><div className="flex items-center gap-1.5 text-xs font-black text-rose-600 uppercase"><Clock size={12} /> {tkt.time}</div><div className="flex items-center gap-1.5 text-[0.6rem] font-black text-[var(--text-muted)] uppercase italic">Priority: {tkt.priority}</div></div></td>
                                        <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-xl border text-[0.55rem] font-black uppercase tracking-[0.1em] ${getStatusStyle(tkt.status)}`}>{tkt.status}</span></td>
                                        <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2.5">
                                            <button className="p-3 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Eye size={16} /></button>
                                            <button className="p-3 text-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><CheckSquare size={16} /></button>
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
    return null;
};

export default Support;
