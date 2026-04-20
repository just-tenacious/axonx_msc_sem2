import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    ChevronRight, Search, MapPin, 
    Stethoscope, Building2, Star, 
    ArrowLeft, Calendar, User, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api';

const Departments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // View States: grid (all depts) -> subdepts -> hospitals -> doctors -> doctor-profile
  const [view, setView] = useState('grid');
  const [selectedMainDept, setSelectedMainDept] = useState(null);
  const [selectedSubDept, setSelectedSubDept] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoreData();
  }, []);

  const fetchCoreData = async () => {
    try {
      setLoading(true);
      const [deptRes, subDeptRes] = await Promise.all([
        axios.get(`${BASE_URL}/departments`),
        axios.get(`${BASE_URL}/sub-departments`)
      ]);
      setDepartments(deptRes.data.data || []);
      setSubDepartments(subDeptRes.data.data || []);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to sync clinical registry");
      setLoading(false);
    }
  };

  const fetchHospitalsByDept = async (deptId) => {
    try {
      setLoading(true);
      // In our backend, hospitals might be users with role 'hospital' or a separate model.
      // Based on previous sessions, we transitioned to a flat user model.
      const { data } = await axios.get(`${BASE_URL}/users?role=hospital`);
      // Filter hospitals that have this department (if we have that field)
      // For now, showing all hospitals as partners
      setHospitals(data.data || []);
      setLoading(false);
    } catch {
      toast.error("Facility lookup failed");
      setLoading(false);
    }
  };

  const fetchDoctorsByHospitalAndDept = async (hospId, deptId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/users?role=doctor`);
      // In a real scenario, we'd filter by hospitalId and deptId from query
      setDoctors(data.data || []);
      setLoading(false);
    } catch {
      toast.error("Specialist lookup failed");
      setLoading(false);
    }
  };

  const logBrowseActivity = async (payload) => {
    if (!user) return;
    try {
        await axios.post(`${BASE_URL}/browse-history`, {
            userId: user._id,
            ...payload
        });
    } catch (e) {
        console.error("Failed to log browse history", e);
    }
  };

  const handleDeptClick = (dept) => {
    setSelectedMainDept(dept);
    setView('subdepts');
    logBrowseActivity({ departmentId: dept._id, actionType: 'view_department' });
  };

  const handleSubDeptClick = (sub) => {
    setSelectedSubDept(sub);
    fetchHospitalsByDept(selectedMainDept._id);
    setView('hospitals');
    logBrowseActivity({ departmentId: selectedMainDept._id, subDepartmentId: sub._id, actionType: 'view_subdepartment' });
  };

  const handleHospitalClick = (hosp) => {
    setSelectedHospital(hosp);
    fetchDoctorsByHospitalAndDept(hosp._id, selectedMainDept._id);
    setView('doctors');
  };

  const handleDoctorClick = (doc) => {
    setSelectedDoctor(doc);
    setView('doctor-profile');
    logBrowseActivity({ doctorId: doc._id, actionType: 'view_doctor' });
  };

  const Breadcrumbs = () => (
    <nav className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 overflow-x-auto pb-2 shrink-0">
      <button onClick={() => {setView('grid'); setSelectedMainDept(null); setSelectedSubDept(null); setSelectedHospital(null); setSelectedDoctor(null);}} className="hover:text-blue-500 transition-colors">Explorer</button>
      {selectedMainDept && (
        <>
          <ChevronRight size={12} className="opacity-30" />
          <button onClick={() => {setView('subdepts'); setSelectedSubDept(null); setSelectedHospital(null); setSelectedDoctor(null);}} className={`hover:text-blue-500 transition-colors ${view === 'subdepts' ? 'text-blue-500 underline decoration-2 underline-offset-8' : ''}`}>{selectedMainDept.name}</button>
        </>
      )}
      {selectedSubDept && (
        <>
          <ChevronRight size={12} className="opacity-30" />
          <button onClick={() => {setView('hospitals'); setSelectedHospital(null); setSelectedDoctor(null);}} className={`hover:text-blue-500 transition-colors ${view === 'hospitals' ? 'text-blue-500 underline decoration-2 underline-offset-8' : ''}`}>{selectedSubDept.name}</button>
        </>
      )}
      {selectedHospital && (
        <>
          <ChevronRight size={12} className="opacity-30" />
          <button onClick={() => {setView('doctors'); setSelectedDoctor(null);}} className={`hover:text-blue-500 transition-colors ${view === 'doctors' ? 'text-blue-500 underline decoration-2 underline-offset-8' : ''}`}>{selectedHospital.name}</button>
        </>
      )}
    </nav>
  );

  if (loading && view === 'grid') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing clinical registry...</p>
        </div>
      </div>
    );
  }

  /* ──────── LEVEL 1: GRID VIEW ──────── */
  if (view === 'grid') {
    const filteredDepts = departments.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700 w-full min-h-screen mt-20">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[0.55rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Global Registry</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Medical <span className="text-blue-500 not-italic">Explorer</span></h1>
            <p className="text-sm font-bold text-slate-500 italic">Navigate the AxonX ecosystem to find specialized clinical nodes.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-sm font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {filteredDepts.map(dept => (
            <button key={dept._id} onClick={() => handleDeptClick(dept)} className="group relative bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-[38px] bg-slate-50 dark:bg-slate-800 mb-10 overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                <img src={dept.image || 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?w=400&h=400&fit=crop'} alt={dept.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">{dept.name}</h2>
              <p className="text-xs font-bold text-slate-400 leading-relaxed mb-10 italic">{dept.description}</p>
              <div className="mt-auto flex items-center gap-3 w-full">
                 <div className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[0.6rem] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:bg-blue-500 group-hover:text-white">View Specialties</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ──────── LEVEL 2: SUB-DEPTS ──────── */
  if (view === 'subdepts') {
    const relevantSubs = subDepartments.filter(s => s.departmentId === selectedMainDept._id);
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in slide-in-from-right-10 duration-500 w-full min-h-screen mt-20">
            <Breadcrumbs />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-[48px] p-12 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]"></div>
                        <h1 className="text-5xl font-black mb-6 tracking-tighter italic">{selectedMainDept.name}</h1>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed italic opacity-80">{selectedMainDept.longDescription || 'Specialized clinical branch focusing on integrated diagnostic excellence and patient-centric healing protocols.'}</p>
                        <div className="mt-12 flex items-center gap-4 text-[0.6rem] font-black uppercase tracking-widest text-blue-400">
                             <div className="p-2 border border-blue-500/20 rounded-lg"><Stethoscope size={16} /></div>
                             Level 01 Command Center
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Core Specialty</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relevantSubs.length > 0 ? relevantSubs.map(sub => (
                             <button key={sub._id} onClick={() => handleSubDeptClick(sub)} className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-xl transition-all text-left flex justify-between items-center group">
                                <div>
                                    <h4 className="font-black text-xl text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors uppercase tracking-tight">{sub.name}</h4>
                                    <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{sub.description ? sub.description.substring(0, 40) + '...' : 'Specialized Patient Care'}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm"><ChevronRight size={18} /></div>
                             </button>
                        )) : (
                            <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center opacity-50">
                                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No specialties registered yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  /* ──────── LEVEL 3: HOSPITALS ──────── */
  if (view === 'hospitals') {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in slide-in-from-right-10 duration-500 w-full min-h-screen mt-20">
            <Breadcrumbs />
            <div className="mb-12 text-left">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">{selectedSubDept.name} <span className="text-blue-500 not-italic">Nodes</span></h1>
                <p className="text-sm font-bold text-slate-500 italic">Select a partner facility to view expert specialists.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {hospitals.map(h => (
                    <button key={h._id} onClick={() => handleHospitalClick(h)} className="group bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all text-left">
                        <div className="relative mb-8 rounded-[38px] overflow-hidden h-56 border border-slate-100 dark:border-slate-800 shadow-inner">
                            <img src={h.avatar || 'https://images.unsplash.com/photo-1587350859744-18efd5763503?w=800&h=600&fit=crop'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                            <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/90 dark:bg-slate-950/90 rounded-full text-[0.6rem] font-black text-blue-500 shadow-lg flex items-center gap-2">
                                <Star size={12} fill="currentColor" /> 4.9 RATING
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{h.name}</h3>
                        <div className="flex items-center gap-2 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-8">
                            <MapPin size={14} className="text-slate-300" /> MH, INDIA NODE
                        </div>
                        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center group-hover:border-blue-500/20">
                            <span className="text-[0.6rem] font-black text-blue-500 uppercase tracking-widest">Connect to Facility</span>
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all"><Building2 size={16} /></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
  }

  /* ──────── LEVEL 4: DOCTORS ──────── */
  if (view === 'doctors') {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in slide-in-from-right-10 duration-500 w-full min-h-screen mt-20">
            <Breadcrumbs />
            <div className="mb-12 flex justify-between items-end">
                <div className="text-left">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Verified <span className="text-blue-500">Specialists</span></h1>
                    <p className="text-sm font-bold text-slate-500 italic">Operating within {selectedHospital.name}.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {doctors.map(doc => (
                    <button key={doc._id} onClick={() => handleDoctorClick(doc)} className="group flex items-center gap-8 p-10 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-2xl transition-all shadow-sm text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[80px] -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl flex-shrink-0">
                            <img src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.username}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        </div>
                        <div className="flex-1 space-y-4 relative z-10">
                            <div>
                                <h4 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{doc.name}</h4>
                                <p className="text-[0.6rem] font-black text-blue-500 uppercase tracking-widest mt-2">{doc.role} COMMANDER</p>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-slate-50 dark:border-slate-800 group-hover:border-blue-100/10 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-[0.55rem] font-black text-slate-400 uppercase">Expertise</p>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">12+ Years</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[0.55rem] font-black text-slate-400 uppercase">Availability</p>
                                    <p className="text-xs font-bold text-emerald-500">Active Node</p>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
  }

  /* ──────── LEVEL 5: DOCTOR PROFILE ──────── */
  if (view === 'doctor-profile' && selectedDoctor) {
      const doc = selectedDoctor;
      return (
          <div className="max-w-6xl mx-auto px-6 py-12 animate-in zoom-in-95 duration-700 w-full min-h-screen mt-20">
              <Breadcrumbs />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-1 space-y-8">
                      <div className="bg-white dark:bg-slate-900 rounded-[64px] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
                          <div className="w-48 h-48 mx-auto rounded-[56px] border-[12px] border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-white mb-8 relative z-10 -mt-24 group-hover:scale-105 transition-transform duration-700">
                              <img src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.username}`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="text-center relative z-10">
                              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase underline decoration-blue-100 decoration-8 underline-offset-[12px]">{doc.name}</h2>
                              <p className="text-[0.65rem] font-black text-blue-500 uppercase tracking-[0.2em] mt-8 mb-12">{doc.role} Specialist</p>
                              
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-inner">
                                      <p className="text-[0.55rem] font-black text-slate-400 uppercase mb-2">Index Rating</p>
                                      <p className="text-xl font-black text-amber-500 italic">★ 4.9</p>
                                  </div>
                                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-inner">
                                      <p className="text-[0.55rem] font-black text-slate-400 uppercase mb-2">Practice</p>
                                      <p className="text-xl font-black text-blue-500 italic">15Y+</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="p-10 bg-slate-900 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px]"></div>
                        <h4 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 border-b border-white/5 pb-4">Facility Identity</h4>
                        <div className="flex items-center gap-5 group-hover:scale-105 transition-transform">
                            <div className="p-4 bg-white/10 rounded-2xl border border-white/10"><Building2 size={24} /></div>
                            <div>
                                <p className="text-[0.55rem] font-black text-blue-400 uppercase">Deployed At</p>
                                <p className="text-sm font-bold opacity-80">{selectedHospital.name}</p>
                            </div>
                        </div>
                      </div>
                  </div>

                  <div className="lg:col-span-2 space-y-10">
                      <div className="bg-white dark:bg-slate-900 rounded-[64px] p-16 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                          <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
                            <Info size={16} className="text-blue-500" /> Dossier Details
                          </h4>
                          <div className="space-y-12">
                              <div>
                                  <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Identity Portfolio</p>
                                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic opacity-80">
                                      "Advanced clinical practitioner specialized in {selectedMainDept.name.toLowerCase()} diagnostics and integrated patient recovery protocols using the AxonX biomedical framework."
                                  </p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-50 dark:border-slate-800">
                                  <div>
                                      <p className="text-[0.55rem] font-black text-slate-400 uppercase mb-2 ml-1">Command Email</p>
                                      <p className="text-sm font-black text-blue-500 underline underline-offset-8 decoration-blue-100">{doc.email}</p>
                                  </div>
                                  <div>
                                      <p className="text-[0.55rem] font-black text-slate-400 uppercase mb-2 ml-1">Assigned Node</p>
                                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">MH-IN-700-{doc.username.toUpperCase()}</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6">
                           <button 
                            onClick={() => isLoggedIn ? navigate(`/dashboard/${user.role}?action=book&doctorId=${doc._id}`) : navigate('/login')}
                            className="flex-1 py-6 bg-blue-600 text-white font-black rounded-[32px] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-[0.7rem] uppercase tracking-widest no-underline"
                           >
                              Secure Appointment Session
                           </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return null;
};

export default Departments;
