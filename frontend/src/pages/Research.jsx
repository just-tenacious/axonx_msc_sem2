import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Search, FileText,
  ChevronRight, Info,
  MessageSquare, Heart, Bookmark, BookmarkCheck,
  Send, Trash2, ShieldCheck
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

  // Interaction state
  const [likes, setLikes] = useState({});       // { paperId: { count, liked } }
  const [saved, setSaved] = useState({});       // { paperId: true/false }
  const [savedCounts, setSavedCounts] = useState({}); // { paperId: count }
  const [comCounts, setComCounts] = useState({}); // { paperId: count }
  const [comments, setComments] = useState([]); // flat list for selected paper
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const itemsPerPage = 6;

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/research-papers?status=Approved`);
      const paperList = data.data || [];
      setPapers(paperList);
      
      // Initial counts fetch (publicly accessible)
      const counts = {};
      const likeCounts = {};
      const sCounts = {};
      await Promise.all(paperList.map(async p => {
          const pIdStr = p._id.toString();
          try {
              // Get comment count
              const cRes = await axios.get(`${BASE_URL}/interactions/comments?targetId=${p._id}&targetType=ResearchPaper`);
              counts[pIdStr] = cRes.data.data?.length || 0;
              
              // Get public like count (no userId needed for basic count)
              const lRes = await axios.get(`${BASE_URL}/interactions/likes?targetId=${p._id}&targetType=ResearchPaper`);
              likeCounts[pIdStr] = { count: lRes.data.data?.count || 0, liked: false };

              // Get saved count
              const sRes = await axios.get(`${BASE_URL}/interactions/saved/count?itemId=${p._id}&itemType=ResearchPaper`);
              sCounts[pIdStr] = sRes.data.count || 0;
          } catch { 
              counts[pIdStr] = 0; 
              likeCounts[pIdStr] = { count: 0, liked: false };
              sCounts[pIdStr] = 0;
          }
      }));
      setComCounts(counts);
      setLikes(likeCounts);
      setSavedCounts(sCounts);

      setLoading(false);
    } catch {
      toast.error("Failed to access digital library");
      setLoading(false);
    }
  };

  // Fetch USER-SPECIFIC state if logged in
  const fetchInteractionState = useCallback(async (paperList) => {
    if (!isLoggedIn || paperList.length === 0) return;
    try {
      const results = await Promise.all(
        paperList.map(p =>
          axios.get(`${BASE_URL}/interactions/likes?targetId=${p._id}&targetType=ResearchPaper&userId=${user._id}`)
            .then(r => ({ id: p._id, ...r.data.data }))
            .catch(() => ({ id: p._id, count: 0, liked: false }))
        )
      );
      setLikes(prev => {
          const newMap = { ...prev };
          results.forEach(r => { newMap[r.id.toString()] = { count: r.count, liked: r.liked }; });
          return newMap;
      });

      const savedResults = await Promise.all(
        paperList.map(p =>
          axios.get(`${BASE_URL}/interactions/saved?userId=${user._id}&itemId=${p._id}&itemType=ResearchPaper`)
            .then(r => ({ id: p._id, saved: r.data.data?.saved || false }))
            .catch(() => ({ id: p._id, saved: false }))
        )
      );
      const savedMap = {};
      savedResults.forEach(r => { savedMap[r.id.toString()] = r.saved; });
      setSaved(savedMap);
    } catch (e) {}
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (papers.length > 0) fetchInteractionState(papers);
  }, [papers, fetchInteractionState]);

  const fetchComments = async (paperId) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/interactions/comments?targetId=${paperId}&targetType=ResearchPaper`);
      setComments(data.data || []);
      setComCounts(prev => ({ ...prev, [paperId.toString()]: data.data?.length || 0 }));
    } catch {}
  };

  const handlePaperClick = (p) => {
    setSelectedPaper(p);
    setCommentText('');
    fetchComments(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logic for filtered and paginated papers
  const filteredPapers = papers.filter(p => {
    const matchesSearch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.abstract || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(papers.map(p => p.category))];
  const paginatedPapers = filteredPapers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedPaper]);

  const toggleLike = async (paperId, e) => {
    e?.stopPropagation();
    if (!isLoggedIn) { toast.error("Sign in to like"); return; }
    try {
      const { data } = await axios.post(`${BASE_URL}/interactions/likes/toggle`, {
        userId: user._id, targetId: paperId, targetType: 'ResearchPaper'
      });
      setLikes(prev => {
        const idStr = paperId.toString();
        return {
          ...prev,
          [idStr]: {
            count: data.liked
              ? (prev[idStr]?.count || 0) + 1
              : Math.max((prev[idStr]?.count || 0) - 1, 0),
            liked: data.liked
          }
        };
      });
    } catch { toast.error("Action failed"); }
  };

  const toggleSave = async (paperId, e) => {
    e?.stopPropagation();
    if (!isLoggedIn) { toast.error("Sign in to save"); return; }
    try {
      const { data } = await axios.post(`${BASE_URL}/interactions/saved/toggle`, {
        userId: user._id, itemId: paperId, itemType: 'ResearchPaper'
      });
      setSaved(prev => ({ ...prev, [paperId.toString()]: data.saved }));
      setSavedCounts(prev => ({ 
        ...prev, 
        [paperId.toString()]: data.saved ? (prev[paperId.toString()] || 0) + 1 : Math.max((prev[paperId.toString()] || 0) - 1, 0)
      }));
      toast.success(data.saved ? "Saved to Library" : "Removed from Library");
    } catch { toast.error("Action failed"); }
  };

  const postComment = async () => {
    if (!isLoggedIn) { toast.error("Sign in to comment"); return; }
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/interactions/comments`, {
        userId: user._id, targetId: selectedPaper._id,
        targetType: 'ResearchPaper', content: commentText.trim()
      });
      setComments(prev => [data.data, ...prev]);
      setComCounts(prev => ({ ...prev, [selectedPaper._id.toString()]: (prev[selectedPaper._id.toString()] || 0) + 1 }));
      setCommentText('');
    } catch { toast.error("Failed to post comment"); }
    setPostingComment(false);
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${BASE_URL}/interactions/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      setComCounts(prev => ({ ...prev, [selectedPaper._id.toString()]: Math.max((prev[selectedPaper._id.toString()] || 0) - 1, 0) }));
    } catch { toast.error("Failed to delete comment"); }
  };

  const Breadcrumbs = () => (
    <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 overflow-x-auto pb-2 shrink-0">
      <button onClick={() => { setSearchQuery(''); setSelectedPaper(null); }} className="hover:text-blue-500 transition-colors">Digital Archives</button>
      <ChevronRight size={12} className="opacity-30" />
      <span className="text-blue-500 underline decoration-2 underline-offset-8">Research Library</span>
      {selectedPaper && (<><ChevronRight size={12} className="opacity-30" /><span className="text-blue-500 italic max-w-[200px] truncate">{selectedPaper.title}</span></>)}
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

  // RENDER DETAIL VIEW
  if (selectedPaper) {
    const p = selectedPaper;
    const pIdStr = p._id.toString();
    const paperLike = likes[pIdStr] || likes[p._id] || { count: 0, liked: false };
    const paperSaved = saved[pIdStr] || saved[p._id] || false;
    const sCount = savedCounts[pIdStr] || savedCounts[p._id] || 0;
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in duration-700 w-full min-h-screen mt-32">
        <Breadcrumbs />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12 text-left">
            <div className="bg-white dark:bg-slate-900 p-16 rounded-[64px] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-4xl opacity-5 font-black italic select-none">ABSTRACT</div>
              <div className="space-y-8 relative z-10">
                <div className="inline-flex px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-900/30">
                  PEER REVIEWED • {p.category}
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">{p.title}</h1>

                <div className="flex items-center gap-6 py-8 border-y border-slate-50 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                    <FileText className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Investigator</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                      {p.publisherId?.name || p.author}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleLike(p._id)}
                      className={`p-4 rounded-2xl border transition-all shadow-sm flex items-center gap-2 ${paperLike.liked ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:text-rose-500'}`}
                    >
                      <Heart size={20} fill={paperLike.liked ? 'currentColor' : 'none'} />
                      <span className="text-xs font-black">{paperLike.count}</span>
                    </button>
                    <button
                      onClick={() => toggleSave(p._id)}
                      className={`p-4 rounded-2xl border transition-all shadow-sm flex items-center gap-2 ${paperSaved ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:text-blue-500'}`}
                    >
                      {paperSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                      <span className="text-xs font-black">{sCount}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Scientific Synopsis</h3>
                  <p className="text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic opacity-80">
                    "{p.abstract}"
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <MessageSquare size={16} className="text-blue-500" /> Peer Discussion ({comments.length})
              </h4>

              {isLoggedIn ? (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 flex gap-3">
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && postComment()}
                      placeholder="Add to the scientific dialogue..."
                      className="flex-1 px-6 py-4 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold"
                    />
                    <button
                      onClick={postComment}
                      disabled={!commentText.trim() || postingComment}
                      className="px-6 py-4 bg-blue-600 text-white rounded-[24px] font-black text-sm hover:bg-blue-700 disabled:opacity-40 transition-all flex items-center gap-2"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 text-center opacity-60 italic font-bold text-sm">
                  "Authentication required to join the scientific dialogue node."
                </div>
              )}

              {/* Scrollable Comments Section */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 no-scrollbar">
                {comments.map(c => (
                  <div key={c._id} className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm group text-left">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-sm flex-shrink-0 overflow-hidden">
                      {c.userId?.avatar ? <img src={c.userId.avatar} alt="" className="w-full h-full object-cover" /> : c.userId?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{c.userId?.name || 'Anonymous'}</p>
                        <span className="text-[0.55rem] font-black text-slate-400 uppercase">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{c.content}</p>
                    </div>
                    {user && (c.userId?._id === user._id || user.role === 'admin') && (
                      <button onClick={() => deleteComment(c._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-rose-400 hover:bg-rose-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[48px] text-slate-400 italic font-bold text-sm">No peer comments available in this node.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // RENDER GRID VIEW
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in duration-1000 w-full min-h-screen mt-32">
      <Breadcrumbs />
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1 space-y-12 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4">
                Archive <span className="text-blue-600 not-italic">Nodes</span>
              </h1>
              <p className="text-lg font-bold text-slate-500 italic">Indexed Peer-Reviewed Clinical Documentation</p>
            </div>
            <div className="relative group max-w-sm w-full">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Scan library nodes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 text-sm font-bold shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {paginatedPapers.map(p => {
              const pIdStr = p._id.toString();
              const paperLike = likes[pIdStr] || likes[p._id] || { count: 0, liked: false };
              const paperSaved = saved[pIdStr] || saved[p._id] || false;
              const commentCount = comCounts[pIdStr] || comCounts[p._id] || 0;
              const sCount = savedCounts[pIdStr] || savedCounts[p._id] || 0;
              
              return (
                <div
                  key={p._id}
                  onClick={() => handlePaperClick(p)}
                  className="group bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 p-10 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[80px]"></div>
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                        <FileText className="text-blue-500" />
                     </div>
                     <div className="flex gap-2">
                        <button
                          onClick={(e) => toggleLike(p._id, e)}
                          className={`p-3 rounded-xl transition-all border ${paperLike.liked ? 'bg-rose-50 text-rose-500 border-rose-100' : 'text-slate-300 hover:text-rose-500 border-transparent hover:bg-slate-50'}`}
                        >
                          <Heart size={16} fill={paperLike.liked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => toggleSave(p._id, e)}
                          className={`p-3 rounded-xl transition-all border ${paperSaved ? 'bg-blue-50 text-blue-500 border-blue-100' : 'text-slate-300 hover:text-blue-500 border-transparent hover:bg-slate-50'}`}
                        >
                          <BookmarkCheck size={16} />
                        </button>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <span className="text-[0.55rem] font-black text-blue-500 uppercase tracking-widest">{p.category}</span>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 h-16">{p.title}</h3>
                     
                     <div className="flex items-center gap-4 py-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 text-[0.6rem] font-black">
                            <Heart size={12} fill="currentColor" /> {paperLike.count}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 text-[0.6rem] font-black">
                            <MessageSquare size={12} fill="currentColor" /> {commentCount}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 text-[0.6rem] font-black">
                            <Bookmark size={12} fill="currentColor" /> {sCount}
                        </div>
                     </div>
                     
                     <p className="text-[0.75rem] font-medium text-slate-400 italic line-clamp-3">"{p.abstract}"</p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPapers.length > itemsPerPage && (
              <div className="flex items-center justify-center gap-4 pt-12">
                 <button
                   disabled={currentPage === 1}
                   onClick={() => setCurrentPage(prev => prev - 1)}
                   className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                 >
                   Prev Node
                 </button>
                 <span className="text-[0.65rem] font-black text-blue-600 italic">SYNC VOL {currentPage} / {Math.ceil(filteredPapers.length / itemsPerPage)}</span>
                 <button
                   disabled={currentPage * itemsPerPage >= filteredPapers.length}
                   onClick={() => setCurrentPage(prev => prev + 1)}
                   className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                 >
                   Next Node
                 </button>
              </div>
          )}
        </div>

        <aside className="lg:w-80 space-y-10">
          <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden text-left">
             <h4 className="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 pb-4 border-b border-white/5">Primary Filters</h4>
             <div className="space-y-4">
                <p className="text-[0.5rem] font-black text-slate-500 uppercase ml-2 mb-2">Category Matrix</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedCategory(c)}
                        className={`px-5 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all ${selectedCategory === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {c}
                      </button>
                  ))}
                </div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Research;
