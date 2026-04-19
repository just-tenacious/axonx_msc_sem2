import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUser } from '../../utils/api';
import { User, Mail, Shield, Calendar, Edit2, Check, X, Sparkles, Heart, Baby, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AVATARS = [
    '/male1.jpg',
    '/male2.jpg',
    '/female1.jpg',
    '/female2.jpg',
    '/user.jpg'
];

const Profile = () => {
    const { user: authUser, updateProfileSync } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    const userId = authUser?._id; 

    // Filter avatars - only show logo choice for Admin
    const availableAvatars = user?.role === 'admin' 
        ? [...AVATARS, '/light-mode.png'] 
        : AVATARS;

    useEffect(() => {
        if (userId) {
            fetchProfile();
        } else {
            setError("Session missing.");
            setLoading(false);
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile(userId);
            const realData = response.data.data;
            setUser(realData);
            setEditForm(realData); 
            setLoading(false);
        } catch (err) {
            setError("Failed to load profile.");
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await updateUser(userId, editForm);
            if (res.data.success) {
                const updatedFields = { ...editForm, _id: userId };
                setUser(updatedFields);
                updateProfileSync(updatedFields); // Sync globally to topbar
                setIsEditing(false);
                toast.success("Identity synchronized across system", { icon: '🔄' });
            }
        } catch (err) {
            toast.error("Cloud synchronization failed.");
        }
    };

    const selectAvatar = (url) => {
        setEditForm({...editForm, avatar: url});
        setShowAvatarPicker(false);
        toast.success("New visual synced");
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0ea5e9]"></div></div>;
    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="pro-card overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#0ea5e9] relative">
                    <div className="absolute -bottom-16 left-12">
                        <div className="relative p-1 bg-white dark:bg-[#0b1121] rounded-[32px] shadow-2xl">
                            <div className="w-32 h-32 rounded-[28px] overflow-hidden bg-[#f1f5f9] dark:bg-[#1e293b] border border-[var(--border-color)]">
                                <img 
                                    src={editForm.avatar || user.avatar || '/user.jpg'} 
                                    alt="Profile Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button 
                                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                className="absolute bottom-2 right-2 p-2.5 bg-[#0ea5e9] text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-white z-20"
                            >
                                <Sparkles size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`px-12 pb-12 ${showAvatarPicker ? 'mt-40' : 'mt-20'}`}>
                    {showAvatarPicker && (
                        <div className="mb-10 p-6 bg-[var(--bg-color)] rounded-3xl border border-[var(--border-color)] animate-in slide-in-from-top-4">
                            <p className="text-[0.6rem] font-black uppercase text-[var(--text-muted)] tracking-widest mb-6 text-center">Select your official visual identity</p>
                            <div className="grid grid-cols-6 gap-4">
                                {availableAvatars.map((url, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => selectAvatar(url)}
                                        className="aspect-square rounded-2xl border-2 border-transparent hover:border-[#0ea5e9] transition-all overflow-hidden p-1 bg-white shadow-sm"
                                    >
                                        <img src={url} alt="Option" className="w-full h-full object-cover rounded-xl" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[var(--border-color-light)]">
                        <div>
                            <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tight">{user.name}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className={`pro-badge !rounded-full !py-1 badge-role-${user.role}`}>{user.role}</span>
                                <span className="text-[0.6rem] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Identity Secure
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${isEditing ? 'bg-[var(--hover-bg)] text-[var(--text-main)] shadow-inner' : 'bg-[#0ea5e9] text-white shadow-xl shadow-blue-500/20 hover:scale-105'}`}
                            >
                                {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Account Markers</h4>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color-light)]">
                                    <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase mb-1">System Username</p>
                                    {isEditing ? (
                                        <input className="pro-input !p-0 !bg-transparent text-sm w-full outline-none" value={editForm.username || ''} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
                                    ) : (
                                        <p className="font-bold text-[var(--text-main)]">{user.username}</p>
                                    )}
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color-light)]">
                                    <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase mb-1">Primary Email</p>
                                    {isEditing ? (
                                        <input className="pro-input !p-0 !bg-transparent text-sm w-full outline-none" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                                    ) : (
                                        <p className="font-bold text-[var(--text-main)] italic">{user.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Bio Context</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color-light)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Heart size={12} className="text-red-400" />
                                        <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase">Gender</p>
                                    </div>
                                    {isEditing ? (
                                        <select className="pro-input !p-0 !bg-transparent text-sm w-full outline-none" value={editForm.gender || ''} onChange={(e) => setEditForm({...editForm, gender: e.target.value})}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <p className="font-bold text-[var(--text-main)]">{user.gender || 'Not Specified'}</p>
                                    )}
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color-light)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Baby size={12} className="text-amber-400" />
                                        <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase">Age</p>
                                    </div>
                                    {isEditing ? (
                                        <input type="date" className="pro-input !p-0 !bg-transparent text-sm w-full outline-none" value={editForm.dob?.split('T')[0] || ''} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} />
                                    ) : (
                                        <p className="font-bold text-[var(--text-main)]">{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color-light)]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={12} className="text-blue-500" />
                                    <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase">Security</p>
                                </div>
                                <p className="font-bold text-[var(--text-main)] uppercase tracking-tighter text-[0.6rem]">Active Account Status</p>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex justify-end">
                            <button 
                                onClick={handleSave}
                                className="px-12 py-3.5 bg-[#0ea5e9] text-white font-black rounded-3xl hover:bg-[#0284c7] shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
                            >
                                <Check size={22} /> Commit Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
