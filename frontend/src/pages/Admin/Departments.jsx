import React, { useState, useEffect, useRef } from 'react';
import {
    Building2, Plus, Search, Edit2, ShieldOff, ShieldCheck,
    X, ChevronLeft, ChevronRight, Layers, Eye,
    CheckCircle, LayoutGrid, List, Upload,
    ImageIcon, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '../../components/Admin/Pagination';

const BASE = 'http://localhost:5000';
const DEPT_API = `${BASE}/api/departments`;
const SUB_API = `${BASE}/api/sub-departments`;

const EMPTY_DEPT = { name: '', description: '', details: '' };
const EMPTY_SUB = { name: '', info: '', description: '', details: '' };

const imgSrc = (item) => item?.image ? `${BASE}${item.image}` : null;

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-LEVEL COMPONENTS
   All defined OUTSIDE the Departments component so React never recreates
   their function refs on parent re-renders → fixes the focus-loss bug.
═══════════════════════════════════════════════════════════════════════════ */

/* ── Image Upload Widget ──────────────────────────────────────────────────── */
const ImageUploadWidget = ({ imagePreview, onFilePick, onClear, inputRef, label = 'Image' }) => (
    <div className="space-y-1.5">
        <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <ImageIcon size={11} /> {label}
        </label>
        <div
            className="relative w-full h-40 rounded-2xl border-2 border-dashed border-[var(--border-color)] overflow-hidden cursor-pointer hover:border-blue-400 transition-colors group bg-[var(--bg-color)]"
            onClick={() => inputRef.current?.click()}
        >
            {imagePreview ? (
                <>
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={20} className="text-white" />
                        <p className="text-white text-xs font-black">Change Image</p>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all z-10"
                    ><X size={12} /></button>
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={22} className="text-blue-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black text-[var(--text-main)]">Click to upload</p>
                        <p className="text-[0.6rem] text-[var(--text-muted)] mt-0.5">PNG, JPG, WEBP · max 5 MB</p>
                    </div>
                </div>
            )}
        </div>
        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFilePick(f, URL.createObjectURL(f)); }}
            className="hidden"
        />
    </div>
);

/* ── Status Badge ─────────────────────────────────────────────────────────── */
const StatusBadge = ({ isActive, size = 'sm' }) =>
    isActive
        ? <span className={`inline-flex items-center gap-1 px-2.5 ${size === 'lg' ? 'py-1.5' : 'py-1'} bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-[0.6rem] font-black`}><CheckCircle size={9} /> Active</span>
        : <span className={`inline-flex items-center gap-1 px-2.5 ${size === 'lg' ? 'py-1.5' : 'py-1'} bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-[0.6rem] font-black`}><ShieldOff size={9} /> Blocked</span>;

