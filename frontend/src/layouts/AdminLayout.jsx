import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    CalendarDays,
    BookOpen,
    MessageSquare,
    LifeBuoy,
    BarChart3,
    UserCircle,
    Menu,
    Moon,
    Sun,
    Globe,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const { user, theme, toggleTheme, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Set page title consistently
    useEffect(() => {
        const currentItem = menuItems.find(item => item.path === location.pathname);
        if (currentItem) {
            document.title = `${currentItem.name} | AxonX Admin`;
        }
    }, [location.pathname]);

    // Role Protection: Only Admin can access this layout
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Users', icon: Users, path: '/admin/users' },
        { name: 'Departments', icon: Building2, path: '/admin/departments' },
        { name: 'Appointments', icon: CalendarCheck, path: '/admin/appointments' },
        { name: 'Events', icon: CalendarDays, path: '/admin/events' },
        { name: 'Research', icon: BookOpen, path: '/admin/research' },
        { name: 'Support', icon: LifeBuoy, path: '/admin/support' },
        { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
        { name: 'Profile', icon: UserCircle, path: '/admin/profile' },
    ];

    const handleLogout = () => {
        logout();
        toast.success("Identity cleared. Logged out.");
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[var(--bg-color)] overflow-hidden transition-colors duration-400">
            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 transition-all duration-300 transform
                lg:relative lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isCollapsed ? 'w-20' : 'w-64'} 
                bg-[#1e3a8a] dark:bg-[#0f172a] text-white flex flex-col shadow-2xl
            `}>
                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 border-b border-blue-800/20 dark:border-slate-800/50">
                    <Logo className="w-10 h-10" showText={!isCollapsed} light />
                </div>

                {/* Navigation Items */}
                <nav className="flex-grow py-6 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`
                                w-full flex items-center px-6 py-3.5 transition-all duration-200 group
                                ${location.pathname === item.path
                                    ? 'bg-[#1e40af] dark:bg-blue-600/20 text-white border-r-4 border-[#0ea5e9]'
                                    : 'text-blue-200/70 hover:bg-[#1e40af]/30 hover:text-white'}
                            `}
                        >
                            <item.icon size={22} className={`${isCollapsed ? 'mx-auto' : 'mr-4'} group-hover:scale-110 transition-transform`} />
                            {!isCollapsed && <span className="font-bold text-[0.85rem] uppercase tracking-widest">{item.name}</span>}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 text-center border-t border-blue-800/20 dark:border-slate-800/50">
                    {!isCollapsed && <p className="text-[0.6rem] text-blue-200/50 uppercase tracking-[0.2em] font-black">AxonX v1.0 System</p>}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-[var(--topbar-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-6 z-30 transition-colors duration-400 shadow-sm relative">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.innerWidth < 1024 ? setIsMobileMenuOpen(!isMobileMenuOpen) : setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-xl hover:bg-[var(--hover-bg)] text-[var(--text-muted)] transition-all hover:text-[var(--primary-accent)]"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="hidden md:flex flex-col">
                            <h2 className="text-sm font-black text-[var(--text-main)] opacity-70 uppercase tracking-[0.1em]">AxonX Healthcare System</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--primary-accent)] transition-all">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {/* Profile Wrapper */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl hover:bg-[var(--hover-bg)] transition-all border border-transparent hover:border-[var(--border-color)]"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-[var(--text-main)] leading-none mb-1">{user.name}</p>
                                    <p className="text-[0.65rem] font-bold text-[var(--text-muted)] italic tracking-tighter uppercase">{user.role}</p>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden shadow-lg border border-[var(--border-color)]">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="User Avatar" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#0ea5e9] text-white font-black text-xl">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showProfileDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowProfileDropdown(false)} />
                                    <div className="absolute right-0 mt-3 w-60 bg-[var(--topbar-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <div className="p-2">
                                            <button onClick={() => { navigate('/admin/profile'); setShowProfileDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-[var(--text-main)] hover:bg-[var(--hover-bg)] rounded-xl transition-all">
                                                <UserCircle size={20} className="text-blue-500" /> My Profile
                                            </button>
                                            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-[var(--text-main)] hover:bg-[var(--hover-bg)] rounded-xl transition-all">
                                                <Globe size={20} className="text-green-500" /> Healthcare Web
                                            </button>
                                        </div>
                                        <div className="border-t border-[var(--border-color)] p-2 bg-[var(--bg-color)]/20">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                                                <LogOut size={20} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-[var(--bg-color)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
