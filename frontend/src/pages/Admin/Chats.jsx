import React, { useState } from 'react';
import { 
    MessageSquare, Send, User, Clock, ShieldCheck, Filter, 
    Search, ChevronRight, ArrowLeft, MoreVertical, Eye, Trash2,
    ShieldAlert, UserCircle, RefreshCw, X, ChevronLeft, Bot,
    Activity, CheckCircle2, MessageCircle
} from 'lucide-react';

const Chats = () => {
    const [view, setView] = useState('dashboard'); // dashboard, list, detail
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatClick = (s) => {
        setSelectedStatus(s);
        setView('list');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active':   return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Archived': return 'bg-slate-50 text-slate-600 border-slate-100';
            case 'Blocked':  return 'bg-rose-50 text-rose-600 border-rose-100';
            default:         return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    /* ── DASHBOARD VIEW ─────────────────────────────────────────────────── */
    if (view === 'dashboard') {
        const stats = { all: 1240, active: 45, archived: 1180, flagged: 15 };
        const cardConfig = [
            { id: 'All',      name: 'Total Chats', count: stats.all,      icon: MessageCircle, color: 'from-blue-500 to-blue-600',   bg: 'bg-blue-50' },
            { id: 'Active',   name: 'Live Chat',   count: stats.active,   icon: Activity,      color: 'from-emerald-400 to-emerald-600',bg: 'bg-emerald-50' },
            { id: 'Archived', name: 'Archived',    count: stats.archived, icon: ShieldCheck,   color: 'from-slate-400 to-slate-600',    bg: 'bg-slate-50' },
            { id: 'Blocked',  name: 'Flagged',     count: stats.flagged,  icon: ShieldAlert,   color: 'from-rose-500 to-rose-600',     bg: 'bg-rose-50' },
        ];

        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter">Communication Hub</h1>
                    <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
                    <p className="text-[var(--text-muted)] text-sm font-bold opacity-60 italic">Monitoring clinical dialogues, patient assistance, and automated bot interactions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cardConfig.map((card) => (
                        <button key={card.id} onClick={() => handleStatClick(card.id)} className="group relative p-10 bg-white dark:bg-[#1e293b]/50 rounded-[48px] border border-[var(--border-color-light)] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className={`p-6 rounded-3xl ${card.bg} text-blue-600 w-fit shadow-lg group-hover:rotate-12 transition-transform`}><card.icon size={36} strokeWidth={2} /></div>
                                <div>
                                    <h3 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{card.count}</h3>
                                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{card.name}</p>
                                </div>
                                <div className="pt-2 flex items-center text-blue-500 font-black text-[0.65rem] uppercase tracking-tighter group-hover:gap-2 transition-all">Review Threads <ChevronRight size={14} /></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ──────────────────────────────────────────────────────── */
    if (view === 'list') {
        const mock = Array.from({ length: 8 }).map((_, i) => ({
            _id: `cht-${i}`,
            user: ['Rajesh Kumar', 'Priya Sharma', 'Sanjay Deshmukh', 'Anita Reddy'][i % 4],
            lastMsg: ['I need a copy of my report...', 'When is Dr. Sharma available?', 'Thank you for the assistance.', 'The link is broken.'][i % 4],
            status: ['Active', 'Archived', 'Blocked'][i % 3],
            tokens: Math.floor(Math.random() * 50) + 10,
            time: '2 mins ago'
        }));

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-[var(--border-color-light)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('dashboard')} className="p-3 rounded-2xl bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={20} /></button>
                        <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                           <span className="opacity-50">Admin</span><ChevronRight size={12} className="opacity-30" />
                           <button onClick={() => setView('dashboard')} className="hover:text-blue-500">Communication</button><ChevronRight size={12} className="opacity-30" />
                           <span className="text-blue-500 bg-blue-50 px-3 py-1 rounded-xl">{selectedStatus} Threads</span>
                        </nav>
                    </div>
                </div>

                <div className="pro-card p-0 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[var(--border-color-light)] flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} /><input type="text" placeholder="Search active threads…" className="pro-input w-full pl-11 h-12" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-[#f8fafc] border-b border-[var(--border-color-light)]"><tr><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest ">Participation Identity</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Late Diagnostic/Prompt</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Duration</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Security</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-[var(--border-color-light)]">
                                {mock.map((cht, idx) => (
                                    <tr key={cht._id} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 font-black uppercase">{cht.user[0]}</div><div><p className="text-sm font-black text-[var(--text-main)] leading-tight">{cht.user}</p><p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase tracking-widest italic">User Node #{idx+101}</p></div></div></td>
                                        <td className="px-8 py-6 max-w-xs"><p className="text-[0.65rem] font-black text-slate-500 truncate italic">"{cht.lastMsg}"</p></td>
                                        <td className="px-8 py-6"><div className="space-y-1"><div className="flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase"><Clock size={12} /> {cht.time}</div><div className="flex items-center gap-1.5 text-[0.6rem] font-black text-[var(--text-muted)] uppercase"><MessageSquare size={12} /> {cht.tokens} Exchange</div></div></td>
                                        <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-xl border text-[0.55rem] font-black uppercase tracking-[0.1em] ${getStatusStyle(cht.status)}`}>{cht.status}</span></td>
                                        <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2.5">
                                            <button className="p-3 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Eye size={16} /></button>
                                            <button className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><ShieldAlert size={16} /></button>
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

export default Chats;
