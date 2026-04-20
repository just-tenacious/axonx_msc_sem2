import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Search, FileText, Database,
  Share2, Download, Star,
  ChevronRight, Info, Eye,
  MessageSquare, Heart, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api';

const Research = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/appointments`); // For demo, using appointments or update if backend has papers
      // For now, let's mock some research data if backend doesn't have it
      setPapers([
        { _id: '1', title: 'Neural Integration in Modern Diagnostics', author: 'Dr. Shraddha', category: 'Neurology', abstract: 'Exploring the synergy between AI-driven diagnostics and clinical neurology in rural Indian healthcare systems.' },
        { _id: '2', title: 'Cardiovascular Breakthroughs 2026', author: 'Dr. Aryan', category: 'Cardiology', abstract: 'Non-invasive surgical protocols and their efficacy in pediatric heart health management.' },
        { _id: '3', title: 'Data Sovereignty in Biomedical Ecosystems', author: 'AxonX Research Node', category: 'Ethics', abstract: 'Ensuring AES-256 integrity across decentralized medical databases and patient registries.' }
      ]);
      setLoading(false);
    } catch {
      toast.error("Failed to access digital library");
      setLoading(false);
    }
  };

  const logBrowseActivity = async (paperId) => {
    if (!user) return;
    try {
      await axios.post(`${BASE_URL}/browse-history`, {
        userId: user._id,
        researchPaperId: paperId,
        actionType: 'view_research'
      });
    } catch (e) {
      console.error("Failed to log activity", e);
    }
  };

  const handlePaperClick = (p) => {
    setSelectedPaper(p);
    if (p._id) logBrowseActivity(p._id);
  };

  const Breadcrumbs = () => (
    <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 overflow-x-auto pb-2 shrink-0">
      <button onClick={() => { setSearchQuery(''); setSelectedPaper(null); }} className="hover:text-blue-500 transition-colors">Digital Archives</button>
      <ChevronRight size={12} className="opacity-30" />
      <span className="text-blue-500 underline decoration-2 underline-offset-8">Research Library</span>
      {selectedPaper && (
        <>
          <ChevronRight size={12} className="opacity-30" />
          <span className="text-blue-500 italic">{selectedPaper.title}</span>
        </>
      )}
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest animate-pulse">Accessing scientific archives...</p>
        </div>
      </div>
    );
  }

  if (selectedPaper) {
    const p = selectedPaper;
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700 w-full min-h-screen mt-20">
        <Breadcrumbs />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12 text-left">
            <div className="bg-white dark:bg-slate-900 p-16 rounded-[64px] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-4xl opacity-5 font-black italic select-none">ABSTRACT</div>
              <div className="space-y-8 relative z-10">
                <div className="inline-flex px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-900/30">
                  PEER REVIEWED • {p.category}
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{p.title}</h1>

                <div className="flex items-center gap-6 py-8 border-y border-slate-50 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                    <FileText className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Investigator</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{p.author}</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all shadow-sm border border-slate-100 dark:border-slate-700"><Heart size={20} /></button>
                    <button className="p-4 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"><Share2 size={20} /></button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Scientific Synopsis</h3>
                  <p className="text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic opacity-80">
                    "{p.abstract}"
                  </p>
                  <p className="text-lg text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                    This investigation explores the multi-dimensional impact of digital health records on procedural success rates across diagnostic clinics. Utilizing AxonX neural modeling, research nodes were able to synchronize clinical outcomes across 15+ sub-departments.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <MessageSquare size={16} className="text-blue-500" /> Peer Discussion
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 text-center opacity-50 italic font-bold">
                "Authentication required to join the scientific dialogue node."
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-10 bg-slate-900 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
              <h4 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-10 border-b border-white/5 pb-4">Manuscript Stats</h4>
              <div className="space-y-10 mb-12">
                <div className="flex justify-between items-center">
                  <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Released</span>
                  <span className="text-lg font-black italic">MAY 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Citations</span>
                  <span className="text-lg font-black italic text-blue-400">1.2K+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Security</span>
                  <span className="text-lg font-black italic flex items-center gap-2">AES-256 <ShieldCheck size={16} /></span>
                </div>
              </div>
              <button className="w-full py-6 bg-white text-slate-900 font-black rounded-[24px] uppercase tracking-widest text-[0.7rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                Download PDF 📥
              </button>
            </div>

            <div className="p-10 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">Indexed Tags</h4>
              <div className="flex flex-wrap gap-2">
                {['Medicine', 'AI', 'Biomedical', 'Clinical'].map(t => (
                  <span key={t} className="px-5 py-2 bg-slate-50 dark:bg-slate-800 text-[0.6rem] font-black text-slate-500 uppercase tracking-widest rounded-xl border border-slate-100 dark:border-slate-700">{t}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700 w-full min-h-screen mt-20">
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="text-left space-y-4">
          <Breadcrumbs />
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Research <span className="text-blue-500 not-italic">Library</span></h1>
          <p className="text-sm font-bold text-slate-500 italic">Access the global archive of peer-reviewed biomedical breakthroughs.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-sm font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
        {papers.map((p, index) => (
          <div key={p._id || index} onClick={() => handlePaperClick(p)} className="group bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 p-12 shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[64px] group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 mb-10 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
              <FileText className="text-blue-500" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[0.55rem] font-black uppercase tracking-widest rounded-lg inline-block">{p.category}</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors uppercase tracking-tighter italic leading-tight">{p.title}</h3>
              <p className="text-[0.65rem] font-bold text-slate-400 italic line-clamp-3">"{p.abstract}"</p>
            </div>
            <div className="pt-8 mt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center group-hover:border-blue-500/20">
              <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest italic">
                By {p.author}
              </div>
              <span className="text-[0.6rem] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Read Manuscript →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Research;