/* ── Dept Info Modal (read-only, for blocked dept) ────────────────────────── */
const DeptInfoModal = ({ dept, onClose, onToggle }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
        <div className="pro-card w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30">
                {imgSrc(dept)
                    ? <img src={imgSrc(dept)} alt={dept.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Building2 size={52} className="text-blue-200 dark:text-blue-700" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all"><X size={18} /></button>
                <div className="absolute bottom-4 left-5">
                    <h2 className="text-2xl font-black text-white">{dept.name}</h2>
                    {dept.isActive ? (
                        <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 bg-green-500/80 text-white text-[0.6rem] font-black rounded-lg"><CheckCircle size={10} /> ACTIVE</span>
                    ) : (
                        <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 bg-red-500/80 text-white text-[0.6rem] font-black rounded-lg"><ShieldOff size={10} /> BLOCKED</span>
                    )}
                </div>
            </div>
            <div className="p-6 space-y-3">
                {dept.description && <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]"><p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Description</p><p className="text-sm text-[var(--text-main)] leading-relaxed">{dept.description}</p></div>}
                {dept.details && <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]"><p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Details</p><p className="text-sm text-[var(--text-main)] leading-relaxed">{dept.details}</p></div>}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]"><p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Sub-Depts</p><p className="text-xl font-black text-purple-500">{dept.subDepartmentCount ?? 0}</p></div>
                    <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]">
                        <p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Status</p>
                        <p className={`text-sm font-black ${dept.isActive ? 'text-green-500' : 'text-red-500'}`}>{dept.isActive ? 'Active' : 'Blocked'}</p>
                    </div>
                </div>
                <button
                    onClick={() => onToggle(dept)}
                    className={`w-full py-3.5 text-white font-black rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${dept.isActive ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30' : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'}`}
                >
                    {dept.isActive ? <><ShieldOff size={16} /> Block Access</> : <><ShieldCheck size={16} /> Restore Access</>}
                </button>
            </div>
        </div>
    </div>
);

/* ── Sub-Dept Info Modal (read-only view + quick block/restore) ───────────── */
const SubInfoModal = ({ sub, dept, onClose, onToggle }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
        <div className="pro-card w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Image header */}
            <div className="relative h-44 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20">
                {imgSrc(sub)
                    ? <img src={imgSrc(sub)} alt={sub.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Layers size={48} className="text-purple-200 dark:text-purple-700" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all"><X size={18} /></button>
                {!sub.isActive && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-red-500/90 rounded-xl flex items-center gap-1.5">
                        <ShieldOff size={13} className="text-white" /><span className="text-white font-black text-xs">BLOCKED</span>
                    </div>
                )}
                <div className="absolute bottom-4 left-5">
                    <h2 className="text-xl font-black text-white">{sub.name}</h2>
                    {dept && <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/80 text-white text-[0.58rem] font-black rounded-lg"><Building2 size={9} /> {dept.name}</span>
                        {sub.isActive
                            ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/80 text-white text-[0.58rem] font-black rounded-lg"><CheckCircle size={9} /> Active</span>
                            : <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/80 text-white text-[0.58rem] font-black rounded-lg"><ShieldOff size={9} /> Blocked</span>
                        }
                    </div>}
                </div>
            </div>

            {/* Info body */}
            <div className="p-6 space-y-3">
                {sub.info && <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]"><p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Info</p><p className="text-sm font-bold text-purple-500">{sub.info}</p></div>}
                {sub.description && <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]"><p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Description</p><p className="text-sm text-[var(--text-main)] leading-relaxed">{sub.description}</p></div>}
                {sub.details && <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color-light)]"><p className="text-[0.55rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Details</p><p className="text-sm text-[var(--text-main)] leading-relaxed">{sub.details}</p></div>}

                <div className="flex gap-3 pt-1">
                    <button onClick={onClose} className="flex-1 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-black rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm">Close</button>
                    <button
                        onClick={onToggle}
                        className={`flex-1 py-3 font-black rounded-2xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2 ${sub.isActive ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30'}`}
                    >
                        {sub.isActive ? <><ShieldOff size={14} /> Block Access</> : <><ShieldCheck size={14} /> Restore Access</>}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

/* ── Dept Form Modal (Add / Edit) ─────────────────────────────────────────── */
const DeptFormModal = ({ title, onSubmit, onClose, formData, setFormData, imagePreview, onFilePick, onClear, inputRef, submitting }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
        <div className="pro-card w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-7">
                <div>
                    <h2 className="text-2xl font-black text-[var(--text-main)]">{title}</h2>
                    <p className="text-[0.62rem] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Fields marked * are required</p>
                </div>
                <button type="button" onClick={onClose} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-5">
                <ImageUploadWidget imagePreview={imagePreview} onFilePick={onFilePick} onClear={onClear} inputRef={inputRef} label="Department Image" />
                <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Department Name *</label>
                    <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors z-10" size={15} />
                        <input required type="text" placeholder="e.g. Cardiology" className="pro-input w-full h-12 pl-11" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Short Description</label>
                    <textarea placeholder="Brief overview…" className="pro-input w-full pl-4 pt-3 min-h-[76px] resize-none leading-relaxed" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Detailed Info</label>
                    <textarea placeholder="Full details, services, specializations…" className="pro-input w-full pl-4 pt-3 min-h-[88px] resize-none leading-relaxed" value={formData.details} onChange={e => setFormData(f => ({ ...f, details: e.target.value }))} rows={4} />
                </div>
                <div className="pt-2 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-black rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-60">
                        {submitting ? 'Saving…' : title.startsWith('Edit') ? 'Update Department' : 'Add Department'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

/* ── Sub-Dept Form Modal (Add / Edit) ─────────────────────────────────────── */
const SubDeptFormModal = ({ title, onSubmit, onClose, formData, setFormData, imagePreview, onFilePick, onClear, inputRef, submitting, parentDeptName }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
        <div className="pro-card w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-xl font-black text-[var(--text-main)]">{title}</h2>
                    <div className="flex items-center gap-1.5 mt-1 text-[0.58rem] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        <Building2 size={9} /> {parentDeptName} <ChevronRight size={9} /> <Layers size={9} /> Sub-Dept
                    </div>
                </div>
                <button type="button" onClick={onClose} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4 mt-5">
                <ImageUploadWidget imagePreview={imagePreview} onFilePick={onFilePick} onClear={onClear} inputRef={inputRef} label="Sub-Department Image" />
                <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Name *</label>
                    <div className="relative group">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors z-10" size={14} />
                        <input required type="text" placeholder="e.g. Cardiac ICU" className="pro-input w-full h-12 pl-11" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Info / One-liner</label>
                    <input type="text" placeholder="Short summary…" className="pro-input w-full h-12 pl-4" value={formData.info} onChange={e => setFormData(f => ({ ...f, info: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Description</label>
                    <textarea placeholder="Description…" className="pro-input w-full pl-4 pt-3 min-h-[76px] resize-none leading-relaxed" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Detailed Info</label>
                    <textarea placeholder="More details…" className="pro-input w-full pl-4 pt-3 min-h-[76px] resize-none leading-relaxed" value={formData.details} onChange={e => setFormData(f => ({ ...f, details: e.target.value }))} rows={3} />
                </div>
                <div className="pt-2 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] font-black rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white font-black rounded-2xl shadow-lg shadow-purple-500/30 active:scale-95 transition-all disabled:opacity-60">
                        {submitting ? 'Saving…' : title.startsWith('Edit') ? 'Update' : 'Add Sub-Dept'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

/* ── View Toggle (module-level, stable ref) ───────────────────────────────── */
const VIEW_TOGGLE = ({ viewMode, setViewMode }) => (
    <div className="flex items-center bg-white dark:bg-[#1e293b] border border-[var(--border-color)] rounded-2xl p-1 gap-0.5">
        <button onClick={() => setViewMode('grid')} title="Grid" className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#0ea5e9] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}><LayoutGrid size={15} /></button>
        <button onClick={() => setViewMode('list')} title="List" className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#0ea5e9] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}><List size={15} /></button>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const Departments = () => {
    /* ── Page navigation ─────────────────────────────────────────────────── */
    const [page, setPage] = useState('main'); // 'main' | 'subdepts'
    const [selectedDept, setSelectedDept] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('all');  // 'all'|'active'|'blocked'
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS = viewMode === 'grid' ? 9 : 8;

    /* ── Data ────────────────────────────────────────────────────────────── */
    const [departments, setDepartments] = useState([]);
    const [subDepts, setSubDepts] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ── Modal flags ─────────────────────────────────────────────────────── */
    const [showDeptInfo, setShowDeptInfo] = useState(false);
    const [showSubInfo, setShowSubInfo] = useState(false);
    const [showAddDept, setShowAddDept] = useState(false);
    const [showEditDept, setShowEditDept] = useState(false);
    const [showAddSub, setShowAddSub] = useState(false);
    const [showEditSub, setShowEditSub] = useState(false);

    /* ── Targeted items ──────────────────────────────────────────────────── */
    const [activeDept, setActiveDept] = useState(null);
    const [activeSub, setActiveSub] = useState(null);

    /* ── Form state ──────────────────────────────────────────────────────── */
    const [deptForm, setDeptForm] = useState(EMPTY_DEPT);
    const [subForm, setSubForm] = useState(EMPTY_SUB);
    const [submitting, setSubmitting] = useState(false);

    /* ── Image state: dept ───────────────────────────────────────────────── */
    const [deptImgFile, setDeptImgFile] = useState(null);
    const [deptImgPreview, setDeptImgPreview] = useState('');
    const [deptImgClear, setDeptImgClear] = useState(false);
    const deptFileRef = useRef(null);

    /* ── Image state: sub ────────────────────────────────────────────────── */
    const [subImgFile, setSubImgFile] = useState(null);
    const [subImgPreview, setSubImgPreview] = useState('');
    const [subImgClear, setSubImgClear] = useState(false);
    const subFileRef = useRef(null);

    /* ── Fetch ───────────────────────────────────────────────────────────── */
    const fetchDepts = async () => {
        try { setLoading(true); const { data } = await axios.get(DEPT_API); setDepartments(data.data || []); }
        catch { toast.error('Failed to load departments'); }
        finally { setLoading(false); }
    };

    const fetchSubDepts = async (deptId) => {
        try { setLoading(true); const { data } = await axios.get(`${SUB_API}?departmentId=${deptId}`); setSubDepts(data.data || []); }
        catch { toast.error('Failed to load sub-departments'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDepts(); }, []);

    /* ── Navigation ──────────────────────────────────────────────────────── */
    const goToSubDepts = (dept) => {
        setSelectedDept(dept); setPage('subdepts');
        setSearchTerm(''); setCurrentPage(1);
        fetchSubDepts(dept._id);
    };

    const goBack = () => {
        setPage('main'); setSelectedDept(null); setSubDepts([]);
        setSearchTerm(''); setCurrentPage(1);
        fetchDepts();
    };

    /* ── Image handlers ──────────────────────────────────────────────────── */
    const onDeptPick = (f, p) => { setDeptImgFile(f); setDeptImgPreview(p); setDeptImgClear(false); };
    const onDeptClear = () => { setDeptImgFile(null); setDeptImgPreview(''); setDeptImgClear(true); if (deptFileRef.current) deptFileRef.current.value = ''; };
    const onSubPick = (f, p) => { setSubImgFile(f); setSubImgPreview(p); setSubImgClear(false); };
    const onSubClear = () => { setSubImgFile(null); setSubImgPreview(''); setSubImgClear(true); if (subFileRef.current) subFileRef.current.value = ''; };

    /* ── FormData builders ───────────────────────────────────────────────── */
    const buildDeptFD = (clear = false) => {
        const fd = new FormData();
        Object.entries(deptForm).forEach(([k, v]) => fd.append(k, v));
        if (deptImgFile) fd.append('image', deptImgFile);
        if (clear && deptImgClear) fd.append('clearImage', 'true');
        return fd;
    };

    const buildSubFD = (clear = false) => {
        const fd = new FormData();
        Object.entries(subForm).forEach(([k, v]) => fd.append(k, v));
        fd.append('departmentId', selectedDept?._id || '');
        if (subImgFile) fd.append('image', subImgFile);
        if (clear && subImgClear) fd.append('clearImage', 'true');
        return fd;
    };

    const MFD = { headers: { 'Content-Type': 'multipart/form-data' } };

    /* ── Open dept modals ────────────────────────────────────────────────── */
    const openDeptInfo = (d) => { setActiveDept(d); setShowDeptInfo(true); };
    const openAddDeptM = () => { setDeptForm(EMPTY_DEPT); onDeptClear(); setShowAddDept(true); };
    const openEditDeptM = (d) => {
        setActiveDept(d);
        setDeptForm({ name: d.name || '', description: d.description || '', details: d.details || '' });
        setDeptImgFile(null); setDeptImgPreview(imgSrc(d) || ''); setDeptImgClear(false);
        setShowEditDept(true);
    };

    /* ── Open sub modals ─────────────────────────────────────────────────── */
    const openSubInfo = (s) => { setActiveSub(s); setShowSubInfo(true); };
    const openAddSubM = () => { setSubForm(EMPTY_SUB); onSubClear(); setShowAddSub(true); };
    const openEditSubM = (s) => {
        setActiveSub(s);
        setSubForm({ name: s.name || '', info: s.info || '', description: s.description || '', details: s.details || '' });
        setSubImgFile(null); setSubImgPreview(imgSrc(s) || ''); setSubImgClear(false);
        setShowEditSub(true);
    };

    /* ── CRUD: Departments ───────────────────────────────────────────────── */
    const handleAddDept = async (e) => {
        e.preventDefault();
        try { setSubmitting(true); const t = toast.loading('Adding…'); await axios.post(DEPT_API, buildDeptFD(), MFD); toast.success('Department added!', { id: t }); setShowAddDept(false); fetchDepts(); }
        catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const handleEditDept = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const t = toast.loading('Updating…');
            const { data } = await axios.put(`${DEPT_API}/${activeDept._id}`, buildDeptFD(true), MFD);
            toast.success('Updated!', { id: t });
            setShowEditDept(false);
            // Sync selectedDept if we're editing it from sub-dept page
            if (page === 'subdepts' && selectedDept?._id === activeDept._id) {
                setSelectedDept(prev => ({ ...data.data, subDepartmentCount: prev?.subDepartmentCount }));
            }
            fetchDepts();
        } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
        finally { setSubmitting(false); }
    };

    const handleToggleDept = async (dept, closeModal = false) => {
        const loader = toast.loading(dept.isActive ? "Blocking…" : "Restoring…");
        const action = dept.isActive ? 'block' : 'revoke';
        try {
            await axios.patch(`${DEPT_API}/${dept._id}/${action}`);
            toast.success(dept.isActive ? "Department blocked" : "Access restored", { id: loader });
            if (closeModal) setShowDeptInfo(false);
            // Update selectedDept if it's the one being toggled
            if (page === 'subdepts' && selectedDept?._id === dept._id) {
                setSelectedDept(prev => ({ ...prev, isActive: !dept.isActive }));
            }
            fetchDepts();
        } catch { toast.error('Status update failed'); }
    };

    /* ── CRUD: Sub-Departments ───────────────────────────────────────────── */
    const handleAddSub = async (e) => {
        e.preventDefault();
        try { setSubmitting(true); const t = toast.loading('Adding…'); await axios.post(SUB_API, buildSubFD(), MFD); toast.success('Sub-dept added!', { id: t }); setShowAddSub(false); fetchSubDepts(selectedDept._id); }
        catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const handleEditSub = async (e) => {
        e.preventDefault();
        try { setSubmitting(true); const t = toast.loading('Updating…'); await axios.put(`${SUB_API}/${activeSub._id}`, buildSubFD(true), MFD); toast.success('Updated!', { id: t }); setShowEditSub(false); fetchSubDepts(selectedDept._id); }
        catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
        finally { setSubmitting(false); }
    };

    const handleToggleSub = async (sub, closeModal = false) => {
        const action = sub.isActive ? 'block' : 'revoke';
        try {
            await axios.patch(`${SUB_API}/${sub._id}/${action}`);
            toast.success(sub.isActive ? 'Sub-dept blocked' : 'Access restored');
            if (closeModal) setShowSubInfo(false);
            fetchSubDepts(selectedDept._id);
        } catch { toast.error('Status update failed'); }
    };

    /* ── Derived data ────────────────────────────────────────────────────── */
    const filteredDepts = departments.filter(d => {
        const q = searchTerm.toLowerCase();
        const matchSearch = d.name?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? d.isActive : !d.isActive);
        return matchSearch && matchStatus;
    });

    const filteredSubs = subDepts.filter(s => {
        const q = searchTerm.toLowerCase();
        return s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.info?.toLowerCase().includes(q);
    });

    const deptPages = Math.ceil(filteredDepts.length / ITEMS);
    const subPages = Math.ceil(filteredSubs.length / ITEMS);
    const pagedDepts = filteredDepts.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);
    const pagedSubs = filteredSubs.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

    /* ── Stats ───────────────────────────────────────────────────────────── */
    const STATS = [
        { label: 'Total', value: departments.length, clr: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', ring: 'ring-blue-200 dark:ring-blue-800' },
        { label: 'Active', value: departments.filter(d => d.isActive).length, clr: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', ring: 'ring-green-200 dark:ring-green-800' },
        { label: 'Blocked', value: departments.filter(d => !d.isActive).length, clr: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', ring: 'ring-red-200 dark:ring-red-800' },
        { label: 'Sub-Depts', value: departments.reduce((s, d) => s + (d.subDepartmentCount || 0), 0), clr: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', ring: 'ring-purple-200 dark:ring-purple-800' },
    ];



    /* ════════════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════════════ */
    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* ════════════════════════════════════════════════════════════
                MAIN PAGE — Departments
            ════════════════════════════════════════════════════════════ */}
            {page === 'main' && (<>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest animate-in slide-in-from-left-4 duration-500">
                    <span className="flex items-center gap-1.5 opacity-60"><Building2 size={11} /> Admin</span>
                    <ChevronRight size={10} className="opacity-40" />
                    <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">Departments</span>
                </nav>

                <div>
                    <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Departments</h1>
                    <p className="text-sm font-black italic text-[var(--text-muted)]">Manage hospital departments — add, edit, block or restore access.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {STATS.map(s => (
                        <div key={s.label} className={`pro-card p-5 flex items-center gap-4 ring-1 ${s.ring}`}>
                            <div className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                                <p className={`text-lg font-black ${s.clr}`}>{loading ? '…' : s.value}</p>
                            </div>
                            <p className={`text-[0.6rem] font-black uppercase tracking-widest leading-tight ${s.clr}`}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Filter tabs */}
                    <div className="flex items-center bg-white dark:bg-[#1e293b] border border-[var(--border-color)] rounded-2xl p-1 gap-0.5">
                        {[
                            { id: 'all', label: 'All', ac: 'bg-[#0ea5e9] text-white' },
                            { id: 'active', label: 'Active', ac: 'bg-green-500 text-white' },
                            { id: 'blocked', label: 'Blocked', ac: 'bg-red-500 text-white' },
                        ].map(f => (
                            <button key={f.id} onClick={() => { setStatusFilter(f.id); setCurrentPage(1); }}
                                className={`px-4 py-2 rounded-xl text-[0.62rem] font-black uppercase transition-all ${statusFilter === f.id ? f.ac : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            >{f.label}</button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                        <input type="text" placeholder="Search departments…" className="pro-input w-full pl-10 h-11 text-sm" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>

                    <VIEW_TOGGLE viewMode={viewMode} setViewMode={setViewMode} />

                    <button onClick={openAddDeptM} className="h-11 px-7 bg-[#0ea5e9] text-white font-black rounded-2xl text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:scale-105 transition-all">
                        <Plus size={16} /> Add Department
                    </button>
                </div>

                {/* ── Dept Grid ── */}
                {viewMode === 'grid' && (
                    loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...Array(6)].map((_, i) => <div key={i} className="pro-card h-64 animate-pulse bg-gray-100 dark:bg-gray-800/40 rounded-[24px]" />)}
                        </div>
                    ) : pagedDepts.length === 0 ? (
                        <div className="pro-card p-16 text-center"><Building2 size={40} className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" /><p className="font-bold text-[var(--text-muted)]">No departments found.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {pagedDepts.map(dept => (
                                <div key={dept._id} className="group pro-card p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Image */}
                                    <div
                                        className={`relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 ${dept.isActive ? 'cursor-pointer' : 'cursor-default'}`}
                                        onClick={() => dept.isActive ? goToSubDepts(dept) : undefined}
                                    >
                                        {imgSrc(dept)
                                            ? <img src={imgSrc(dept)} alt={dept.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.style.display = 'none'; }} />
                                            : <div className="w-full h-full flex items-center justify-center"><Building2 size={48} className="text-blue-200 dark:text-blue-700" /></div>
                                        }
                                        {/* BLOCKED ribbon */}
                                        {!dept.isActive && (
                                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                                <div className="px-4 py-2 bg-red-500/95 rounded-2xl flex items-center gap-2 shadow-xl">
                                                    <ShieldOff size={15} className="text-white" /><span className="text-white font-black text-xs tracking-widest">BLOCKED</span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Active badges */}
                                        {dept.isActive && (<>
                                            <div className="absolute top-3 left-3"><span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/80 backdrop-blur-sm text-white text-[0.55rem] font-black rounded-lg"><CheckCircle size={9} /> Active</span></div>
                                            <div className="absolute top-3 right-3"><span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/90 backdrop-blur-sm text-white text-[0.6rem] font-black rounded-xl"><Layers size={10} /> {dept.subDepartmentCount ?? 0} Sub</span></div>
                                        </>)}
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <h3 className={`text-base font-black text-[var(--text-main)] mb-1 truncate ${dept.isActive ? 'cursor-pointer hover:text-blue-500 transition-colors' : ''}`}
                                            onClick={() => dept.isActive ? goToSubDepts(dept) : undefined}>{dept.name}</h3>
                                        {dept.description && <p className="text-[0.7rem] text-[var(--text-muted)] font-medium line-clamp-2 leading-relaxed">{dept.description}</p>}

                                        <div className="mt-4 pt-4 border-t border-[var(--border-color-light)]">
                                            {dept.isActive ? (
                                                /* Active: View | Edit | Block */
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openDeptInfo(dept)} title="View Info" className="p-2 rounded-xl text-gray-500 bg-gray-100 dark:bg-gray-800 hover:scale-110 active:scale-95 transition-all"><Eye size={14} /></button>
                                                    <button onClick={() => openEditDeptM(dept)} title="Edit" className="p-2 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:scale-110 active:scale-95 transition-all"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleToggleDept(dept)} title="Block" className="p-2 rounded-xl text-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:scale-110 active:scale-95 transition-all"><ShieldOff size={14} /></button>
                                                </div>
                                            ) : (
                                                /* Blocked: View Info | Restore */
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openDeptInfo(dept)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[0.65rem] font-black text-[var(--text-muted)] border border-[var(--border-color)] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                                        <Eye size={13} /> View Info
                                                    </button>
                                                    <button onClick={() => handleToggleDept(dept)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[0.65rem] font-black text-white bg-green-500 rounded-xl hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/25">
                                                        <ShieldCheck size={13} /> Restore
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ── Dept List ── */}
                {viewMode === 'list' && (
                    <div className="pro-card p-0 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] dark:bg-[#0f172a]/30 border-b border-[var(--border-color-light)]">
                                    <tr>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest w-10">#</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Department</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">Description</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Sub</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color-light)]">
                                    {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm font-bold text-[var(--text-muted)] animate-pulse">Loading…</td></tr>}
                                    {!loading && pagedDepts.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm font-bold text-[var(--text-muted)]">No departments found.</td></tr>}
                                    {!loading && pagedDepts.map((dept, idx) => (
                                        <tr key={dept._id} className="hover:bg-blue-50/5 transition-colors group">
                                            <td className="px-5 py-4 text-xs font-bold text-[var(--text-muted)] opacity-50">{(currentPage - 1) * ITEMS + idx + 1}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-2xl overflow-hidden border border-[var(--border-color-light)] bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 flex items-center justify-center ${dept.isActive ? 'cursor-pointer' : ''}`} onClick={() => dept.isActive ? goToSubDepts(dept) : undefined}>
                                                        {imgSrc(dept) ? <img src={imgSrc(dept)} alt={dept.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} /> : <Building2 size={18} className="text-blue-300" />}
                                                    </div>
                                                    <p className={`text-sm font-black text-[var(--text-main)] ${dept.isActive ? 'cursor-pointer hover:text-blue-500 transition-colors' : ''}`} onClick={() => dept.isActive ? goToSubDepts(dept) : undefined}>{dept.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell max-w-xs"><p className="text-[0.72rem] text-[var(--text-muted)] font-medium line-clamp-2">{dept.description || '—'}</p></td>
                                            <td className="px-5 py-4 text-center"><span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl text-[0.62rem] font-black"><Layers size={10} />{dept.subDepartmentCount ?? 0}</span></td>
                                            <td className="px-5 py-4 text-center"><StatusBadge isActive={dept.isActive} /></td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {dept.isActive ? (<>
                                                        <button onClick={() => openDeptInfo(dept)} title="View Info" className="p-2 rounded-xl text-gray-500 bg-gray-100 dark:bg-gray-800 hover:scale-110 transition-all"><Eye size={13} /></button>
                                                        <button onClick={() => openEditDeptM(dept)} title="Edit" className="p-2 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:scale-110 transition-all"><Edit2 size={13} /></button>
                                                        <button onClick={() => handleToggleDept(dept)} title="Block" className="p-2 rounded-xl text-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:scale-110 transition-all"><ShieldOff size={13} /></button>
                                                    </>) : (<>
                                                        <button onClick={() => openDeptInfo(dept)} title="View Info" className="p-2 rounded-xl text-gray-500 bg-gray-100 dark:bg-gray-800 hover:scale-110 transition-all"><Eye size={13} /></button>
                                                        <button onClick={() => handleToggleDept(dept)} className="px-3 py-2 rounded-xl text-white bg-green-500 font-black text-[0.6rem] hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1"><ShieldCheck size={11} />Restore</button>
                                                    </>)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-5 border-t border-[var(--border-color-light)]">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={deptPages}
                                totalItems={filteredDepts.length}
                                itemsPerPage={ITEMS}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                )}

                {viewMode === 'grid' && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={deptPages}
                            totalItems={filteredDepts.length}
                            itemsPerPage={ITEMS}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </>)}

            {/* ════════════════════════════════════════════════════════════
                SUB-DEPT PAGE
            ════════════════════════════════════════════════════════════ */}
            {page === 'subdepts' && (<>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest flex-wrap animate-in slide-in-from-left-4 duration-500">
                    <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-1.5 hover:text-blue-500 transition-colors bg-transparent border-none p-0 cursor-pointer group"
                    >
                        <Building2 size={11} className="group-hover:scale-110 transition-transform" />
                        <span>Departments</span>
                    </button>

                    <ChevronRight size={10} className="opacity-40" />

                    <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-1.5 hover:text-blue-500 transition-colors bg-transparent border-none p-0 cursor-pointer group"
                    >
                        <span className="text-[var(--text-main)] group-hover:underline underline-offset-4">{selectedDept?.name}</span>
                    </button>

                    <ChevronRight size={10} className="opacity-40" />

                    <div className="text-purple-500 flex items-center gap-1.5">
                        <Layers size={11} />
                        <span>Sub-Departments</span>
                    </div>
                </nav>

                {/* ── Department Detail Panel ── */}
                <div className="pro-card p-5">
                    <div className="flex items-center gap-5">
                        {/* Thumb */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-lg flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            {imgSrc(selectedDept)
                                ? <img src={imgSrc(selectedDept)} alt={selectedDept?.name} className="w-full h-full object-cover" />
                                : <Building2 size={30} className="text-blue-300 dark:text-blue-600" />
                            }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h2 className="text-xl font-black text-[var(--text-main)]">{selectedDept?.name}</h2>
                                <StatusBadge isActive={selectedDept?.isActive} />
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl text-[0.6rem] font-black">
                                    <Layers size={9} /> {subDepts.length} Sub-Dept{subDepts.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {selectedDept?.description && <p className="text-[0.72rem] text-[var(--text-muted)] font-medium leading-relaxed line-clamp-2">{selectedDept.description}</p>}
                            {selectedDept?.details && <p className="text-[0.68rem] text-[var(--text-muted)] opacity-70 mt-0.5 line-clamp-1 italic">{selectedDept.details}</p>}
                        </div>

                        {/* Actions: View | Edit | Toggle */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => openDeptInfo(selectedDept)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-[var(--text-muted)] font-black text-xs rounded-2xl hover:bg-gray-200 active:scale-95 transition-all flex items-center gap-2">
                                <Eye size={13} /> View Info
                            </button>
                            <button onClick={() => openEditDeptM(selectedDept)} className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 font-black text-xs rounded-2xl hover:bg-blue-100 active:scale-95 transition-all flex items-center gap-2">
                                <Edit2 size={13} /> Edit Dept
                            </button>
                            {selectedDept?.isActive ? (
                                <button onClick={() => handleToggleDept(selectedDept)} className="px-5 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-500 font-black text-xs rounded-2xl hover:bg-orange-100 active:scale-95 transition-all flex items-center gap-2">
                                    <ShieldOff size={13} /> Block
                                </button>
                            ) : (
                                <button onClick={() => handleToggleDept(selectedDept)} className="px-5 py-2.5 bg-green-500 text-white font-black text-xs rounded-2xl hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2">
                                    <ShieldCheck size={13} /> Restore
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page sub-header + back btn */}
                <div className="flex items-center gap-3">
                    <button onClick={goBack} className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-500 hover:border-blue-400 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tighter">Sub-Departments</h1>
                        <p className="text-xs font-black italic text-[var(--text-muted)]">Manage sub-units of {selectedDept?.name}</p>
                    </div>
                </div>

                {/* Sub toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                        <input type="text" placeholder="Search sub-departments…" className="pro-input w-full pl-10 h-11 text-sm" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <VIEW_TOGGLE viewMode={viewMode} setViewMode={setViewMode} />
                    <button onClick={openAddSubM} className="h-11 px-7 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white font-black rounded-2xl text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:scale-105 transition-all">
                        <Plus size={16} /> Add Sub-Dept
                    </button>
                </div>

                {/* ── Sub Grid ── */}
                {viewMode === 'grid' && (
                    loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...Array(6)].map((_, i) => <div key={i} className="pro-card h-56 animate-pulse bg-gray-100 dark:bg-gray-800/40 rounded-[24px]" />)}
                        </div>
                    ) : pagedSubs.length === 0 ? (
                        <div className="pro-card p-16 text-center"><Layers size={40} className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" /><p className="font-bold text-[var(--text-muted)]">No sub-departments yet. Add one!</p></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {pagedSubs.map(sub => (
                                <div key={sub._id} className="group pro-card p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative h-36 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 overflow-hidden">
                                        {imgSrc(sub)
                                            ? <img src={imgSrc(sub)} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.style.display = 'none'; }} />
                                            : <div className="w-full h-full flex items-center justify-center"><Layers size={36} className="text-purple-200 dark:text-purple-700" /></div>
                                        }
                                        {/* BLOCKED overlay */}
                                        {!sub.isActive && (
                                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                                <div className="px-3 py-1.5 bg-red-500/95 rounded-xl flex items-center gap-1.5 shadow-xl">
                                                    <ShieldOff size={13} className="text-white" /><span className="text-white font-black text-xs tracking-widest">BLOCKED</span>
                                                </div>
                                            </div>
                                        )}
                                        {sub.isActive && <div className="absolute top-2 right-2"><span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/80 backdrop-blur-sm text-white text-[0.55rem] font-black rounded-lg"><CheckCircle size={9} /> Active</span></div>}
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <h3 className="text-base font-black text-[var(--text-main)] mb-1 truncate">{sub.name}</h3>
                                        {sub.info && <p className="text-[0.65rem] text-purple-500 font-bold mb-1">{sub.info}</p>}
                                        {sub.description && <p className="text-[0.7rem] text-[var(--text-muted)] line-clamp-2 leading-relaxed">{sub.description}</p>}

                                        <div className="mt-4 pt-4 border-t border-[var(--border-color-light)]">
                                            {sub.isActive ? (
                                                /* Active: View | Edit | Block */
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openSubInfo(sub)} title="View" className="p-2 rounded-xl text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 hover:scale-110 active:scale-95 transition-all"><Eye size={14} /></button>
                                                    <button onClick={() => openEditSubM(sub)} title="Edit" className="p-2 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:scale-110 active:scale-95 transition-all"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleToggleSub(sub)} title="Block" className="p-2 rounded-xl text-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:scale-110 active:scale-95 transition-all"><ShieldOff size={14} /></button>
                                                </div>
                                            ) : (
                                                /* Blocked: View | Restore */
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openSubInfo(sub)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[0.65rem] font-black text-[var(--text-muted)] border border-[var(--border-color)] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                                        <Eye size={13} /> View Info
                                                    </button>
                                                    <button onClick={() => handleToggleSub(sub)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[0.65rem] font-black text-white bg-green-500 rounded-xl hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/25">
                                                        <ShieldCheck size={13} /> Restore
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ── Sub List ── */}
                {viewMode === 'list' && (
                    <div className="pro-card p-0 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] dark:bg-[#0f172a]/30 border-b border-[var(--border-color-light)]">
                                    <tr>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest w-10">#</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest">Sub-Department</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">Info</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest hidden lg:table-cell">Description</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                                        <th className="px-5 py-4 text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color-light)]">
                                    {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm font-bold text-[var(--text-muted)] animate-pulse">Loading…</td></tr>}
                                    {!loading && pagedSubs.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm font-bold text-[var(--text-muted)]">No sub-departments yet.</td></tr>}
                                    {!loading && pagedSubs.map((sub, idx) => (
                                        <tr key={sub._id} className="hover:bg-purple-50/5 transition-colors group">
                                            <td className="px-5 py-4 text-xs font-bold text-[var(--text-muted)] opacity-50">{(currentPage - 1) * ITEMS + idx + 1}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl overflow-hidden border border-[var(--border-color-light)] bg-purple-50 dark:bg-purple-900/20 flex-shrink-0 flex items-center justify-center relative">
                                                        {imgSrc(sub) ? <img src={imgSrc(sub)} alt={sub.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} /> : <Layers size={18} className="text-purple-300" />}
                                                        {!sub.isActive && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><ShieldOff size={10} className="text-white" /></div>}
                                                    </div>
                                                    <p className="text-sm font-black text-[var(--text-main)]">{sub.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell"><p className="text-[0.72rem] text-purple-500 font-bold truncate max-w-[140px]">{sub.info || '—'}</p></td>
                                            <td className="px-5 py-4 hidden lg:table-cell max-w-xs"><p className="text-[0.72rem] text-[var(--text-muted)] line-clamp-2">{sub.description || '—'}</p></td>
                                            <td className="px-5 py-4 text-center"><StatusBadge isActive={sub.isActive} /></td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {sub.isActive ? (<>
                                                        <button onClick={() => openSubInfo(sub)} title="View" className="p-2 rounded-xl text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 hover:scale-110 transition-all"><Eye size={13} /></button>
                                                        <button onClick={() => openEditSubM(sub)} title="Edit" className="p-2 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:scale-110 transition-all"><Edit2 size={13} /></button>
                                                        <button onClick={() => handleToggleSub(sub)} title="Block" className="p-2 rounded-xl text-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:scale-110 transition-all"><ShieldOff size={13} /></button>
                                                    </>) : (<>
                                                        <button onClick={() => openSubInfo(sub)} title="View" className="p-2 rounded-xl text-gray-500 bg-gray-100 dark:bg-gray-800 hover:scale-110 transition-all"><Eye size={13} /></button>
                                                        <button onClick={() => handleToggleSub(sub)} className="px-3 py-2 rounded-xl text-white bg-green-500 font-black text-[0.6rem] hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1"><ShieldCheck size={11} />Restore</button>
                                                    </>)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-5 border-t border-[var(--border-color-light)]">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={subPages}
                                totalItems={filteredSubs.length}
                                itemsPerPage={ITEMS}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                )}

                {viewMode === 'grid' && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={subPages}
                            totalItems={filteredSubs.length}
                            itemsPerPage={ITEMS}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </>)}

            {/* ══════════════════════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════════════════════ */}

            {/* Dept info (active or blocked view) */}
            {showDeptInfo && activeDept && (
                <DeptInfoModal dept={activeDept} onClose={() => setShowDeptInfo(false)} onToggle={handleToggleDept} />
            )}

            {/* Sub info (view + quick block/restore) */}
            {showSubInfo && activeSub && (
                <SubInfoModal
                    sub={activeSub}
                    dept={selectedDept}
                    onClose={() => setShowSubInfo(false)}
                    onToggle={() => handleToggleSub(activeSub, true)}
                />
            )}

            {/* Add Dept */}
            {showAddDept && (
                <DeptFormModal title="Add New Department" onSubmit={handleAddDept} onClose={() => setShowAddDept(false)}
                    formData={deptForm} setFormData={setDeptForm}
                    imagePreview={deptImgPreview} onFilePick={onDeptPick} onClear={onDeptClear} inputRef={deptFileRef}
                    submitting={submitting} />
            )}

            {/* Edit Dept (works from both main page and sub-dept page) */}
            {showEditDept && activeDept && (
                <DeptFormModal title={`Edit — ${activeDept.name}`} onSubmit={handleEditDept} onClose={() => setShowEditDept(false)}
                    formData={deptForm} setFormData={setDeptForm}
                    imagePreview={deptImgPreview} onFilePick={onDeptPick} onClear={onDeptClear} inputRef={deptFileRef}
                    submitting={submitting} />
            )}

            {/* Add Sub-Dept */}
            {showAddSub && (
                <SubDeptFormModal title="Add Sub-Department" onSubmit={handleAddSub} onClose={() => setShowAddSub(false)}
                    formData={subForm} setFormData={setSubForm}
                    imagePreview={subImgPreview} onFilePick={onSubPick} onClear={onSubClear} inputRef={subFileRef}
                    submitting={submitting} parentDeptName={selectedDept?.name} />
            )}

            {/* Edit Sub-Dept */}
            {showEditSub && activeSub && (
                <SubDeptFormModal title={`Edit — ${activeSub.name}`} onSubmit={handleEditSub} onClose={() => setShowEditSub(false)}
                    formData={subForm} setFormData={setSubForm}
                    imagePreview={subImgPreview} onFilePick={onSubPick} onClear={onSubClear} inputRef={subFileRef}
                    submitting={submitting} parentDeptName={selectedDept?.name} />
            )}
        </div>
    );
};

export default Departments;
