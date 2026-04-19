import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Send, User, Clock, ShieldCheck, 
    Search, ChevronRight, ArrowLeft, Eye,
    ShieldAlert, RefreshCw, X, 
    Activity, MessageCircle, Users, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE = 'http://localhost:5000/api';

const roleColors = {
    admin:      { bg: 'bg-purple-100', text: 'text-purple-700' },
    doctor:     { bg: 'bg-blue-100',   text: 'text-blue-700' },
    patient:    { bg: 'bg-emerald-100',text: 'text-emerald-700' },
    student:    { bg: 'bg-amber-100',  text: 'text-amber-700' },
    researcher: { bg: 'bg-rose-100',   text: 'text-rose-700' },
    hospital:   { bg: 'bg-indigo-100', text: 'text-indigo-700' },
};

const Avatar = ({ user, size = 10 }) => {
    const rc = roleColors[user?.role] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return (
        <div className={`w-${size} h-${size} rounded-2xl ${rc.bg} ${rc.text} flex items-center justify-center font-black text-sm shrink-0 border border-white shadow-sm`}>
            {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
                (user?.name || 'U')[0].toUpperCase()
            )}
        </div>
    );
};

const UserPickerDropdown = ({ label, value, onSelect, users, exclude }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = users.filter(u =>
        u._id !== exclude &&
        (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen(o => !o)}
                className="w-full pro-input h-14 px-5 rounded-2xl font-bold flex items-center justify-between gap-3 text-left">
                {value ? (
                    <div className="flex items-center gap-3">
                        <Avatar user={value} size={8} />
                        <div>
                            <p className="text-sm font-black text-slate-700 leading-tight">{value.name}</p>
                            <p className="text-[0.6rem] uppercase tracking-widest font-bold text-slate-400">{value.role}</p>
                        </div>
                    </div>
                ) : (
                    <span className="text-slate-400 font-bold text-sm">{label}</span>
                )}
                <ChevronDown size={16} className="text-slate-400 shrink-0" />
            </button>
            {open && (
                <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                autoFocus
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search users…"
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                        {filtered.length === 0 && <p className="p-4 text-center text-xs text-slate-400">No users found</p>}
                        {filtered.map(u => {
                            const rc = roleColors[u.role] || { bg: 'bg-slate-100', text: 'text-slate-600' };
                            return (
                                <button key={u._id} onClick={() => { onSelect(u); setOpen(false); setSearch(''); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors text-left">
                                    <Avatar user={u} size={9} />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                        <p className="text-[0.6rem] text-slate-400 uppercase tracking-widest">{u.role} • {u.email}</p>
                                    </div>
                                    <span className={`ml-auto px-2 py-0.5 rounded-lg text-[0.55rem] font-black uppercase ${rc.bg} ${rc.text}`}>{u.role}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const Chats = () => {
    const [view, setView] = useState('picker'); // picker, conversation, allChats
    const [users, setUsers] = useState([]);
    const [user1, setUser1] = useState(null);
    const [user2, setUser2] = useState(null);
    const [user1Contacts, setUser1Contacts] = useState([]); // users that user1 has chatted with
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingChat, setLoadingChat] = useState(false);
    const [allChats, setAllChats] = useState([]);
    const [loadingAll, setLoadingAll] = useState(false);
    const [allChatsData, setAllChatsData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const msgEndRef = useRef();

    useEffect(() => {
        Promise.all([
            axios.get(`${BASE}/chats/users`),
            axios.get(`${BASE}/chats`)
        ]).then(([usrRes, chatRes]) => {
            const fetchedUsers = usrRes.data.success ? usrRes.data.data : [];
            const fetchedChats = chatRes.data.success ? chatRes.data.data : [];
            setAllChatsData(fetchedChats);

            // Filter down Users to ONLY those who appear in at least one chat
            const activeIds = new Set();
            fetchedChats.forEach(c => c.participants?.forEach(p => activeIds.add(String(p._id))));
            
            const activeUsers = fetchedUsers.filter(u => activeIds.has(String(u._id)));
            setUsers(activeUsers);
        })
        .catch(() => toast.error("Failed to load chat records"))
        .finally(() => setLoadingUsers(false));
    }, []);

    // When user1 changes: reset user2 and load only user1's conversation partners
    useEffect(() => {
        setUser2(null);
        setUser1Contacts([]);
        if (!user1) return;
        setLoadingContacts(true);
        
        // Use pre-fetched allChatsData to avoid repeated network calls
        const u1Id = String(user1._id);
        const u1Chats = allChatsData.filter(c =>
            c.participants?.some(p => String(p._id) === u1Id)
        );

                // Extract the OTHER participant from each chat, deduplicated
        const contacts = u1Chats
            .map(c => c.participants?.find(p => String(p._id) !== u1Id))
            .filter(Boolean)
            .filter((p, i, arr) => arr.findIndex(x => String(x._id) === String(p._id)) === i);
        setUser1Contacts(contacts);
        setLoadingContacts(false);
    }, [user1?._id, allChatsData]);

    useEffect(() => {
        if (view === 'allChats') {
            setLoadingAll(true);
            axios.get(`${BASE}/chats`)
                .then(({ data }) => { if (data.success) setAllChats(data.data); })
                .catch(() => {})
                .finally(() => setLoadingAll(false));
        }
    }, [view]);

    useEffect(() => {
        if (msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversation = async () => {
        if (!user1 || !user2) { toast.error("Please select both users"); return; }
        if (user1._id === user2._id) { toast.error("Please select two different users"); return; }
        setLoadingChat(true);
        try {
            const { data: chatData } = await axios.post(`${BASE}/chats/find-or-create`, { user1: user1._id, user2: user2._id });
            setChat(chatData.data);
            const { data: msgData } = await axios.get(`${BASE}/chats/messages/${chatData.data._id}`);
            setMessages(msgData.data || []);
            setView('conversation');
        } catch (err) {
            toast.error("Failed to load conversation");
        } finally {
            setLoadingChat(false);
        }
    };

    const openChatFromList = async (c) => {
        setUser1(c.participants?.[0]);
        setUser2(c.participants?.[1]);
        setChat(c);
        setLoadingChat(true);
        try {
            const { data: msgData } = await axios.get(`${BASE}/chats/messages/${c._id}`);
            setMessages(msgData.data || []);
            setView('conversation');
        } catch (err) {
            toast.error("Failed to load messages");
        } finally {
            setLoadingChat(false);
        }
    };

    const formatTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString([], { day: 'numeric', month: 'short' }) : '';

    /* ── CONVERSATION VIEW ───────────────────────────────────────────────── */
    if (view === 'conversation' && user1 && user2) {
        // Group messages by date
        const grouped = messages.reduce((acc, msg) => {
            const d = formatDate(msg.createdAt);
            if (!acc[d]) acc[d] = [];
            acc[d].push(msg);
            return acc;
        }, {});

        return (
            <div className="animate-in zoom-in-95 duration-500 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('picker')} className="p-4 rounded-[28px] bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={22} /></button>
                    <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <button onClick={() => setView('picker')} className="hover:text-blue-500">Communication</button>
                        <ChevronRight size={12} className="opacity-30" />
                        <span className="text-blue-500">Conversation Thread</span>
                    </nav>
                </div>

                {/* Participants bar */}
                <div className="bg-white rounded-[32px] border border-[var(--border-color-light)] shadow-sm p-5 flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Avatar user={user1} size={12} />
                        <div>
                            <p className="font-black text-slate-800 text-sm">{user1.name}</p>
                            <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-bold">{user1.role}</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-blue-200"></div>)}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                        <div>
                            <p className="font-black text-slate-800 text-sm">{user2.name}</p>
                            <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-bold">{user2.role}</p>
                        </div>
                        <Avatar user={user2} size={12} />
                    </div>
                </div>

                {/* Message area */}
                <div className="pro-card bg-white shadow-xl border-0 rounded-[40px] overflow-hidden flex flex-col" style={{ minHeight: '520px' }}>
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={18} className="text-blue-500" />
                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-500">{messages.length} Messages</span>
                        </div>
                        <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Read-Only View</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6" style={{ maxHeight: '460px' }}>
                        {loadingChat ? (
                            <div className="flex items-center justify-center h-48">
                                <RefreshCw size={24} className="animate-spin text-blue-400 opacity-40" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-30">
                                <MessageCircle size={40} />
                                <p className="text-sm font-black uppercase tracking-widest">No messages yet</p>
                            </div>
                        ) : (
                            Object.entries(grouped).map(([date, msgs]) => (
                                <div key={date} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-slate-100"></div>
                                        <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">{date}</span>
                                        <div className="flex-1 h-px bg-slate-100"></div>
                                    </div>
                                    {msgs.map((msg) => {
                                        const isUser1 = msg.senderId?._id === user1._id || msg.senderId === user1._id;
                                        const sender = msg.senderId;
                                        return (
                                            <div key={msg._id} className={`flex items-end gap-3 ${isUser1 ? '' : 'flex-row-reverse'}`}>
                                                <Avatar user={isUser1 ? user1 : user2} size={9} />
                                                <div className={`max-w-[65%] space-y-1 ${isUser1 ? '' : 'items-end'} flex flex-col`}>
                                                    <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium leading-relaxed ${
                                                        isUser1
                                                            ? 'bg-blue-500 text-white rounded-bl-lg'
                                                            : 'bg-slate-100 text-slate-800 rounded-br-lg'
                                                    }`}>
                                                        {msg.text}
                                                    </div>
                                                    <span className={`text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest px-2 ${isUser1 ? '' : 'text-right'}`}>
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                        <div ref={msgEndRef} />
                    </div>
                </div>
            </div>
        );
    }

    /* ── ALL CHATS LIST ──────────────────────────────────────────────────── */
    if (view === 'allChats') {
        const filtered = allChats.filter(c =>
            c.participants?.some(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 bg-white p-5 rounded-[32px] border border-[var(--border-color-light)] shadow-sm">
                    <button onClick={() => setView('picker')} className="p-3 rounded-2xl bg-white text-[var(--text-muted)] hover:text-blue-500 transition-all border border-[var(--border-color)] shadow-sm"><ArrowLeft size={20} /></button>
                    <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <button onClick={() => setView('picker')} className="hover:text-blue-500">Communication</button>
                        <ChevronRight size={12} className="opacity-30" />
                        <span className="text-blue-500 bg-blue-50 px-3 py-1 rounded-xl">All Conversation Threads</span>
                    </nav>
                </div>

                <div className="pro-card p-0 overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-[var(--border-color-light)]">
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by participant name…"
                                className="pro-input w-full pl-11 h-12 text-sm" />
                        </div>
                    </div>
                    <div className="divide-y divide-[var(--border-color-light)]">
                        {loadingAll ? (
                            <div className="p-20 flex items-center justify-center"><RefreshCw size={24} className="animate-spin text-blue-400 opacity-30" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 text-sm font-bold">No conversations found</div>
                        ) : filtered.map((c) => (
                            <button key={c._id} onClick={() => openChatFromList(c)}
                                className="w-full flex items-center gap-5 px-8 py-5 hover:bg-blue-50/20 transition-colors text-left group">
                                <div className="flex -space-x-3">
                                    {c.participants?.slice(0, 2).map((p, i) => <Avatar key={i} user={p} size={10} />)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate">
                                        {c.participants?.map(p => p.name).join(' ↔ ')}
                                    </p>
                                    <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                                        {c.participants?.map(p => p.role).join(' & ')}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[0.6rem] text-slate-400 font-bold">{formatDate(c.updatedAt)}</span>
                                    <Eye size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ── PICKER VIEW (Default) ───────────────────────────────────────────── */
    return (
        <div className="animate-in fade-in duration-700 max-w-2xl mx-auto space-y-10">
            <div className="text-center space-y-3">
                <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase">Communication Hub</h1>
                <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
                <p className="text-[var(--text-muted)] text-sm font-bold opacity-60 italic">
                    Select two users to inspect their conversation thread.
                </p>
            </div>

            <div className="pro-card p-12 bg-white shadow-2xl border-0 rounded-[56px] relative overflow-hidden space-y-8">
                <div className="absolute top-0 left-0 w-3 h-full bg-blue-500 rounded-r-full"></div>

                <div className="space-y-3">
                    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <User size={12} className="text-blue-500" /> Participant 1
                    </label>
                    {loadingUsers ? (
                        <div className="pro-input h-14 rounded-2xl flex items-center px-5"><RefreshCw size={14} className="animate-spin text-slate-300" /></div>
                    ) : (
                        <UserPickerDropdown label="Select first user…" value={user1} onSelect={setUser1} users={users} exclude={user2?._id} />
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <div className="p-3 rounded-full bg-blue-50 text-blue-500"><Users size={16} /></div>
                    <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <div className="space-y-3">
                    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <User size={12} className="text-blue-500" /> Participant 2
                        {user1 && !loadingContacts && (
                            user1Contacts.length > 0 ? (
                                <span className="ml-auto text-[0.55rem] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                    {user1Contacts.length} contact{user1Contacts.length !== 1 ? 's' : ''} found
                                </span>
                            ) : (
                                <span className="ml-auto text-[0.55rem] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                    No history — showing all users
                                </span>
                            )
                        )}
                    </label>
                    {!user1 ? (
                        <div className="pro-input h-14 rounded-2xl flex items-center px-5 text-slate-400 text-sm font-bold italic opacity-60">
                            Select Participant 1 first…
                        </div>
                    ) : loadingContacts ? (
                        <div className="pro-input h-14 rounded-2xl flex items-center gap-3 px-5">
                            <RefreshCw size={14} className="animate-spin text-blue-400" />
                            <span className="text-sm text-slate-400 font-bold">Loading contacts…</span>
                        </div>
                    ) : (
                        <UserPickerDropdown
                            label={user1Contacts.length > 0 ? "Select from conversation partner…" : "Select any user…"}
                            value={user2}
                            onSelect={setUser2}
                            users={user1Contacts.length > 0 ? user1Contacts : users}
                            exclude={user1?._id}
                        />
                    )}
                </div>

                {user1 && user2 && (
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                        <Avatar user={user1} size={10} />
                        <div className="flex-1 text-center">
                            <div className="flex justify-center gap-1">
                                {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>)}
                            </div>
                        </div>
                        <Avatar user={user2} size={10} />
                    </div>
                )}

                <button
                    onClick={loadConversation}
                    disabled={!user1 || !user2 || loadingChat}
                    className="w-full py-5 bg-blue-600 text-white font-extrabold rounded-3xl shadow-2xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all uppercase text-[0.7rem] tracking-widest disabled:opacity-40 flex items-center justify-center gap-3"
                >
                    {loadingChat ? <RefreshCw size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                    {loadingChat ? 'Loading Thread…' : 'View Conversation'}
                </button>

                <button onClick={() => setView('allChats')}
                    className="w-full py-4 border-2 border-slate-100 text-slate-400 font-extrabold rounded-3xl hover:bg-slate-50 transition-all uppercase text-[0.65rem] tracking-widest flex items-center justify-center gap-2">
                    <Eye size={16} /> Browse All Threads
                </button>
            </div>
        </div>
    );
};

export default Chats;
