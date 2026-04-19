import React, { useState, useEffect } from 'react';
import { 
    Users as UsersIcon, GraduationCap, BookOpenText, Heart, Activity, 
    Building2, ChevronRight, ArrowLeft, Plus,
    Eye, ShieldAlert, Filter, Download as DownloadIcon, Check, X, 
    ChevronLeft, User, Mail, Lock, CheckCircle, Search, Edit2, Calendar
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Users = () => {
    const [viewMode, setViewMode] = useState('grid'); 
    const [selectedRole, setSelectedRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ all: 0, student: 0, academic: 0, patient: 0, doctor: 0, hospital: 0 });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [statusFilter, setStatusFilter] = useState({ id: 'all', name: 'ALL STATUS', icon: Filter });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', username: '', email: '', password: '', 
        confirmPassword: '', role: 'patient', gender: '', dob: ''
    });
    const [editForm, setEditForm] = useState({
        name: '', username: '', email: '', gender: '', dob: '', role: 'patient'
    });

    const roleCards = [
        { id: 'all',      name: 'ALL USERS',   icon: UsersIcon,   color: 'text-blue-500',   bg: 'bg-blue-50' },
        { id: 'student',  name: 'STUDENTS',    icon: GraduationCap, color: 'text-sky-500',  bg: 'bg-sky-50' },
        { id: 'academic', name: 'RESEARCHERS', icon: BookOpenText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 'patient',  name: 'PATIENTS',    icon: Heart,        color: 'text-emerald-500',bg: 'bg-emerald-50' },
        { id: 'doctor',   name: 'DOCTORS',     icon: Activity,     color: 'text-blue-600',   bg: 'bg-blue-100/30' },
        { id: 'hospital', name: 'HOSPITALS',   icon: Building2,    color: 'text-cyan-500',   bg: 'bg-cyan-50' },
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
            const response = await axios.get('http://localhost:5000/api/users');
            const allData = response.data.data.filter(u => u.role !== 'admin');
            setUsers(allData);
            setCounts({
                all: allData.length,
                student: allData.filter(u => u.role === 'student').length,
                academic: allData.filter(u => u.role === 'researcher' || u.role === 'academic').length,
                patient: allData.filter(u => u.role === 'patient').length,
                doctor: allData.filter(u => u.role === 'doctor').length,
                hospital: allData.filter(u => u.role === 'hospital').length
            });
            // refresh list view in-place
            if (selectedRole) {
                const list = selectedRole === 'all'
                    ? allData
                    : allData.filter(u => u.role === selectedRole || (selectedRole === 'academic' && (u.role === 'researcher' || u.role === 'academic')));
                setFilteredUsers(list);
            }
            setLoading(false);
        } catch {
            toast.error("Failed to load users");
            setLoading(false);
        }
    };

    const handleRoleClick = (role) => {
        setSelectedRole(role);
        setViewMode('list');
        setCurrentPage(1);
        setSearchTerm('');
        setStatusFilter({ id: 'all', name: 'ALL STATUS', icon: Filter });
        const list = role === 'all'
            ? users
            : users.filter(u => u.role === role || (role === 'academic' && (u.role === 'researcher' || u.role === 'academic')));
        setFilteredUsers(list);
        setFormData(f => ({ ...f, role: role === 'all' ? 'patient' : role }));
    };

    const handleToggleStatus = async (user) => {
        try {
            const next = !user.isActive;
            await axios.put(`http://localhost:5000/api/users/${user._id}`, { isActive: next });
            toast.success(next ? "Access restored" : "Access blocked");
            if (showDetailModal) setShowDetailModal(false);
            fetchUsers();
        } catch {
            toast.error("Update failed");
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }
        try {
            const loader = toast.loading("Adding user...");
            await axios.post('http://localhost:5000/api/users/register', formData);
            toast.success("User added successfully", { id: loader });
            setShowAddModal(false);
            setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '', role: selectedRole === 'all' || !selectedRole ? 'patient' : selectedRole, gender: '', dob: '' });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Creation failed");
        }
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setEditForm({
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            gender: user.gender || '',
            dob: user.dob ? user.dob.substring(0, 10) : '',
            role: user.role || 'patient'
        });
        setShowEditModal(true);
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const loader = toast.loading("Updating user…");
            await axios.put(`http://localhost:5000/api/users/${currentUser._id}`, editForm);
            toast.success("User updated!", { id: loader });
            setShowEditModal(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Update failed");
        }
    };

    const exportToExcel = () => {
        const h = ["Sr No","Name","Username","Email","Role","Gender","Status"];
        const r = users.map((u,i) => [i+1, u.name, u.username, u.email, u.role, u.gender, u.isActive ? 'Active' : 'Blocked']);
        const csv = "data:text/csv;charset=utf-8," + h.join(",") + "\n" + r.map(e => e.join(",")).join("\n");
        const a = document.createElement("a");
        a.setAttribute("href", encodeURI(csv));
        a.setAttribute("download", "AxonX_Users.csv");
        a.click();
    };

    // ── derived list state ──────────────────────────────────────────────────────
    const displayedUsers = filteredUsers.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter.id === 'all' || (statusFilter.id === 'active' ? u.isActive : !u.isActive);
        return matchSearch && matchStatus;
    });
    const totalPages   = Math.ceil(displayedUsers.length / itemsPerPage);
    const paginatedUsers = displayedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const roleBadge = (role) => {
        const isResearch = role === 'academic' || role === 'researcher';
        return (
            <span className={`pro-badge !text-[0.6rem] !py-1 !px-3 font-black badge-role-${isResearch ? 'academic' : role}`}>
                {isResearch ? 'RESEARCHER' : role.toUpperCase()}
            </span>
        );
    };

    // ── shared modals (always in DOM) ───────────────────────────────────────────
    const Modals = (
        <>
            {/* EDIT USER MODAL */}
            {showEditModal && currentUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
                    <div className="pro-card w-full max-w-2xl p-10 shadow-2xl overflow-y-auto max-h-[90vh] bg-white dark:bg-[#1e293b] animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)]">Edit User</h2>
                                <p className="text-[0.62rem] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{currentUser.email}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-all"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleEditUser} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                        <input required type="text" placeholder="Full Name" className="pro-input w-full pl-12 h-13" value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                        <input required type="text" placeholder="username" className="pro-input w-full pl-12 h-13" value={editForm.username} onChange={e => setEditForm(f => ({...f, username: e.target.value}))} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                    <input required type="email" placeholder="email@axonx.com" className="pro-input w-full pl-12 h-13" value={editForm.email} onChange={e => setEditForm(f => ({...f, email: e.target.value}))} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Gender</label>
                                    <select className="pro-input w-full h-13 pl-4" value={editForm.gender} onChange={e => setEditForm(f => ({...f, gender: e.target.value}))}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Date of Birth</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={16} />
                                        <input type="date" className="pro-input w-full h-13 pl-11" value={editForm.dob} onChange={e => setEditForm(f => ({...f, dob: e.target.value}))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Role</label>
                                    <select className="pro-input w-full h-13 pl-4" value={editForm.role} onChange={e => setEditForm(f => ({...f, role: e.target.value}))}>
                                        <option value="patient">Patient</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="hospital">Hospital</option>
                                        <option value="student">Student</option>
                                        <option value="researcher">Researcher</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-black rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD USER MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
                    <div className="pro-card w-full max-w-2xl p-10 shadow-2xl overflow-y-auto max-h-[90vh] bg-white dark:bg-[#1e293b] animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-[var(--text-main)]">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-all"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                        <input required type="text" placeholder="Full Name" className="pro-input w-full pl-12 h-13" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                        <input required type="text" placeholder="Username" className="pro-input w-full pl-12 h-13" value={formData.username} onChange={e => setFormData(f => ({...f, username: e.target.value}))} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                    <input required type="email" placeholder="email@axonx.com" className="pro-input w-full pl-12 h-13" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Gender</label>
                                    <select required className="pro-input w-full h-13 pl-4" value={formData.gender} onChange={e => setFormData(f => ({...f, gender: e.target.value}))}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Role</label>
                                    <input disabled className="pro-input w-full h-13 pl-4 bg-gray-50 dark:bg-gray-800 font-bold italic capitalize" value={selectedRole === 'all' || !selectedRole ? 'patient' : selectedRole} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                        <input required type="password" placeholder="Password" className="pro-input w-full pl-12 h-13" value={formData.password} onChange={e => setFormData(f => ({...f, password: e.target.value}))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                                        <input required type="password" placeholder="Confirm Password" className="pro-input w-full pl-12 h-13" value={formData.confirmPassword} onChange={e => setFormData(f => ({...f, confirmPassword: e.target.value}))} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-black rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW USER MODAL */}
            {showDetailModal && currentUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
                    <div className="pro-card w-full max-w-md p-10 bg-white dark:bg-[#1e293b] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-[var(--text-main)]">User Details</h2>
                            <button onClick={() => setShowDetailModal(false)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-all"><X size={20} /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-5 p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                                    <img src={currentUser.avatar || '/user.jpg'} className="w-full h-full object-cover" alt="avatar" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-[var(--text-main)]">{currentUser.name}</p>
                                    <p className="text-sm font-bold text-blue-500 italic">@{currentUser.username}</p>
                                    <div className="mt-2">{roleBadge(currentUser.role)}</div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-3">
                                <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]">
                                    <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-sm font-bold text-[var(--text-main)]">{currentUser.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]">
                                        <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Gender</p>
                                        <p className="text-sm font-bold text-[var(--text-main)]">{currentUser.gender || '—'}</p>
                                    </div>
                                    <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]">
                                        <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Access</p>
                                        <p className={`text-sm font-black ${currentUser.isActive ? 'text-green-500' : 'text-red-500'}`}>{currentUser.isActive ? 'Active' : 'Blocked'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowDetailModal(false)} className="flex-1 py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-black rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Close</button>
                                <button onClick={() => { setShowDetailModal(false); openEditModal(currentUser); }} className="flex-1 py-3.5 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => handleToggleStatus(currentUser)} className={`flex-1 py-3.5 font-black rounded-2xl transition-all active:scale-95 ${currentUser.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                    {currentUser.isActive ? 'Block' : 'Restore'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    // ── GRID VIEW ───────────────────────────────────────────────────────────────
    if (viewMode === 'grid') {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Portal Users</h1>
                        <p className="text-[var(--text-muted)] text-sm font-black italic">Manage system access and roles.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={exportToExcel} className="h-14 px-8 bg-white dark:bg-[#1e293b] border border-[var(--border-color)] text-[var(--text-main)] font-black rounded-2xl text-xs flex items-center gap-2 hover:bg-[var(--hover-bg)] transition-all">
                            <DownloadIcon size={18} /> Export
                        </button>
                        <button onClick={() => { setFormData({ name:'', username:'', email:'', password:'', confirmPassword:'', role:'patient', gender:'', dob:'' }); setShowAddModal(true); }} className="h-14 px-10 bg-[#0ea5e9] text-white font-black rounded-2xl text-xs shadow-xl shadow-blue-500/20 flex items-center gap-2 hover:scale-105 transition-all">
                            <Plus size={20} /> Add User
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roleCards.map((card) => (
                        <button key={card.id} onClick={() => handleRoleClick(card.id)} className="group p-8 bg-white dark:bg-[#1e293b]/50 rounded-[40px] border border-transparent shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all text-left">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-widest">{card.name}</p>
                                    <h3 className="text-5xl font-black text-[var(--text-main)] mt-1">{loading ? '…' : counts[card.id]}</h3>
                                </div>
                                <div className={`p-5 rounded-3xl ${card.bg} ${card.color} rotate-3 group-hover:rotate-12 transition-transform`}>
                                    <card.icon size={36} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {Modals}
            </div>
        );
    }

    // ── LIST VIEW ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Breadcrumb bar */}
            <div className="flex items-center justify-between bg-white dark:bg-[#1e293b]/50 p-6 rounded-3xl shadow-sm border border-[var(--border-color-light)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('grid')} className="p-3 rounded-2xl bg-[var(--bg-color)] text-[var(--text-muted)] hover:text-blue-500 transition-all"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-main)] uppercase">{selectedRole} List</h2>
                        <p className="text-[0.6rem] text-[var(--text-muted)] font-black uppercase tracking-widest">Admin / Users / {selectedRole}</p>
                    </div>
                </div>
                <button onClick={() => setShowAddModal(true)} className="px-8 py-4 bg-[#0ea5e9] text-white font-black rounded-2xl text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
                    <Plus size={20} /> Add User
                </button>
            </div>

            {/* Table card */}
            <div className="pro-card p-0 overflow-hidden shadow-2xl">
                {/* Filter bar */}
                <div className="p-6 border-b border-[var(--border-color-light)] flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input type="text" placeholder="Search name or email…" className="pro-input w-full pl-11 h-12" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    {/* Custom status dropdown */}
                    <div className="relative">
                        <button onClick={() => setShowStatusDropdown(p => !p)} className="h-12 px-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-[var(--border-color)] flex items-center gap-3 min-w-[160px] hover:border-blue-500 transition-all">
                            <statusFilter.icon size={16} className={statusFilter.id === 'suspended' ? 'text-red-500' : statusFilter.id === 'active' ? 'text-green-500' : 'text-blue-500'} />
                            <span className="text-[0.65rem] font-black uppercase tracking-widest flex-1 text-left">{statusFilter.name}</span>
                            <ChevronRight size={14} className={`text-[var(--text-muted)] transition-transform ${showStatusDropdown ? 'rotate-90' : ''}`} />
                        </button>
                        {showStatusDropdown && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setShowStatusDropdown(false)} />
                                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#1e293b] border border-[var(--border-color)] rounded-2xl shadow-2xl z-[100] overflow-hidden">
                                    {statusOptions.map(opt => (
                                        <button key={opt.id} onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); setCurrentPage(1); }}
                                            className={`w-full flex items-center gap-3 px-5 py-3.5 text-[0.65rem] font-black uppercase tracking-widest transition-all border-b border-[var(--border-color-light)] last:border-0 ${statusFilter.id === opt.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                            <opt.icon size={16} className={opt.color} />
                                            {opt.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafc] dark:bg-[#0f172a]/30 border-b border-[var(--border-color-light)]">
                            <tr>
                                <th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest w-16">Sr No</th>
                                <th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[0.62rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color-light)]">
                            {paginatedUsers.length === 0 && (
                                <tr><td colSpan={4} className="px-8 py-12 text-center text-sm font-bold text-[var(--text-muted)]">No users found</td></tr>
                            )}
                            {paginatedUsers.map((user, index) => (
                                <tr key={user._id} className="hover:bg-blue-50/5 transition-colors">
                                    <td className="px-8 py-5 text-xs font-bold text-[var(--text-muted)] opacity-60">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-blue-50 overflow-hidden border border-blue-100 shadow-sm flex-shrink-0">
                                                <img src={user.avatar || '/user.jpg'} className="w-full h-full object-cover" alt={user.name} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-main)]">{user.name}</p>
                                                <p className="text-[0.65rem] text-[var(--text-muted)] font-bold">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">{roleBadge(user.role)}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setCurrentUser(user); setShowDetailModal(true); }}
                                                className="p-2.5 text-blue-500 bg-blue-50 rounded-xl hover:scale-110 active:scale-95 transition-all"
                                                title="View"
                                            ><Eye size={16} /></button>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2.5 text-indigo-500 bg-indigo-50 rounded-xl hover:scale-110 active:scale-95 transition-all"
                                                title="Edit"
                                            ><Edit2 size={16} /></button>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-all ${user.isActive ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'}`}
                                                title={user.isActive ? 'Block' : 'Unblock'}
                                            >{user.isActive ? <ShieldAlert size={16} /> : <Check size={16} />}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-[var(--border-color-light)] flex items-center justify-between">
                        <p className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-widest">Page {currentPage} / {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-3 rounded-xl border border-[var(--border-color)] disabled:opacity-30 hover:border-blue-500 transition-all"><ChevronLeft size={18}/></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-[var(--border-color)] disabled:opacity-30 hover:border-blue-500 transition-all"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals render in list view too */}
            {Modals}
        </div>
    );
};

export default Users;
