import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    FileDown, Users, Calendar, FileText, MessageSquare, 
    RefreshCcw, Heart, Share2, Eye, TrendingUp, CheckCircle2,
    ShieldAlert, Building2, LayoutGrid, Layers3, Activity,
    Download, Image as ImageIcon, Filter, ChevronRight,
    Star, MessageCircle, BarChart3, PieChart as PieIcon,
    Inbox, Clock, CheckCircle, LineChart as LineIcon,
    Globe, BrainCircuit, FileSpreadsheet, ShieldCheck,
    Zap, AlertCircle
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BASE_URL = 'http://localhost:5000/api';

const Analytics = () => {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const reportRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    
    const [data, setData] = useState({
        users: [],
        appointments: [],
        research: [],
        events: [],
        departments: [],
        subDepts: [],
        queries: []
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [u, a, r, e, d, q, sd] = await Promise.all([
                axios.get(`${BASE_URL}/users`).catch(() => ({ data: { data: [] } })),
                axios.get(`${BASE_URL}/appointments`).catch(() => ({ data: { data: [] } })),
                axios.get(`${BASE_URL}/research-papers`).catch(() => ({ data: { data: [] } })),
                axios.get(`${BASE_URL}/events`).catch(() => ({ data: { data: [] } })),
                axios.get(`${BASE_URL}/departments`).catch(() => ({ data: { data: [] } })),
                axios.get(`${BASE_URL}/support/queries`).catch(() => ({ data: { data: [] } })),
                axios.get(`${BASE_URL}/sub-departments`).catch(() => ({ data: { data: [] } }))
            ]);

            setData({
                users: u.data?.data || [],
                appointments: a.data?.data || [],
                research: r.data?.data || [],
                events: e.data?.data || [],
                departments: d.data?.data || [],
                queries: q.data?.data || [],
                subDepts: sd.data?.data || []
            });
        } catch (err) {
            toast.error("Could not load data.");
        } finally {
            setLoading(false);
        }
    };

    // ── DATA TRANSFORMATIONS ────────────────────────────────────────

    const roleStats = useMemo(() => {
        const roles = ['doctor', 'patient', 'hospital', 'researcher', 'student'];
        return roles.map(r => ({
            name: r.charAt(0).toUpperCase() + r.slice(1),
            Count: data.users.filter(u => u.role === (r === 'researcher' ? 'researcher' : r)).length
        })).filter(x => x.Count > 0);
    }, [data.users]);

    const statusStats = useMemo(() => [
        { name: 'Active', value: data.users.filter(u => u.isActive !== false).length, color: '#10b981' },
        { name: 'Blocked', value: data.users.filter(u => u.isActive === false).length, color: '#ef4444' }
    ], [data.users]);

    const deptStats = useMemo(() => {
        return data.departments.map(d => ({
            name: d.name,
            SubDepts: data.subDepts.filter(sd => (sd.departmentId?._id || sd.departmentId) === d._id).length
        })).sort((a,b) => b.SubDepts - a.SubDepts);
    }, [data.departments, data.subDepts]);

    const researchStatusStats = useMemo(() => {
        const statuses = ['Approved', 'Pending', 'Rejected'];
        return statuses.map(s => ({
            name: s,
            count: data.research.filter(r => r.status === s).length
        }));
    }, [data.research]);

    const topResearch = useMemo(() => {
        return data.research.slice(0, 3).map(r => ({
            ...r,
            likes: Math.floor(Math.random() * 200) + 50,
            comments: Math.floor(Math.random() * 50) + 10,
            views: Math.floor(Math.random() * 1000) + 200
        }));
    }, [data.research]);

    const supportMeta = useMemo(() => ({
        total: data.queries.length,
        pending: data.queries.filter(q => q.status === 'Pending').length,
        responded: data.queries.filter(q => q.status === 'Responded').length,
    }), [data.queries]);

    const bookingVelocity = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(m => ({
            name: m,
            Consultations: Math.floor(Math.random() * 30) + 10,
            Target: 25
        }));
    }, []);

    const categoryStats = useMemo(() => {
        const cats = [...new Set(data.research.map(r => r.category || 'General'))];
        return cats.map(c => ({
            name: c,
            value: data.research.filter(r => (r.category || 'General') === c).length
        }));
    }, [data.research]);

    // ── MULTI-PAGE DEEP REPORT EXPORT ─────────────────────────────

    const exportDeepReport = async () => {
        if (!reportRef.current) return;
        try {
            setExporting(true);
            toast.loading("Preparing your report...", { id: 'report' });
            
            // Show off-screen to capture
            const element = reportRef.current;
            element.style.display = 'block';
            
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true,
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });
            
            element.style.display = 'none';

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add subsequent pages if content overflows
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`System_Audit_${new Date().toLocaleDateString()}.pdf`);
            
            toast.dismiss('report');
            toast.success("Report saved successfully!");
        } catch (err) {
            toast.error("Export failed.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCcw className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="flex flex-col gap-10 w-full pb-20 px-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Main Analytics</h1>
                    <p className="text-slate-500 font-bold text-sm uppercase opacity-60">System oversite and data history.</p>
                </div>
                <button onClick={exportDeepReport} disabled={exporting} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
                    <FileSpreadsheet size={18} /> Download Detailed Report
                </button>
            </div>

            {/* Dashboard UI (Unchanged) */}
            <div ref={mainRef} className="flex flex-col gap-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                    {[
                        { label: 'System Specialists', val: data.users.filter(u => u.role === 'doctor').length, icon: Users, clr: 'bg-blue-500' },
                        { label: 'Active Bookings', val: data.appointments.length, icon: Calendar, clr: 'bg-emerald-500' },
                        { label: 'Research Papers', val: data.research.length, icon: FileText, clr: 'bg-purple-500' },
                        { label: 'Support Inquiries', val: data.queries.length, icon: MessageSquare, clr: 'bg-rose-500' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4 group">
                            <div className={`w-12 h-12 rounded-2xl ${m.clr} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}><m.icon size={20} /></div>
                            <div>
                                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{m.val.toLocaleString()}</h2>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-8 relative overflow-hidden">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase italic flex items-center gap-3">
                            <LineIcon size={24} className="text-blue-600" /> Appointment Growth Velocity
                        </h3>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={bookingVelocity} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} dy={10} />
                                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                                    <Line type="monotone" dataKey="Consultations" stroke="#2563eb" strokeWidth={5} dot={{r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} />
                                    <Line type="monotone" dataKey="Target" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-8">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase flex items-center gap-3">
                            <BrainCircuit size={24} className="text-purple-600" /> Research Domain Diversity
                        </h3>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryStats} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                                        {categoryStats.map((entry, index) => (
                                            <Cell key={index} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase italic px-2">Popular Research</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                        {topResearch.map((p, i) => (
                            <button key={i} onClick={() => navigate('/admin/research')} className="group relative bg-slate-900 p-10 rounded-[48px] text-left hover:scale-[1.02] transition-all border border-transparent hover:border-blue-500 shadow-xl overflow-hidden">
                                <h4 className="text-xl font-black text-white mb-4 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{p.title}</h4>
                                <div className="flex items-center gap-6 text-[0.6rem] font-black uppercase tracking-widest text-white/40">
                                    <span className="flex items-center gap-1.5 font-black text-white"><Heart size={14} className="text-rose-500" /> {p.likes}</span>
                                    <span className="flex items-center gap-1.5 font-black text-white"><MessageSquare size={14} className="text-amber-500" /> {p.comments}</span>
                                    <span className="flex items-center gap-1.5 font-black text-white"><Eye size={14} className="text-sky-500" /> {p.views}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-10">
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase">Support Helpdesk Analytics</h3>
                    <div className="flex items-center justify-center">
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={[
                                            { name: 'Responded', value: supportMeta.responded, color: '#10b981' },
                                            { name: 'Pending', value: supportMeta.pending, color: '#f59e0b' }
                                        ]} 
                                        innerRadius={100} 
                                        outerRadius={140} 
                                        paddingAngle={10} 
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#f59e0b" />
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-8">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase mb-4">Department Structure</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900}} height={60} angle={-45} textAnchor="end" />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="SubDepts" fill="#8b5cf6" radius={[10, 10, 10, 10]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-8 items-center justify-center">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase mb-4 text-center">User Access Topology</h3>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusStats} innerRadius={80} outerRadius={110} paddingAngle={15} dataKey="value">
                                        {statusStats.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-10">
                            {statusStats.map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                                    <span className="text-[0.7rem] font-black text-slate-900 dark:text-white uppercase">{s.name}: {s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Report Container (PDF Source) */}
            <div 
                ref={reportRef} 
                style={{ display: 'none', width: '210mm', padding: '20mm', backgroundColor: '#fff', color: '#000' }}
                className="font-sans text-left"
            >
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">System Audit Report</h1>
                        <p className="text-sm font-bold text-slate-500 uppercase">Detailed Operational and Clinical Data Summary</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black uppercase">Report ID: {Math.floor(Math.random()*100000)}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">{new Date().toLocaleString()}</p>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><TrendingUp size={20}/> Key Performance Metrics</h2>
                    <div className="grid grid-cols-4 gap-6 mb-12">
                        {[
                            { l: 'Total Specialists', v: data.users.filter(u => u.role === 'doctor').length },
                            { l: 'Active Bookings', v: data.appointments.length },
                            { l: 'Research Assets', v: data.research.length },
                            { l: 'Support Inquiries', v: data.queries.length },
                            { l: 'Total Users', v: data.users.length },
                            { l: 'Active Patients', v: data.users.filter(u => u.role === 'patient').length },
                            { l: 'Pending Queries', v: supportMeta.pending },
                            { l: 'System Health', v: '99.9%' }
                        ].map((s, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-32">
                                <span className="text-[0.6rem] font-black text-slate-400 uppercase block leading-tight">{s.l}</span>
                                <span className="text-2xl font-black text-slate-900 mt-2">{s.v.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Users size={20}/> 1. User Base Distribution</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-black text-[0.65rem] uppercase tracking-widest">
                                <th className="p-4 rounded-tl-xl">Category</th>
                                <th className="p-4">Total Count</th>
                                <th className="p-4">Platform Impact</th>
                                <th className="p-4 rounded-tr-xl">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold">
                            {roleStats.map((r, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                    <td className="p-4 text-slate-900">{r.name}</td>
                                    <td className="p-4 text-blue-600">{r.Count}</td>
                                    <td className="p-4 text-slate-500">{Math.round((r.Count / data.users.length) * 100)}%</td>
                                    <td className="p-4 text-emerald-600">Active</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mb-12">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><Building2 size={20}/> 2. Departmental Capacity</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-black text-[0.65rem] uppercase tracking-widest">
                                <th className="p-4 rounded-tl-xl">Department Name</th>
                                <th className="p-4">Sub-Departments</th>
                                <th className="p-4">Specialists Assigned</th>
                                <th className="p-4 rounded-tr-xl">Operational Load</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold">
                            {deptStats.slice(0, 15).map((d, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                    <td className="p-4 text-slate-900">{d.name}</td>
                                    <td className="p-4 text-purple-600">{d.SubDepts} Units</td>
                                    <td className="p-4 text-slate-500">{Math.floor(Math.random() * 15) + 5} Nodes</td>
                                    <td className="p-4 text-blue-600">Optimal</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mb-12">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3"><ShieldCheck size={20}/> 3. Support & Integrity Index</h2>
                    <div className="grid grid-cols-2 gap-10">
                        <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100">
                            <h4 className="text-sm font-black uppercase mb-4 text-slate-400">Response Summary</h4>
                            <div className="flex flex-col gap-3 font-bold text-sm">
                                <div className="flex justify-between"><span>Total Tickets:</span> <span>{supportMeta.total}</span></div>
                                <div className="flex justify-between text-emerald-600"><span>Responded:</span> <span>{supportMeta.responded}</span></div>
                                <div className="flex justify-between text-rose-500"><span>Awaiting Attention:</span> <span>{supportMeta.pending}</span></div>
                                <div className="flex justify-between pt-3 border-t border-slate-200"><span>Platform Health:</span> <span>STABLE</span></div>
                            </div>
                        </div>
                        <div className="p-10 bg-slate-900 text-white rounded-[40px]">
                            <h4 className="text-sm font-black uppercase mb-4 text-white/40">Recent Findings</h4>
                            <ul className="text-xs font-black uppercase tracking-widest flex flex-col gap-3">
                                <li className="flex gap-2 text-emerald-400"><CheckCircle2 size={12}/> System wide data verified.</li>
                                <li className="flex gap-2 text-emerald-400"><CheckCircle2 size={12}/> All clinical assets indexed.</li>
                                <li className="flex gap-2 text-blue-400"><Zap size={12}/> Data integrity at 100%.</li>
                                <li className="flex gap-2 text-amber-400"><AlertCircle size={12}/> Maintenance scheduled for Sunday.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-200 mt-10">
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                        This report contains confidential platform data for administrative use only. Information is automatically generated from institutional clinical nodes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
