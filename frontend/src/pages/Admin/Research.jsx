import React, { useState, useEffect } from 'react';
import { 
    BookOpen, FileText, Globe, Award, CheckCircle2, Clock, XCircle, 
    Search, Filter, ChevronRight, ArrowLeft, Plus, Eye, Edit2, 
    Activity, Info, ExternalLink, RefreshCw, X, Check, Database,
    UserCircle, Mail, GraduationCap, ShieldCheck, Heart, Bookmark,
    MessageSquare, Upload, Download, Trash2, User, ChevronLeft,
    ShieldAlert, Ban, UserCheck, Layers, Hash, MoreHorizontal
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Admin/Pagination';

const BASE_URL = 'http://localhost:5000/api';

const Research = () => {
    const { user: currentUser } = useAuth();
    const canUpload = ['doctor', 'researcher', 'student'].includes(currentUser?.role);

    const [view, setView] = useState('dashboard'); 
    const [loading, setLoading] = useState(false);
    const [papers, setPapers] = useState([]);
    const [stats, setStats] = useState({ all: 0, pending: 0, approved: 0, suspended: 0 });
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPaper, setSelectedPaper] = useState(null);
    
    // UI Modals
    const [showLikersModal, setShowLikersModal] = useState(false);

    // Dropdown Data
    const [departments, setDepartments] = useState([]);
    const [subDepts, setSubDepts] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Add Paper State
    const [newPaper, setNewPaper] = useState({
        title: '',
        abstract: '',
        departmentId: '',
        subDeptId: '',
        category: 'Neurology',
        pdfUrl: ''
    });

    useEffect(() => {
        fetchPapers();
        fetchDropdownData();
    }, []);

    const fetchPapers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${BASE_URL}/research-papers`);
            if (data.success) {
                setPapers(data.data);
                calculateStats(data.data);
            }
            setLoading(false);
        } catch (error) {
            toast.error("Failed to sync research library");
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [deptRes, subRes] = await Promise.all([
                axios.get(`${BASE_URL}/departments`),
                axios.get(`${BASE_URL}/sub-departments`)
            ]);
            setDepartments(deptRes.data.data || []);
            setSubDepts(subRes.data.data || []);
        } catch (error) {
            console.error("Dropdown hydration failed");
        }
    };

    const calculateStats = (data) => {
        setStats({
            all: data.length,
            pending: data.filter(p => p.status === 'Pending').length,
            approved: data.filter(p => p.status === 'Approved').length,
            suspended: data.filter(p => p.status === 'Suspended' || p.status === 'Rejected').length 
        });
    };

    const handleStatClick = (s) => {
        setSelectedStatus(s);
        setCurrentPage(1);
        setView('list');
    };

    const getStatusStyle = (p) => {
        switch (p.status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Pending':  return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Suspended': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Rejected':  return 'bg-slate-50 text-slate-600 border-slate-100 text-rose-500';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            toast.success(`${file.name} ready for secure transmission`);
            setNewPaper({...newPaper, pdfUrl: `/uploads/research/${file.name}`});
        }
    };

    const handleViewDetail = async (paper) => {
        setSelectedPaper(paper);
        setView('detail');
        try {
            const { data } = await axios.get(`${BASE_URL}/research-papers/${paper._id}`);
            if (data.success) {
                setSelectedPaper(data.data);
            }
        } catch (error) {
            console.error("Deep archival fetch failed");
        }
    };

    const handleUpdateStatus = async (paperId, newStatus) => {
        try {
            const tid = toast.loading("Saving...");
            const { data } = await axios.patch(`${BASE_URL}/research-papers/${paperId}/status`, {
                status: newStatus
            });
            if (data.success) {
                toast.success("Updated successfully", { id: tid });
                fetchPapers();
                if (selectedPaper) {
                   const updatedPaperRes = await axios.get(`${BASE_URL}/research-papers/${paperId}`);
                   setSelectedPaper(updatedPaperRes.data.data);
                }
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleSubmitPaper = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const paperData = {
                ...newPaper,
                publisherId: currentUser.id || currentUser._id,
                status: 'Pending'
            };
            const { data } = await axios.post(`${BASE_URL}/research-papers`, paperData);
            if (data.success) {
                toast.success("Uploaded successfully");
                fetchPapers();
                setView('list');
            }
            setLoading(false);
        } catch (error) {
            toast.error("Upload failed");
            setLoading(false);
        }
    };

    /* ── DASHBOARD VIEW ─────────────────────────────────────────────────── */
    if (view === 'dashboard') {
        const cardConfig = [
            { id: 'All',          name: 'All',           count: stats.all,       icon: Database,     bg: 'bg-blue-50 text-blue-600' },
            { id: 'Pending',      name: 'Review Pending', count: stats.pending,    icon: Clock,        bg: 'bg-amber-50 text-amber-600' },
            { id: 'Approved',     name: 'Approved',      count: stats.approved, icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600' },
            { id: 'Suspended',    name: 'Suspended',     count: stats.suspended, icon: Ban,      bg: 'bg-rose-50 text-rose-600' },
        ];

        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic">Research <span className="text-blue-500 not-italic">Network</span></h1>
                    <div className="w-24 h-2 bg-blue-500 mx-auto rounded-full"></div>
                    <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em] opacity-60 italic">Advanced Archival Management & Nodal Oversight</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cardConfig.map((card) => (
                        <button key={card.id} onClick={() => handleStatClick(card.id)} className="group relative p-12 bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(8,_112,_184,_0.05)] hover:shadow-[0_40px_80px_rgba(8,_112,_184,_0.15)] hover:-translate-y-2 transition-all text-left overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[64px] group-hover:bg-blue-500/10 transition-colors"></div>
                             <div className="relative z-10 space-y-8">
                                <div className={`p-6 rounded-[24px] ${card.bg} w-fit shadow-inner group-hover:rotate-12 transition-transform`}><card.icon size={36} /></div>
                                <div>
                                    <h3 className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter">{card.count}</h3>
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mt-1">{card.name}</p>
                                </div>
                                <div className="pt-4 flex items-center text-blue-500 font-black text-[0.6rem] uppercase tracking-widest">View All <ChevronRight size={14} /></div>
                             </div>
                        </button>
                    ))}
                </div>

                {canUpload && (
                    <div className="p-12 bg-slate-900 rounded-[56px] text-center space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter">Publish Findings</h2>
                        <p className="text-slate-400 font-bold italic max-w-xl mx-auto">"Upload manuscripts for global peer-review. All submissions are cross-referenced across institutional nodes."</p>
                        <button onClick={() => setView('add')} className="px-12 py-6 bg-white text-slate-950 rounded-[28px] font-black text-[0.7rem] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95">
                             <Plus className="inline-block mr-2" size={18} /> New Manuscript
                        </button>
                    </div>
                )}
            </div>
        );
    }

    /* ── ADD PAPER VIEW ─────────────────────────────────────────────────── */
    if (view === 'add') {
        return (
            <div className="animate-in slide-in-from-bottom-10 duration-700 max-w-5xl mx-auto space-y-10 text-left mb-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-4 rounded-[28px] bg-white text-slate-400 hover:text-blue-500 border border-slate-100 shadow-sm transition-all"><ArrowLeft size={24} /></button>
                    <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">Registry <span className="text-blue-500 uppercase italic">Onboarding</span></h2>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[56px] p-16 shadow-2xl border border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSubmitPaper} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4">Paper Title</label>
                                <input type="text" placeholder="e.g. Longitudinal Neural Patterns" className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[28px] border-none outline-none font-bold text-sm focus:ring-4 ring-blue-500/10" value={newPaper.title} onChange={e => setNewPaper({...newPaper, title: e.target.value})} required />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4">Specialization</label>
                                <input type="text" placeholder="e.g. Molecular Oncology" className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[28px] border-none outline-none font-bold text-sm focus:ring-4 ring-blue-500/10" value={newPaper.category} onChange={e => setNewPaper({...newPaper, category: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4">Department</label>
                                <select className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[28px] border-none outline-none font-bold text-sm focus:ring-4 ring-blue-500/10" value={newPaper.departmentId} onChange={e => setNewPaper({...newPaper, departmentId: e.target.value})} required>
                                    <option value="">Select Parent Department</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4">Sub-Department</label>
                                <select className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[28px] border-none outline-none font-bold text-sm focus:ring-4 ring-blue-500/10" value={newPaper.subDeptId} onChange={e => setNewPaper({...newPaper, subDeptId: e.target.value})} required>
                                    <option value="">Select Specialized Node</option>
                                    {subDepts.filter(s => s.departmentId?.[0]?._id === newPaper.departmentId || s.departmentId === newPaper.departmentId).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4">Abstract</label>
                            <textarea rows="5" placeholder="Detailed summary of findings and methodology..." className="w-full p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] border-none outline-none font-bold text-sm focus:ring-4 ring-blue-500/10 italic" value={newPaper.abstract} onChange={e => setNewPaper({...newPaper, abstract: e.target.value})} required />
                        </div>

                        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] text-center space-y-6 group hover:border-blue-50 transition-colors">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[24px] flex items-center justify-center mx-auto text-blue-500 group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Attach Scientific Manuscript</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic tracking-wider">Supports secure PDF nodes only</p>
                            </div>
                            <input type="file" accept=".pdf" className="hidden" id="pdf-upload" onChange={handleFileUpload} />
                            <label htmlFor="pdf-upload" className="inline-block px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[0.65rem] uppercase tracking-widest cursor-pointer shadow-lg active:scale-95 transition-all">{newPaper.pdfUrl ? 'CHANGE ARTIFACT' : 'SELECT MANUSCRIPT'}</label>
                            {newPaper.pdfUrl && <p className="text-[0.6rem] font-black text-emerald-500 uppercase mt-4 italic">✓ Artifact Bound: {newPaper.pdfUrl.split('/').pop()}</p>}
                        </div>

                        <button type="submit" className="w-full py-7 bg-blue-600 text-white font-black rounded-[28px] uppercase tracking-widest text-[0.75rem] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">Submit for Review</button>
                    </form>
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ──────────────────────────────────────────────────────── */
    if (view === 'list') {
        const filtered = papers.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p.publisherId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (selectedStatus === 'Pending') return matchesSearch && p.status === 'Pending';
            if (selectedStatus === 'Approved') return matchesSearch && p.status === 'Approved';
            if (selectedStatus === 'Suspended') return matchesSearch && (p.status === 'Suspended' || p.status === 'Rejected');
            return matchesSearch;
        });

        // Pagination
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('dashboard')} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-all shadow-sm"><ArrowLeft size={20} /></button>
                        <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
                           <span className="opacity-50 italic">Archival Vault</span><ChevronRight size={12} className="opacity-30" />
                           <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-xl uppercase tracking-widest">{selectedStatus} All</span>
                        </nav>
                    </div>
                    {canUpload && (
                        <button onClick={() => setView('add')} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[0.65rem] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 border-b-4 border-blue-800">
                            <Plus size={16} /> New Manuscript
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-800/20">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Filter manuscripts…" className="w-full pl-16 pr-8 h-14 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm focus:ring-4 ring-blue-500/10 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">srno</th>
                                    <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">paper title</th>
                                    <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">department and sub department</th>
                                    <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">status</th>
                                    <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">review</th>
                                    <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-right">status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {currentItems.map((p, idx) => (
                                    <tr key={p._id} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-10 py-8 text-xs font-black text-slate-300 italic">{(indexOfFirstItem + idx + 1).toString().padStart(2, '0')}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-[16px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-md font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter italic">{p.title}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest italic block">{p.publisherId?.name}</p>
                                                        {p.publisherRating > 0 && (
                                                            <div className="flex items-center justify-center mt-2">
                                                                <span className="text-sm font-black bg-amber-100 text-amber-600 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5">
                                                                    ★ {p.publisherRating.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-1">
                                                <p className="text-[0.65rem] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 italic">{p.departmentId?.name || "Global"}</p>
                                                <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-wider">{p.subDeptId?.name || "Shared"}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full border text-[0.55rem] font-black uppercase tracking-widest ${getStatusStyle(p)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4 text-slate-400">
                                                <div className="flex items-center gap-1.5 text-[0.65rem] font-black italic"><Heart size={14} className="text-rose-500 leading-none" /> {p.likesCount || 0}</div>
                                                <div className="flex items-center gap-1.5 text-[0.65rem] font-black italic"><MessageSquare size={14} className="text-blue-500 leading-none" /> {p.commentsCountVal || 0}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button onClick={() => handleViewDetail(p)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filtered.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        );
    }

    /* ── DETAIL VIEW ────────────────────────────────────────────────────── */
    if (view === 'detail' && selectedPaper) {
        const p = selectedPaper;
        return (
            <div className="animate-in zoom-in-95 duration-500 max-w-7xl mx-auto space-y-10 text-left mb-20 px-4">
                <div className="flex items-center justify-between bg-white/50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-white/20 backdrop-blur-xl shadow-xl">
                    <button onClick={() => setView('list')} className="p-4 rounded-[28px] bg-white text-slate-400 hover:text-blue-500 border border-slate-100 shadow-sm transition-all"><ArrowLeft size={24} /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="bg-white dark:bg-slate-900 rounded-[64px] p-16 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                             <div className="space-y-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest italic">{new Date(p.publishDate).toLocaleDateString()}</span>
                                </div>
                                <h1 className="text-5xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic leading-tight underline decoration-blue-500 decoration-8 underline-offset-[16px]">{p.title}</h1>
                                
                                <div className="flex flex-wrap items-center gap-6 mt-12">
                                    <div className="flex items-center gap-3 text-[0.65rem] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-5 py-2.5 rounded-full shadow-sm"><Layers size={14} /> {p.departmentId?.name || "All"}</div>
                                    <div className="flex items-center gap-3 text-[0.65rem] font-black text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-full border border-slate-100 dark:border-slate-800"><Hash size={14} className="text-slate-300" /> {p.subDeptId?.name || "Shared"}</div>
                                </div>
                                
                                <div className="p-12 bg-slate-50 dark:bg-slate-800/50 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-inner group relative">
                                    <p className="text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic opacity-90 leading-relaxed relative z-10">
                                        "{p.abstract}"
                                    </p>
                                </div>

                                {/* Modernized Likes Row (No Avatars as requested) */}
                                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[0.7rem] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2"><Heart size={16} className="text-rose-500" fill="currentColor" /> likes</h4>
                                        <button onClick={() => setShowLikersModal(true)} className="text-[0.7rem] font-black text-blue-500 uppercase tracking-widest hover:underline transition-all">{(p.likes || []).length} TOTAL • VIEW REGISTRY</button>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Comments Panel */}
                        <div className="space-y-6">
                             <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4 ml-6">
                                <MessageSquare size={18} className="text-blue-500" /> comments
                             </h4>
                             <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative group">
                                <div className="h-[500px] overflow-y-auto p-12 space-y-8 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
                                    {(p.comments || []).length > 0 ? p.comments.map((comment, i) => (
                                        <div key={i} className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[48px] border border-slate-100 dark:border-slate-800 flex gap-8">
                                            <div className="w-14 h-14 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden shrink-0 shadow-lg relative">
                                                <img src={comment.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId?._id}`} alt="" />
                                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white border-2 border-white"><Check size={10} /></div>
                                            </div>
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">{comment.userId?.name || "Anonymous"}</p>
                                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[0.5rem] font-black rounded-lg uppercase tracking-widest italic">{comment.userId?.role || "Member"}</span>
                                                    </div>
                                                    <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 font-bold italic opacity-90 text-md leading-relaxed">"{comment.content || comment.text}"</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                                            <MessageSquare size={64} />
                                            <p className="text-xl font-black uppercase tracking-[0.2em]">Zero Peer Disputes Recorded</p>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>

                    <aside className="space-y-10">
                        {/* Simple Author Panel */}
                        <div className="bg-white dark:bg-slate-900 rounded-[56px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1">
                             <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-[32px] border-4 border-white dark:border-slate-800 overflow-hidden shadow-xl shadow-blue-500/10">
                                    <img src={p.publisherId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.publisherId?._id}`} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">{p.publisherId?.name || "Unverified"}</h3>
                                        {p.publisherRating > 0 && (
                                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1.5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                                <span className="text-xs font-black">{p.publisherRating.toFixed(1)}</span>
                                                <Award size={14} className="fill-amber-600" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[0.65rem] font-black text-blue-500 uppercase tracking-[0.2em]">{p.publisherId?.role || "Practitioner"}</p>
                                </div>
                             </div>
                        </div>

                        {/* Policy Compliance Panel */}
                        <div className="bg-white dark:bg-slate-900 rounded-[56px] p-12 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-8">
                             <div className="space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Policy Compliance</h2>
                                <p className="text-[0.85rem] font-bold text-slate-500 leading-relaxed px-4">
                                    Enforce research guidelines by toggling manuscript availability within the network nodes.
                                </p>
                             </div>
                             
                             <div className="space-y-4">
                                {p.status === 'Pending' ? (
                                    <>
                                        <button 
                                            onClick={() => handleUpdateStatus(p._id, 'Approved')}
                                            className="w-full py-6 bg-emerald-500 text-white rounded-[28px] font-black text-[0.9rem] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle2 size={22} /> Approve Paper
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(p._id, 'Rejected')}
                                            className="w-full py-6 bg-slate-950 text-white rounded-[28px] font-black text-[0.9rem] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <XCircle size={22} /> Reject Paper
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => handleUpdateStatus(p._id, (p.status === 'Suspended' || p.status === 'Rejected') ? 'Approved' : 'Suspended')}
                                        className={`w-full py-6 rounded-[28px] font-black text-[0.9rem] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${
                                            (p.status === 'Suspended' || p.status === 'Rejected')
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600' 
                                            : 'bg-[#ef4444] text-white shadow-rose-500/20 hover:bg-rose-600'
                                        }`}
                                    >
                                        <Ban size={22} /> {(p.status === 'Suspended' || p.status === 'Rejected') ? 'Allow Access' : 'Suspend Access'}
                                    </button>
                                )}
                             </div>
                        </div>
                    </aside>
                </div>

                {/* Likers Modal */}
                {showLikersModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLikersModal(false)}>
                         <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                             <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                 <div>
                                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">likes</h3>
                                     <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Full identification of clinical supporters</p>
                                 </div>
                                 <button onClick={() => setShowLikersModal(false)} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
                             </div>
                             <div className="max-h-[500px] overflow-y-auto p-10 space-y-6 custom-scrollbar">
                                 {p.likes.map((like, i) => (
                                     <div key={i} className="flex items-center gap-6 p-6 rounded-[32px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 group">
                                         <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                                             <img src={like.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${like.userId?._id}`} className="w-full h-full object-cover" alt="" />
                                         </div>
                                         <div className="flex-1">
                                             <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{like.userId?.name}</p>
                                             <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[0.55rem] font-black rounded-lg uppercase tracking-widest mt-2 inline-block">{like.userId?.role}</span>
                                         </div>
                                         <div className="p-3 text-emerald-500"><ShieldCheck size={20} /></div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default Research;
