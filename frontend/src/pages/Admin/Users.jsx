import React, { useState, useEffect } from 'react';
import { 
    Users as UsersIcon, GraduationCap, BookOpenText, Heart, Activity, 
    Building2, ChevronRight, ArrowLeft, Plus,
    Eye, ShieldAlert, Filter, Download as DownloadIcon, Check, X, 
    ChevronLeft, User, Mail, Lock, CheckCircle, Search, Edit2, Calendar,
    UserCircle, MapPin, Database, Award, ShieldCheck, Briefcase, Info
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '../../components/Admin/Pagination';

const BASE_URL = 'http://localhost:5000/api/users';

const Users = () => {
    // ── STATE ────────────────────────────────────────────────────────────────
    const [view, setView] = useState('grid'); // grid, list, view-profile, edit-profile
    const [selectedRole, setSelectedRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ all:0, student:0, academic:0, patient:0, doctor:0, hospital:0 });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [statusFilter, setStatusFilter] = useState({ id: 'all', name: 'ALL STATUS', icon: Filter });
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '', username: '', email: '', gender: '', dob: '', role: 'patient'
    });

    const roleCards = [
        { id: 'all',      name: 'Total Users',      desc: 'Overall system capacity', icon: UsersIcon,   color: 'from-blue-500 to-blue-600' },
        { id: 'student',  name: 'Students',         desc: 'Medical learners',        icon: GraduationCap, color: 'from-sky-400 to-sky-500' },
        { id: 'academic', name: 'Researchers',      desc: 'Scientific minds',        icon: BookOpenText, color: 'from-indigo-500 to-indigo-600' },
        { id: 'patient',  name: 'Patients',         desc: 'Healthcare recipients',   icon: Heart,        color: 'from-emerald-400 to-emerald-500' },
        { id: 'doctor',   name: 'Doctors',          desc: 'Clinical experts',        icon: Activity,     color: 'from-blue-600 to-indigo-600' },
        { id: 'hospital', name: 'Hospitals',        desc: 'Medical facilities',      icon: Building2,    color: 'from-cyan-400 to-cyan-600' },
    ];

    const statusOptions = [
        { id: 'all',       name: 'ALL STATUS', icon: Filter,      color: 'text-blue-500' },
        { id: 'active',    name: 'ACTIVE',     icon: CheckCircle, color: 'text-green-500' },
        { id: 'suspended', name: 'BLOCKED',    icon: ShieldAlert, color: 'text-red-500' },
    ];

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(BASE_URL);
            const allData = data.data.filter(u => u.role !== 'admin');
            setUsers(allData);
            setCounts({
                all: allData.length,
                student: allData.filter(u => u.role === 'student').length,
                academic: allData.filter(u => u.role === 'researcher' || u.role === 'academic').length,
                patient: allData.filter(u => u.role === 'patient').length,
                doctor: allData.filter(u => u.role === 'doctor').length,
                hospital: allData.filter(u => u.role === 'hospital').length
            });
            if (selectedRole) syncFiltered(allData, selectedRole);
            setLoading(false);
        } catch {
            toast.error("Failed to load users");
            setLoading(false);
        }
    };

    const syncFiltered = (all, role) => {
        const list = role === 'all'
            ? all
            : all.filter(u => u.role === role || (role === 'academic' && (u.role === 'researcher' || u.role === 'academic')));
        setFilteredUsers(list);
    };

    const handleRoleClick = (role) => {
        setSelectedRole(role);
        setView('list');
        setCurrentPage(1);
        setSearchTerm('');
        setStatusFilter({ id: 'all', name: 'ALL STATUS', icon: Filter });
        syncFiltered(users, role);
    };

    const handleToggleStatus = async (user) => {
        try {
            const next = !user.isActive;
            await axios.put(`${BASE_URL}/${user._id}`, { isActive: next });
            toast.success(next ? "Access restored" : "Access blocked");
            fetchUsers();
        } catch { toast.error("Update failed"); }
    };

    const openViewProfile = (user) => {
        setSelectedUser(user);
        setView('view-profile');
    };

    const openEditProfile = (user) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            gender: user.gender || '',
            dob: user.dob ? user.dob.substring(0, 10) : '',
            role: user.role || 'patient'
        });
        setView('edit-profile');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const loader = toast.loading("Updating…");
            await axios.put(`${BASE_URL}/${selectedUser._id}`, editForm);
            toast.success("Updated successfully", { id: loader });
            setView('list');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Update failed");
        }
    };

    const displayList = filteredUsers.filter(u => {
        const nameMatch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
        return (nameMatch || emailMatch) && (statusFilter.id === 'all' || (statusFilter.id === 'active' ? u.isActive : !u.isActive));
    });

    const totalPages = Math.ceil(displayList.length / itemsPerPage);
    const pagedUsers = displayList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const roleBadge = (role) => {
        const isResearch = role === 'academic' || role === 'researcher';
        const colors = {
            student: 'bg-sky-50 text-sky-600 border-sky-100',
            doctor: 'bg-blue-50 text-blue-600 border-blue-100',
            patient: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            hospital: 'bg-cyan-50 text-cyan-600 border-cyan-100',
            academic: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            researcher: 'bg-indigo-50 text-indigo-600 border-indigo-100'
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg border text-[0.6rem] font-black uppercase tracking-widest ${colors[role] || 'bg-gray-50'}`}>
                {isResearch ? 'Researcher' : role}
            </span>
        );
    };

    /* ── GRID VIEW ─────────────────────────────────────────────────────────── */
    if (view === 'grid') {
        return (
            <div className="space-y-12 animate-in fade-in duration-700">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter">User Management</h1>
                    <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
                    <p className="text-[var(--text-muted)] text-sm font-bold opacity-60 italic">Centralized node for all system participants and access tiers.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {roleCards.map((card) => (
                        <button key={card.id} onClick={() => handleRoleClick(card.id)} className="group relative p-10 bg-white dark:bg-[#1e293b]/50 rounded-[48px] border border-[var(--border-color-light)] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className={`p-6 rounded-3xl bg-slate-50 text-blue-600 w-fit shadow-lg group-hover:rotate-12 transition-transform`}><card.icon size={42} strokeWidth={2} /></div>
                                <div>
                                    <h3 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">{loading ? '…' : counts[card.id]}</h3>
                                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{card.name}</p>
                                    <p className="text-[0.65rem] font-bold text-[var(--text-muted)] opacity-50 italic mt-3">{card.desc}</p>
                                </div>
                                <div className="pt-2 flex items-center text-blue-500 font-black text-[0.65rem] uppercase tracking-tighter group-hover:gap-2 transition-all">Manage List <ChevronRight size={14} /></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ─────────────────────────────────────────────────────────── */
    if (view === 'list') {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between bg-white dark:bg-[#1e293b]/50 p-6 rounded-[32px] shadow-sm border border-[var(--border-color-light)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('grid')} className="p-3 rounded-2xl bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={20} /></button>
                        <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                           <span className="opacity-50">Admin</span><ChevronRight size={12} className="opacity-30" />
                           <button onClick={() => setView('grid')} className="hover:text-blue-500">Users</button><ChevronRight size={12} className="opacity-30" />
                           <span className="text-blue-500 bg-blue-50 px-3 py-1 rounded-xl">{selectedRole}</span>
                        </nav>
                    </div>
                </div>
                <div className="pro-card p-0 overflow-hidden shadow-2xl border-0">
                    <div className="p-6 border-b border-[var(--border-color-light)] flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} /><input type="text" placeholder="Search by name or email…" className="pro-input w-full pl-11 h-12" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} /></div>
                        <div className="flex bg-[var(--bg-color)] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
                            {[{id: 'all', label: 'All'}, {id: 'active', label: 'Active'}, {id: 'suspended', label: 'Blocked'}].map(s => (
                                <button key={s.id} onClick={() => { setStatusFilter({ id: s.id }); setCurrentPage(1); }} className={`px-4 py-2 text-[0.6rem] font-black uppercase rounded-xl transition-all whitespace-nowrap ${statusFilter.id === s.id ? 'bg-white text-blue-500 shadow-sm' : 'text-[var(--text-muted)]'}`}>{s.label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-[#f8fafc] border-b border-[var(--border-color-light)]"><tr><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest w-20 text-center">SR NO</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Profile</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Role</th><th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-[var(--border-color-light)]">
                                {pagedUsers.length === 0 ? (<tr><td colSpan={4} className="px-8 py-20 text-center text-xs font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">No users found</td></tr>) : 
                                pagedUsers.map((user, index) => (
                                    <tr key={user._id} className="hover:bg-blue-50/10 transition-colors group">
                                        <td className="px-8 py-6 text-xs font-bold text-[var(--text-muted)] opacity-40 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-8 py-6"><div className="flex items-center gap-5"><div className="w-11 h-11 rounded-2xl bg-blue-50 overflow-hidden border-2 border-white shadow-sm flex-shrink-0"><img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-full h-full object-cover" alt="avatar" /></div><div><p className="text-sm font-black text-[var(--text-main)] tracking-tight">{user.name}</p><p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase tracking-wider italic">@{user.username} • {user.email}</p></div></div></td>
                                        <td className="px-8 py-6">{roleBadge(user.role)}</td>
                                        <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2.5">
                                            <button onClick={() => openViewProfile(user)} className="p-3 text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm" title="View Detail"><Eye size={16} /></button>
                                            <button onClick={() => openEditProfile(user)} className="p-3 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm" title="Update"><Edit2 size={16} /></button>
                                            <button onClick={() => handleToggleStatus(user)} className={`p-3 rounded-xl transition-all shadow-sm ${user.isActive ? 'text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white' : 'text-green-500 bg-green-50 hover:bg-green-500 hover:text-white'}`}>{user.isActive ? <ShieldAlert size={16} /> : <Check size={16} />}</button>
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
                                totalItems={displayList.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── VIEW PROFILE VIEW ─────────────────────────────────────────────────── */
    if (view === 'view-profile' && selectedUser) {
        const u = selectedUser;
        return (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 max-w-5xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-4 rounded-[28px] bg-white border border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-500 transition-all shadow-sm"><ArrowLeft size={24} /></button>
                    <nav className="flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <button onClick={() => setView('grid')}>Users</button><ChevronRight size={12} className="opacity-30" /><button onClick={() => setView('list')}>{selectedRole}</button><ChevronRight size={12} className="opacity-30" /><span className="text-blue-500 italic">User Detail</span>
                    </nav>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="pro-card p-0 overflow-hidden text-center bg-white border shadow-xl rounded-[40px]">
                            <div className={`h-32 bg-gradient-to-r ${u.isActive ? 'from-blue-600 to-indigo-700' : 'from-rose-500 to-rose-700'} relative flex items-center justify-center`}>
                               <span className="px-4 py-1 rounded-full text-[0.55rem] font-black tracking-widest uppercase bg-white/20 text-white italic">{u.isActive ? 'Active User' : 'Suspended'}</span>
                            </div>
                            <div className="px-8 pb-10 -mt-16 relative z-10">
                                <div className="w-32 h-32 mx-auto rounded-[42px] border-4 border-white shadow-2xl overflow-hidden bg-white mb-6">
                                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-full h-full object-cover" alt="avatar" />
                                </div>
                                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter">{u.name}</h2>
                                <p className="text-[0.65rem] font-black text-blue-500 uppercase tracking-widest mt-1">@{u.username}</p>
                                <div className="mt-8 flex justify-center">{roleBadge(u.role)}</div>
                            </div>
                        </div>
                        {/* Status Card Fix for Light Mode */}
                        <div className="p-10 bg-slate-100 dark:bg-slate-800 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-700 text-blue-600 shadow-sm"><ShieldCheck size={28} /></div>
                            <div>
                                <h4 className="text-[0.7rem] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1.5">Account Status</h4>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                    This account is fully verified. Registered on {new Date(u.createdAt).toLocaleDateString()} within the AxonX network.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="pro-card p-12 bg-white shadow-xl border rounded-[48px]">
                            <h4 className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-12 flex items-center gap-3"><Info size={18} className="text-blue-500" /> Identity Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans text-left">
                                <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Email Address</p><p className="text-sm font-black text-blue-600 underline underline-offset-4 decoration-blue-100 italic">{u.email}</p></div>
                                <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">System Node</p><p className="text-sm font-black text-slate-700">Maharashtra, India (IN)</p></div>
                                <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Biological Info</p><p className="text-sm font-black text-slate-700 capitalize">{u.gender || 'Not Disclosed'} <span className="mx-2 opacity-30">•</span> {u.dob ? new Date(u.dob).toLocaleDateString() : 'N/A'}</p></div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => openEditProfile(u)} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[28px] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest">Update</button>
                           <button onClick={() => handleToggleStatus(u)} className={`flex-1 py-5 font-black rounded-[28px] transition-all text-xs border-2 shadow-sm uppercase tracking-widest ${u.isActive ? 'border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white' : 'border-green-100 text-green-500 hover:bg-green-500 hover:text-white'}`}>
                               {u.isActive ? 'Block' : 'Restore'}
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── EDIT PROFILE VIEW ─────────────────────────────────────────────────── */
    if (view === 'edit-profile' && selectedUser) {
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <div className="flex items-center gap-4"><button onClick={() => setView('view-profile')} className="p-4 rounded-[28px] bg-white border border-[var(--border-color)] shadow-sm"><X size={24} /></button></div>
                <div className="pro-card p-12 bg-white shadow-2xl border-0 rounded-[48px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-bl-[160px] -mr-32 -mt-32"></div>
                    <div className="mb-12 relative z-10"><h2 className="text-4xl font-black text-slate-800 tracking-tighter">Update Profile of {selectedUser.name}</h2><div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full"></div></div>
                    <form onSubmit={handleEditSubmit} className="space-y-10 relative z-10 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-2"><label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label><input required type="text" className="pro-input w-full px-6 h-16 rounded-[24px] font-bold" value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} /></div>
                             <div className="space-y-2"><label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label><input required type="text" className="pro-input w-full px-6 h-16 rounded-[24px] font-bold" value={editForm.username} onChange={e => setEditForm(f => ({...f, username: e.target.value}))} /></div>
                             <div className="space-y-2 md:col-span-2"><label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label><input required type="email" className="pro-input w-full px-6 h-16 rounded-[24px] font-bold" value={editForm.email} onChange={e => setEditForm(f => ({...f, email: e.target.value}))} /></div>
                             <div className="space-y-2"><label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label><select className="pro-input w-full h-16 px-6 font-bold rounded-[24px]" value={editForm.gender} onChange={e => setEditForm(f => ({...f, gender: e.target.value}))}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                             <div className="space-y-2"><label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label><select className="pro-input w-full h-16 px-6 font-bold rounded-[24px] bg-slate-50 italic" value={editForm.role} onChange={e => setEditForm(f => ({...f, role: e.target.value}))}><option value="patient">Patient</option><option value="doctor">Doctor</option><option value="hospital">Hospital</option><option value="student">Student</option><option value="researcher">Researcher</option></select></div>
                        </div>
                        <div className="pt-8 flex gap-6 text-center"><button type="button" onClick={() => setView('view-profile')} className="flex-1 py-5 border-2 text-slate-400 font-extrabold rounded-[28px] hover:bg-slate-50 transition-all uppercase text-[0.7rem] tracking-widest">Cancel</button><button type="submit" className="flex-1 py-5 bg-emerald-500 text-white font-extrabold rounded-[28px] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all uppercase text-[0.7rem] tracking-widest">Update</button></div>
                    </form>
                </div>
            </div>
        );
    }
    return null;
};

export default Users;
