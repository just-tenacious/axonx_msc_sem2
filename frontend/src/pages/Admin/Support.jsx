import React, { useState, useEffect } from 'react';
import { 
    Mail, MessageSquare, Clock, CheckCircle2, ChevronRight, 
    ArrowLeft, Search, Filter, MailQuestion, Send, Check, 
    X, ExternalLink, Calendar, User, ShieldCheck, MailWarning,
    RefreshCw, ChevronLeft, MoreHorizontal, Inbox, FileText,
    Eye, ShieldAlert, Ban, UserCheck, Layers, Hash
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '../../components/Admin/Pagination';

const BASE_URL = 'http://localhost:5000/api';

const Support = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    
    // Nodal Interaction State
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    
    const [stats, setStats] = useState({ all: 0, pending: 0, responded: 0 });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${BASE_URL}/support/queries`);
            if (data.success) {
                setQueries(data.data);
                calculateStats(data.data);
            }
            setLoading(false);
        } catch (error) {
            toast.error("Failed to sync contact registry");
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        setStats({
            all: data.length,
            pending: data.filter(q => q.status === 'Pending').length,
            responded: data.filter(q => q.status === 'Responded').length
        });
    };

    const handleSendResponse = async () => {
        if (!responseMessage.trim()) {
            toast.error("Manifest requires content for transmission");
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.patch(`${BASE_URL}/support/queries/${selectedQuery._id}`, { 
                status: 'Responded',
                response: responseMessage
            });
            
            if (data.success) {
                toast.success(`Institutional response transmitted`);
                setShowModal(false);
                setResponseMessage('');
                fetchQueries();
            }
            setLoading(false);
        } catch (error) {
            toast.error("Transmission failed");
            setLoading(false);
        }
    };

    const handleRowClick = (query) => {
        setSelectedQuery(query);
        setResponseMessage(query.response || '');
        setShowModal(true);
    };

    const filtered = queries.filter(q => {
        const matchesSearch = q.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.subject.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (selectedStatus === 'Pending') return matchesSearch && q.status === 'Pending';
        if (selectedStatus === 'Responded') return matchesSearch && q.status === 'Responded';
        return matchesSearch;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Responded': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Pending':   return 'bg-rose-50 text-rose-600 border-rose-100';
            default:          return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic">Contact <span className="text-blue-500 not-italic">Registry</span></h1>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em] mt-3 italic">Administrative Artifact & Query Management</p>
                </div>
                
                <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-500/5">
                    {[
                        { id: 'All', name: 'All', count: stats.all, icon: Inbox },
                        { id: 'Pending', name: 'Pending', count: stats.pending, icon: Clock },
                        { id: 'Responded', name: 'Responded', count: stats.responded, icon: CheckCircle2 }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setSelectedStatus(tab.id); setCurrentPage(1); }} className={`flex items-center gap-3 px-8 py-4 rounded-[22px] font-black text-[0.7rem] uppercase tracking-widest transition-all ${selectedStatus === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                            <tab.icon size={16} /> {tab.name} <span className={`ml-1 px-2 py-0.5 rounded-md text-[0.6rem] ${selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Registry Search */}
            <div className="relative max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Filter contact registry by name, email or topic..." className="w-full pl-16 pr-8 h-14 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 outline-none font-bold text-sm shadow-sm focus:ring-4 ring-blue-500/10 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            {/* Registry Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafc] dark:bg-slate-800/50">
                            <tr>
                                <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">srno</th>
                                <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                                <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Query Subject</th>
                                <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                                <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-right">Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {currentItems.map((q, idx) => (
                                <tr key={q._id} onClick={() => handleRowClick(q)} className="hover:bg-blue-50/10 transition-colors group cursor-pointer">
                                    <td className="px-10 py-8 text-xs font-black text-slate-300 italic">{(indexOfFirstItem + idx + 1).toString().padStart(2, '0')}</td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform"><User size={18} /></div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{q.name}</p>
                                                <p className="text-[0.6rem] text-slate-400 font-bold tracking-wider">{q.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-[0.65rem] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight italic line-clamp-1 max-w-[200px]">{q.subject}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[0.65rem] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2"><Calendar size={12} className="text-blue-500"/> {new Date(q.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-wider">{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-full border text-[0.55rem] font-black uppercase tracking-widest ${getStatusStyle(q.status)}`}>{q.status}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm inline-block"><ChevronRight size={18} /></div>
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

            {/* Registry Nodal Modal */}
            {showModal && selectedQuery && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
                     <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[56px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden scale-in-center" onClick={e => e.stopPropagation()}>
                         <div className="p-12 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 text-4xl opacity-5 font-black italic select-none uppercase pointer-events-none">Artifact Dossier</div>
                             <div>
                                 <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Contact Inquiry</h3>
                                 <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Client Communication Artifact • {selectedQuery._id.substring(0,8).toUpperCase()}</p>
                             </div>
                             <button onClick={() => setShowModal(false)} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
                         </div>
                         
                         <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                     <h4 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Client Identity</h4>
                                     <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                         <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-500 shadow-sm"><User size={24} /></div>
                                         <div>
                                             <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{selectedQuery.name}</p>
                                             <p className="text-xs font-bold text-blue-500 italic lowercase">{selectedQuery.email}</p>
                                         </div>
                                     </div>
                                </div>
                                <div className="space-y-4">
                                     <h4 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Timeline Node</h4>
                                     <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                         <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-sm"><Calendar size={24} /></div>
                                         <div>
                                             <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{new Date(selectedQuery.createdAt).toLocaleDateString()}</p>
                                             <p className="text-xs font-bold text-slate-400 italic">Registered at {new Date(selectedQuery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                         </div>
                                     </div>
                                </div>
                             </div>

                             <div className="space-y-4">
                                 <h4 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Query Narrative</h4>
                                 <div className="p-10 bg-slate-50 dark:bg-slate-800 rounded-[48px] border border-slate-100 dark:border-slate-700 shadow-inner">
                                     <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Subject: {selectedQuery.subject}</p>
                                     <p className="text-xl text-slate-700 dark:text-slate-300 font-bold italic leading-relaxed opacity-90 leading-relaxed">
                                         "{selectedQuery.message}"
                                     </p>
                                 </div>
                             </div>

                             {selectedQuery.status === 'Responded' ? (
                                 <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                     <h4 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Administrative Response</h4>
                                     <div className="p-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-[48px] border border-emerald-100 dark:border-emerald-900/30">
                                         <p className="text-xl text-emerald-700 dark:text-emerald-400 font-bold italic leading-relaxed opacity-90">
                                             {selectedQuery.response}
                                         </p>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="space-y-6">
                                     <h4 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Response Manifest</h4>
                                     <textarea 
                                         rows="6" 
                                         placeholder="Compose professional response artifact..." 
                                         className="w-full p-10 bg-slate-50 dark:bg-slate-800 rounded-[48px] border border-slate-100 dark:border-slate-700 outline-none font-bold text-md focus:ring-4 ring-blue-500/10 italic leading-relaxed"
                                         value={responseMessage}
                                         onChange={e => setResponseMessage(e.target.value)}
                                     />
                                     <button 
                                         onClick={handleSendResponse}
                                         className="w-full py-8 bg-blue-600 text-white rounded-[32px] font-black text-[0.85rem] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                                     >
                                         <Send size={24} /> Transmit Response
                                     </button>
                                 </div>
                             )}
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default Support;
