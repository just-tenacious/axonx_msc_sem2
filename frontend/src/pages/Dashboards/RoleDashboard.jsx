import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    User, Mail, Calendar, Edit2, Save, X,
    BookmarkCheck, FileText, Building2, Stethoscope,
    ChevronRight, ShieldCheck, Camera, Phone, Heart, Trash2,
    Activity, Clock, Globe, Send, Plus, History,
    CalendarCheck, Settings, Eye, Briefcase, ChevronLeft
} from 'lucide-react';

const BASE_URL = 'http://localhost:5000/api';
const IMAGE_BASE = 'http://localhost:5000';

const imgSrc = (image) => {
    if (!image) return `https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&size=200`;
    if (typeof image === 'string' && image.startsWith('http')) return image;
    return `${IMAGE_BASE}${image}`;
};

const RoleDashboard = ({ role }) => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(false);

    // Common State
    const [savedPapers, setSavedPapers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [myManuscripts, setMyManuscripts] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [myAvailability, setMyAvailability] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dropdown Data
    const [hospitals, setHospitals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subDepartments, setSubDepartments] = useState([]);

    // Profile Form
    const [profileForm, setProfileForm] = useState({
        name: '', email: '', bio: '', gender: '', dob: '', avatar: '',
        hospitalId: '', departmentId: '', subDepartmentId: ''
    });

    // Add Item Forms
    const [showAddModal, setShowAddModal] = useState(false);
    const [paperForm, setPaperForm] = useState({ title: '', category: '', abstract: '', departmentId: '', subDeptId: '', pdfUrl: '' });
    const [eventForm, setEventForm] = useState({ title: '', tagline: '', description: '', startDate: '', endDate: '', category: 'Medical Summit' });
    const [availForm, setAvailForm] = useState({ date: '', startTime: '', endTime: '', maxSlots: 10 });
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                gender: user.gender || '',
                dob: user.dob ? new Date(user.dob).toISOString().substring(0, 10) : '',
                avatar: user.avatar || '',
                hospitalId: user.hospitalId?._id || user.hospitalId || '',
                departmentId: user.departmentId?._id || user.departmentId || '',
                subDepartmentId: user.subDepartmentId?._id || user.subDepartmentId || ''
            });
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        const uid = user.id || user._id;
        try {
            if (activeTab === 'saved' || activeTab === 'profile') {
                const { data } = await axios.get(`${BASE_URL}/interactions/saved?userId=${uid}&itemType=ResearchPaper`);
                const papers = await Promise.all(
                    (data.data || []).map(async (item) => {
                        const res = await axios.get(`${BASE_URL}/research-papers/${item.itemId}`).catch(() => null);
                        return res?.data?.data;
                    })
                );
                setSavedPapers(papers.filter(Boolean));
            } else if (activeTab === 'appointments') {
                const { data } = await axios.get(`${BASE_URL}/appointments/history?userId=${uid}&role=${role}`);
                setAppointments(data.data || []);
            } else if (activeTab === 'manuscripts') {
                const { data } = await axios.get(`${BASE_URL}/research-papers/publisher/${uid}`);
                setMyManuscripts(data.data || []);
            } else if (activeTab === 'events' && role === 'hospital') {
                const { data } = await axios.get(`${BASE_URL}/events/hospital/${uid}`);
                setMyEvents(data.data || []);
            } else if (activeTab === 'availability' && role === 'doctor') {
                const { data } = await axios.get(`${BASE_URL}/availability/doctor/${uid}`);
                setMyAvailability(data.data || []);
            }
        } catch (e) {
            console.error("Fetch protocol failure:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [h, d, s] = await Promise.all([
                axios.get(`${BASE_URL}/users?role=hospital`),
                axios.get(`${BASE_URL}/departments`),
                axios.get(`${BASE_URL}/sub-departments`)
            ]);
            setHospitals(h.data.data || []);
            setDepartments(d.data.data || []);
            setSubDepartments(s.data.data || []);
        } catch {}
    };

    const handleProfileSave = async () => {
        try {
            const tid = toast.loading("Syncing profile node...");
            const { data } = await axios.put(`${BASE_URL}/users/${user._id}`, profileForm);
            if (data.success) {
                login({ ...user, ...data.data });
                toast.success("Identity Updated", { id: tid });
                setEditing(false);
            }
        } catch (err) { toast.error("Sync Error"); }
    };

    const submitManuscript = async () => {
        if (!paperForm.title || !paperForm.abstract) return toast.error("Basic metadata required");
        try {
            const tid = toast.loading("Publishing to Arc...");
            await axios.post(`${BASE_URL}/research-papers`, {
                ...paperForm,
                publisherId: user._id,
                author: user.name,
                status: 'Pending'
            });
            toast.success("Manuscript Submitted for Review", { id: tid });
            setActiveTab('manuscripts');
            setPaperForm({ title: '', category: '', abstract: '', departmentId: '', subDeptId: '', pdfUrl: '' });
            fetchData();
        } catch { toast.error("Upload failed"); }
    };

    const submitEvent = async () => {
        if (!eventForm.title || !eventForm.startDate) return toast.error("Summit logistics required");
        try {
            const tid = toast.loading("Deploying Summit...");
            await axios.post(`${BASE_URL}/events`, {
                ...eventForm,
                hospitalId: user._id,
                status: 'Upcoming'
            });
            toast.success("Event Broadcasted Successfully", { id: tid });
            setShowAddModal(false);
            setEventForm({ title: '', tagline: '', description: '', startDate: '', endDate: '', category: 'Medical Summit' });
            fetchData();
        } catch { toast.error("Broadcast failed"); }
    };

    const tabs = [
        { id: 'profile', label: 'Identity', icon: User },
        { id: 'appointments', label: 'Clinical History', icon: History, roles: ['patient', 'doctor', 'hospital'] },
        { id: 'manuscripts', label: 'Publications', icon: FileText, roles: ['patient', 'doctor', 'researcher'] },
        { id: 'saved', label: 'Knowledge Vault', icon: BookmarkCheck, roles: ['patient', 'researcher'] },
        { id: 'events', label: 'Hosted Summits', icon: Globe, roles: ['hospital'] },
        { id: 'availability', label: 'Schedule Node', icon: Clock, roles: ['doctor'] },
        { id: 'add-item', label: 'Publish Manuscript', icon: Plus, roles: ['doctor', 'researcher', 'patient', 'student'] },
        { id: 'add-event', label: 'Host Summit', icon: Plus, roles: ['hospital'] },
    ].filter(t => !t.roles || t.roles.includes(role));

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-700 mt-32">
            {/* Header Node */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-[56px] p-12 overflow-hidden shadow-2xl text-left">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,_#3b82f6_0%,_transparent_60%)]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white/10 shadow-2xl bg-blue-900 group-hover:scale-105 transition-transform duration-500">
                            <img src={imgSrc(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">{user.name}</h1>
                        <div className="flex items-center gap-4 mt-4">
                            <span className="flex items-center gap-1.5 text-slate-400 text-[0.65rem] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full"><Mail size={12} className="text-blue-500" /> {user.email}</span>
                            <span className="flex items-center gap-1.5 text-slate-400 text-[0.65rem] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full"><ShieldCheck size={12} className="text-emerald-500" /> Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav Cluster */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-8 py-4 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === t.id ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                                    <Edit2 size={20} className="text-blue-500" /> Identity Dossier
                                </h3>
                                <button onClick={() => { if(!editing) fetchDropdowns(); setEditing(!editing); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all">
                                    {editing ? <X size={20} /> : <Settings size={20} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                                    <input disabled={!editing} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black disabled:opacity-60" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Contact</label>
                                    <input disabled={!editing} value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black disabled:opacity-60" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Node</label>
                                    <select disabled={!editing} value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black disabled:opacity-60">
                                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Biological Clock Origin</label>
                                    <input type="date" disabled={!editing} value={profileForm.dob} onChange={e => setProfileForm({...profileForm, dob: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black disabled:opacity-60" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Background Protocol (Bio)</label>
                                    <textarea disabled={!editing} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold min-h-[120px] resize-none disabled:opacity-60" />
                                </div>
                                {editing && (
                                    <button onClick={handleProfileSave} className="md:col-span-2 py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                                        Commit Protocol Sync <Send size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Saved Papers Preview */}
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] italic">Knowledge Vault</h4>
                                    <button onClick={() => setActiveTab('saved')} className="text-[0.55rem] font-black text-blue-500 uppercase tracking-widest hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {savedPapers.slice(0, 3).map(p => (
                                        <div key={p._id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-[28px] border border-slate-100 dark:border-slate-800 flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/research')}>
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                                                <BookmarkCheck size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[0.7rem] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-tight">{p.title}</p>
                                                <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">{p.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {savedPapers.length === 0 && <p className="text-[0.65rem] font-bold text-slate-400 italic text-center py-4">"No bookmarked nodes detected."</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'add-item' || activeTab === 'add-event') && (
                    <div className="animate-in slide-in-from-bottom-10 duration-700 w-full space-y-10 text-left mb-20">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setActiveTab('profile')} className="p-4 rounded-[28px] bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-500 border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
                                <ChevronLeft size={24} />
                            </button>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                {activeTab === 'add-event' ? 'Summit Deployment' : 'Manuscript Onboarding'}
                            </h2>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[56px] p-16 shadow-2xl border border-slate-100 dark:border-slate-800">
                            {activeTab === 'add-event' ? (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Event Directive (Title)</label>
                                            <input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="Global Oncology Summit" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Category Registry</label>
                                            <select value={eventForm.category} onChange={e => setEventForm({...eventForm, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black">
                                                <option value="Medical Summit">Medical Summit</option>
                                                <option value="Workshop">Clinical Workshop</option>
                                                <option value="Research Panel">Research Panel</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Activation Phase</label>
                                            <input type="date" value={eventForm.startDate} onChange={e => setEventForm({...eventForm, startDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Termination Phase</label>
                                            <input type="date" value={eventForm.endDate} onChange={e => setEventForm({...eventForm, endDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Summary</label>
                                        <textarea rows={5} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] text-sm font-bold resize-none italic" placeholder="Summarize discovery objectives..." />
                                    </div>
                                    <button onClick={submitEvent} className="w-full py-8 bg-slate-900 border-b-8 border-slate-700 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-emerald-600 hover:border-emerald-800 active:translate-y-1 transition-all flex items-center justify-center gap-4">
                                        Verify & Deploy Summit Cluster <Globe size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Manuscript Title</label>
                                            <input value={paperForm.title} onChange={e => setPaperForm({...paperForm, title: e.target.value})} placeholder="Structural Analysis of Neural Pathways" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 transition-all font-black uppercase italic" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Scientific Vertical (Category)</label>
                                            <input value={paperForm.category} onChange={e => setPaperForm({...paperForm, category: e.target.value})} placeholder="e.g. Neurology, Genomics" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 transition-all font-black uppercase italic" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] font-black text-blue-500 uppercase tracking-widest ml-1">Archive Department</label>
                                            <select value={paperForm.departmentId} onChange={e => setPaperForm({...paperForm, departmentId: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 transition-all font-black">
                                                <option value="">Select Department</option>
                                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.65rem] font-black text-blue-500 uppercase tracking-widest ml-1">Specialized Node (Sub-Dept)</label>
                                            <select value={paperForm.subDeptId} onChange={e => setPaperForm({...paperForm, subDeptId: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 transition-all font-black" disabled={!paperForm.departmentId}>
                                                <option value="">Select Specialty</option>
                                                {subDepartments.filter(s => s.departmentId?.[0]?._id === paperForm.departmentId || s.departmentId === paperForm.departmentId).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Archival Synopsis (Abstract)</label>
                                        <textarea rows={6} value={paperForm.abstract} onChange={e => setPaperForm({...paperForm, abstract: e.target.value})} className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] text-sm font-bold resize-none italic" placeholder="Detailed methodology and finding summary..." />
                                    </div>
                                    <div className="p-12 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px] text-center space-y-6 group hover:border-blue-50 transition-colors">
                                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[28px] flex items-center justify-center mx-auto text-blue-500 group-hover:scale-110 transition-transform"><Plus size={32} /></div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Attach Digital Artifact</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic opacity-60">Verified Manuscript Bound for Archival</p>
                                        </div>
                                        <label className="inline-block px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[0.65rem] uppercase tracking-widest cursor-pointer shadow-lg active:scale-95 transition-all">SELECT PDF MANUSCRIPT</label>
                                    </div>
                                    <button onClick={submitManuscript} className="w-full py-8 bg-blue-600 border-b-8 border-blue-800 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-blue-500 active:translate-y-1 transition-all flex items-center justify-center gap-4">
                                        Commit to Global Library Node <Send size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm text-left">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-10">Session Journal</h3>
                        <div className="space-y-4">
                            {appointments.map(a => (
                                <div key={a._id} className="group p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-500 shadow-inner">
                                            <CalendarCheck size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[0.6rem] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Clinical Node</p>
                                            <p className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{role === 'doctor' ? a.patientId?.name : a.doctorId?.name}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">{new Date(a.date).toDateString()} • {a.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-5 py-2 rounded-full text-[0.6rem] font-black uppercase tracking-widest ${a.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                                            {a.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {appointments.length === 0 && <div className="text-center py-20 text-slate-400 italic font-bold opacity-60">"Zero clinical encounters logged in this node."</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'manuscripts' && (
                    <div className="space-y-8 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myManuscripts.map(p => (
                                <div key={p._id} className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[48px]"></div>
                                    <p className="text-[0.55rem] font-black text-blue-500 uppercase tracking-widest mb-4">{p.category}</p>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight line-clamp-2 h-14 mb-6 italic">{p.title}</h4>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                                        <span className={`px-4 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-widest ${p.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {p.status}
                                        </span>
                                        <div className="flex items-center gap-3 text-slate-400 text-[0.6rem] font-black">
                                            <span className="flex items-center gap-1"><Heart size={12} fill="currentColor" className="text-rose-400" /> {p.likesCount || 0}</span>
                                            <Eye size={16} className="group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {myManuscripts.length === 0 && <div className="md:col-span-3 text-center py-20 text-slate-400 italic font-bold">"Archive currently void of personal manuscripts."</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="space-y-8 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myEvents.map(e => (
                                <div key={e._id} className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[48px]"></div>
                                    <p className="text-[0.55rem] font-black text-emerald-500 uppercase tracking-widest mb-4">{e.category}</p>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight line-clamp-2 h-14 mb-6 italic">{e.title}</h4>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-[0.55rem] font-black text-slate-400 uppercase">Commences</span>
                                            <span className="text-[0.7rem] font-black text-slate-900 dark:text-white uppercase">{new Date(e.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-widest border ${e.status === 'Upcoming' ? 'border-blue-500 text-blue-500' : 'border-slate-200 text-slate-400'}`}>
                                            {e.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {myEvents.length === 0 && <div className="md:col-span-3 text-center py-20 text-slate-400 italic font-bold">"Node registry currently void of hosted summits."</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'availability' && (
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm text-left">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Clinical Slots Portfolio</h3>
                            <button onClick={() => { setSelectedSlot(null); setAvailForm({ date: '', startTime: '', endTime: '', maxSlots: slots_per_hour?.[0] || 10 }); setShowAddModal(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[0.65rem] uppercase tracking-widest flex items-center gap-2">
                                <Plus size={16} /> New Slot Window
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myAvailability.map(slot => (
                                <div key={slot._id} className="p-8 bg-slate-50 dark:bg-slate-800/80 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-[40px]"></div>
                                     <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[0.55rem] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">Clinical Slot</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setSelectedSlot(slot); setAvailForm({ date: slot.date.split('T')[0], startTime: slot.startTime, endTime: slot.endTime, maxSlots: slot.maxSlots }); setShowAddModal(true); }} className="p-3 bg-white dark:bg-slate-900 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit2 size={14} /></button>
                                                <button onClick={async () => {
                                                    if (window.confirm("Terminate this availability node?")) {
                                                        try {
                                                            await axios.delete(`${BASE_URL}/availability/${slot._id}`);
                                                            toast.success("Temporal Slot Revoked");
                                                            fetchData();
                                                        } catch { toast.error("Revocation failed"); }
                                                    }
                                                }} className="p-3 bg-white dark:bg-slate-900 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                                            <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{slot.startTime} — {slot.endTime}</p>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${slot.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                <span className="text-[0.55rem] font-black text-slate-400 uppercase">{slot.isActive ? 'Active' : 'Offline'}</span>
                                            </div>
                                            <span className="text-[0.55rem] font-black text-slate-900 dark:text-white uppercase">{slot.maxSlots} Nodes</span>
                                        </div>
                                     </div>
                                </div>
                            ))}
                            {myAvailability.length === 0 && (
                                <div className="md:col-span-3 text-center py-24 bg-slate-50 dark:bg-slate-800/30 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-800/50">
                                    <Clock size={64} className="mx-auto text-slate-200 mb-6 group-hover:scale-110 transition-transform" />
                                    <h5 className="text-xl font-black text-slate-400 uppercase tracking-tighter italic">Zero Temporal Nodes Detected</h5>
                                    <p className="text-[0.65rem] font-bold text-slate-300 uppercase tracking-widest mt-2 italic">Deploy availability using the tool above</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        {savedPapers.map(p => (
                            <div key={p._id} className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/research')}>
                                <FileText className="text-blue-500 mb-4" size={32} />
                                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic line-clamp-2 h-14 mb-4">{p.title}</h4>
                                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Archival Paper • {p.category}</p>
                            </div>
                        ))}
                        {savedPapers.length === 0 && <div className="md:col-span-3 text-center py-20 text-slate-400 italic font-bold">"Knowledge vault currently void of bookmarked manuscripts."</div>}
                    </div>
                )}
            </div>

            {/* Dynamic Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[64px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                                {role === 'hospital' ? 'Host New Summit' : role === 'doctor' && activeTab === 'availability' ? 'Clinical Schedule Deployment' : 'Publish Manuscript'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-3 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
                        </div>
                        <div className="p-12 overflow-y-auto space-y-8 text-left no-scrollbar">
                            {role === 'hospital' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Event Directive (Title)</label>
                                        <input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="e.g., Global Oncology Summit" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Activation Date</label>
                                            <input type="date" value={eventForm.startDate} onChange={e => setEventForm({...eventForm, startDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Termination Date</label>
                                            <input type="date" value={eventForm.endDate} onChange={e => setEventForm({...eventForm, endDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Summary</label>
                                        <textarea rows={4} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold resize-none" />
                                    </div>
                                    <button onClick={submitEvent} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-4">
                                        Broadcast Summit Node <Globe size={20} />
                                    </button>
                                </>
                            ) : role === 'doctor' && activeTab === 'availability' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                                        <input type="date" value={availForm.date} onChange={e => setAvailForm({...availForm, date: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Start Phase (Time)</label>
                                            <input type="time" value={availForm.startTime} onChange={e => setAvailForm({...availForm, startTime: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">End Phase (Time)</label>
                                            <input type="time" value={availForm.endTime} onChange={e => setAvailForm({...availForm, endTime: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black" />
                                        </div>
                                    </div>
                                    <button onClick={async () => {
                                        try {
                                            const tid = toast.loading(selectedSlot ? "Updating temporal slot..." : "Deploying temporal slots...");
                                            if (selectedSlot) {
                                                await axios.put(`${BASE_URL}/availability/${selectedSlot._id}`, { ...availForm, doctorId: user._id });
                                            } else {
                                                await axios.post(`${BASE_URL}/availability`, { ...availForm, doctorId: user._id });
                                            }
                                            toast.success(selectedSlot ? "Schedule Updated" : "Schedule Synchronized", { id: tid });
                                            setShowAddModal(false);
                                            fetchData();
                                        } catch { toast.error("Deployment failed"); }
                                    }} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4">
                                        {selectedSlot ? 'COMMIT UPDATE' : 'DEPLOY SCHEDULE'} <Plus size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Manuscript Title</label>
                                        <input value={paperForm.title} onChange={e => setPaperForm({...paperForm, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Knowledge Vertical (Category)</label>
                                        <select value={paperForm.category} onChange={e => setPaperForm({...paperForm, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black">
                                            <option value="">Select Vertical</option><option value="Cardiology">Cardiology</option><option value="Neurology">Neurology</option><option value="Genomics">Genomics</option><option value="Oncology">Oncology</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Scientific Synopsis (Abstract)</label>
                                        <textarea rows={4} value={paperForm.abstract} onChange={e => setPaperForm({...paperForm, abstract: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold resize-none" />
                                    </div>
                                    <button onClick={submitManuscript} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4">
                                        Commit to Digital Library <FileText size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleDashboard;
