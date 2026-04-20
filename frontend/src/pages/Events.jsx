import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    Calendar, MapPin, Building2, 
    ChevronRight, Search, Activity,
    Share2, ExternalLink, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api';

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Assuming events are stored under /appointments or a separate /events in backend
      // Based on controller list, events.jsx exists in admin, but maybe no /api/events yet?
      // Re-checking backend controllers: events.jsx exists. 
      const { data } = await axios.get(`${BASE_URL}/appointments`); 
      // Filter for events if applicable, or if there is a separate events endpoint
      const allEvents = data.data || [];
      setEvents(allEvents);
      setLoading(false);
    } catch {
      toast.error("Failed to sync clinical events");
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.departmentName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const logBrowseActivity = async (eventId) => {
    if (!user) return;
    try {
        await axios.post(`${BASE_URL}/browse-history`, {
            userId: user._id,
            eventId: eventId,
            actionType: 'view_event'
        });
    } catch (e) {
        console.error("Failed to log activity", e);
    }
  };

  const handleEventClick = (e) => {
    setSelectedEvent(e);
    if(e._id) logBrowseActivity(e._id);
  };

  const Breadcrumbs = () => (
    <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 overflow-x-auto pb-2 shrink-0">
      <button onClick={() => {setSearchQuery(''); setSelectedEvent(null);}} className="hover:text-blue-500 transition-colors">Ecosystem</button>
      <ChevronRight size={12} className="opacity-30" />
      <span className="text-blue-500 underline decoration-2 underline-offset-8">Medical Events</span>
      {selectedEvent && (
        <>
          <ChevronRight size={12} className="opacity-30" />
          <span className="text-blue-500 italic">{selectedEvent.title}</span>
        </>
      )}
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing event registry...</p>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    const e = selectedEvent;
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700 w-full min-h-screen mt-20">
            <Breadcrumbs />
            <div className="bg-white dark:bg-slate-900 rounded-[64px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl relative">
                <div className="h-96 relative overflow-hidden bg-slate-900">
                    <img src={e.image || 'https://images.unsplash.com/photo-1540575861501-7ad05823c93b?w=1200'} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="absolute bottom-16 left-16 right-16 flex flex-col md:flex-row items-end justify-between gap-8">
                        <div className="space-y-4 max-w-2xl text-left">
                           <div className="px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full inline-block">Active Event</div>
                           <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase italic">{e.title}</h1>
                           <p className="text-xl text-slate-300 font-bold italic opacity-80">Hosted by clinical specialists globally.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 p-16">
                    <div className="lg:col-span-2 space-y-16 text-left">
                        <section>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-4">Event Protocol <span className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></span></h3>
                            <p className="text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic opacity-90">
                                This clinical summit focuses on advanced diagnostic procedures and neural healthcare integration, bringing together the world's most innovative medical minds.
                            </p>
                        </section>
                        
                        <section>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Agenda & Core Modules</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['Advanced Diagnostics', 'Neural Integration', 'Patient Recovery', 'Surgical Innovation'].map((item, i) => (
                                    <div key={i} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-blue-500"><Activity size={20} /></div>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8">
                        <div className="p-10 bg-slate-900 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                            <h4 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-10 border-b border-white/5 pb-4">Session Logistics</h4>
                            <div className="space-y-10 mb-12">
                                <div className="flex gap-5">
                                    <div className="h-12 w-1 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-[0.55rem] text-slate-500 uppercase font-black mb-1">Timeframe</p>
                                        <p className="text-xl font-black">24-28 APR 2026</p>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <div className="h-12 w-1 bg-emerald-500 rounded-full"></div>
                                    <div>
                                        <p className="text-[0.55rem] text-slate-500 uppercase font-black mb-1">Node Location</p>
                                        <p className="text-xl font-black">GLOBAL (VIRTUAL)</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => isLoggedIn ? toast.success("Slot Reserved Under Identity") : navigate('/login')}
                                className="w-full py-6 bg-white text-slate-900 font-black rounded-[24px] uppercase tracking-widest text-[0.7rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Secure Delegate Seat
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700 w-full min-h-screen mt-20">
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="text-left space-y-4">
          <Breadcrumbs />
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Medical <span className="text-blue-500 not-italic">Summits</span></h1>
          <p className="text-sm font-bold text-slate-500 italic">Explore the global stage of medical innovation and breakout research.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-sm font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredEvents.map((e, index) => (
          <div key={e._id || index} onClick={() => handleEventClick(e)} className="group bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col">
             <div className="h-64 relative overflow-hidden">
                <img src={e.image || `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&fit=crop&sig=${index}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 dark:bg-slate-950/90 rounded-full text-[0.6rem] font-black text-blue-500 shadow-lg">UPCOMING</div>
             </div>
             <div className="p-10 space-y-4 flex-1 text-left flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors uppercase tracking-tighter italic leading-tight flex-1">{e.title}</h3>
                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center group-hover:border-blue-500/20">
                    <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar size={14} className="text-blue-500" /> APR 2026
                    </div>
                    <span className="text-[0.6rem] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Details →</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
