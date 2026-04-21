import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    ChevronRight, Search, MapPin, 
    Stethoscope, Building2, Star, 
    ArrowLeft, Calendar, User, Info,
    Activity, ShieldCheck, Microscope, Heart,
    X, Clock, CalendarCheck, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api';
const IMAGE_BASE = 'http://localhost:5000';

const imgSrc = (image) => {
    if (!image) return 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?w=400&h=400&fit=crop';
    if (typeof image === 'string' && image.startsWith('http')) return image;
    return `${IMAGE_BASE}${image}`;
};

const renderDetails = (item) => {
  const sensitiveFields = ['_id', 'id', 'createdAt', 'updatedAt', '__v', 'image', 'name', 'description', 'isActive', 'avatar', 'role', 'departmentId', 'username', 'email', 'subDepartmentId', 'doctorId', 'details', 'info'];
  return Object.entries(item)
    .filter(([key, value]) => !sensitiveFields.includes(key) && value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'object' || Array.isArray(value)) return null;
      return (
        <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic opacity-60">
            {key.replace(/([A-Z])/g, ' $1').replace('_', ' ')}
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {String(value)}
          </p>
        </div>
      );
    });
};

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

  // Booking Modal State
  const [showBooking, setShowBooking] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Data States
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospSearch, setHospSearch] = useState('');
  const [hospPage, setHospPage] = useState(1);
  const hospitalsPerPage = 4;

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
      setDepartments((deptRes.data.data || []).filter(d => d.isActive !== false));
      setSubDepartments(subDeptRes.data.data || []);
      setLoading(false);
    } catch (err) {
      toast.error("Cloud sync failed. Retrying...");
      setLoading(false);
    }
  };

  const fetchHospitalsByDept = async (deptId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/users?role=hospital`);
      setHospitals(data.data || []);
      setLoading(false);
    } catch {
      toast.error("Facility lookup failed");
      setLoading(false);
    }
  };

  const fetchDoctorsByHospitalAndDept = async (hospId, deptId, subDeptId) => {
    try {
      setLoading(true);
      // Fetches doctors specifically linked to this hospital cluster node
      const { data } = await axios.get(`${BASE_URL}/users?role=doctor&hospitalId=${hospId}&departmentId=${deptId}&subDepartmentId=${subDeptId}`);
      setDoctors(data.data || []);
      setLoading(false);
    } catch {
      toast.error("Specialist lookup failed");
      setLoading(false);
    }
  };

  const fetchAvailability = async (doctorId) => {
    try {
      setLoadingAvail(true);
      const { data } = await axios.get(`${BASE_URL}/availability/doctor/${doctorId}`);
      setAvailability(data.data || []);
      setLoadingAvail(false);
    } catch {
      toast.error("Availability sync failed");
      setLoadingAvail(false);
    }
  };

  const handleDeptClick = (dept) => {
    setSelectedMainDept(dept);
    setView('subdepts');
  };

  const handleSubDeptClick = (sub) => {
    setSelectedSubDept(sub);
    fetchHospitalsByDept(selectedMainDept._id);
    setView('hospitals');
  };

  const handleHospitalClick = (hosp) => {
    setSelectedHospital(hosp);
    fetchDoctorsByHospitalAndDept(hosp._id, selectedMainDept._id, selectedSubDept._id);
    setView('doctors');
  };

  const handleDoctorClick = (doc) => {
    setSelectedDoctor(doc);
    setView('doctor-profile');
  };

  const openBookingModal = () => {
    if (!isLoggedIn) {
        toast.error("Authentication required for clinical booking.");
        navigate('/login');
        return;
    }
    setShowBooking(true);
    fetchAvailability(selectedDoctor._id);
  };

  const bookAppointment = async () => {
    if (!selectedSlot) return toast.error("Select a clinical slot window.");
    setBookingInProgress(true);
    try {
        const tid = toast.loading("Deploying clinical request...");
        await axios.post(`${BASE_URL}/appointments`, {
            patientId: user._id,
            doctorId: selectedDoctor._id,
            date: selectedSlot.date,
            time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            status: 'Pending'
        });
        toast.success("Consultation Synchronized", { id: tid });
        setShowBooking(false);
        setSelectedSlot(null);
    } catch (err) {
        toast.error(err.response?.data?.error || "Booking conflict detected.");
    }
    setBookingInProgress(false);
  };

  // Auto-scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const Breadcrumbs = () => (
    <nav className="flex items-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.25em] text-slate-400 mb-10 overflow-x-auto pb-4 shrink-0 no-scrollbar">
      <button onClick={() => {setView('grid'); setSelectedMainDept(null); setSelectedSubDept(null); setSelectedHospital(null); setSelectedDoctor(null);}} className="hover:text-blue-500 transition-colors whitespace-nowrap">Clinical Explorer</button>
      {selectedMainDept && (
        <>
          <ChevronRight size={14} className="opacity-20 shrink-0" />
          <button onClick={() => {setView('subdepts'); setSelectedSubDept(null); setSelectedHospital(null); setSelectedDoctor(null);}} className={`hover:text-blue-500 transition-colors whitespace-nowrap ${view === 'subdepts' ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : ''}`}>{selectedMainDept.name}</button>
        </>
      )}
      {selectedSubDept && (
        <>
          <ChevronRight size={14} className="opacity-20 shrink-0" />
          <button onClick={() => {setView('hospitals'); setSelectedHospital(null); setSelectedDoctor(null);}} className={`hover:text-blue-500 transition-colors whitespace-nowrap ${view === 'hospitals' ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : ''}`}>{selectedSubDept.name}</button>
        </>
      )}
      {selectedHospital && (
        <>
          <ChevronRight size={14} className="opacity-20 shrink-0" />
          <button onClick={() => {setView('doctors'); setSelectedDoctor(null);}} className={`hover:text-blue-500 transition-colors whitespace-nowrap ${view === 'doctors' ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : ''}`}>{selectedHospital.name}</button>
        </>
      )}
    </nav>
  );

  if (loading && view === 'grid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-[0.7rem] font-black text-slate-500 uppercase tracking-widest animate-pulse italic">Synchronizing Global Healthcare Nodes...</p>
        </div>
      </div>
    );
  }

  /* ──────── LEVEL 1: ENHANCED GRID VIEW ──────── */
  if (view === 'grid') {
    const filteredDepts = departments.filter(d => {
        const query = searchQuery.toLowerCase();
        const matchesMain = d.name.toLowerCase().includes(query);
        const matchesSub = subDepartments.some(s => 
            (s.departmentId?._id || s.departmentId) === d._id && 
            s.name.toLowerCase().includes(query)
        );
        return matchesMain || matchesSub;
    });

    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in duration-700 w-full min-h-screen mt-32">
        <div className="mb-24 flex flex-col items-center text-center space-y-8">
            <h1 className="text-7xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                Clinical <span className="text-blue-600 not-italic">Explorer</span>
            </h1>
            <p className="max-w-2xl text-lg font-bold text-slate-500 italic leading-relaxed">
                Navigate the AxonX ecosystem to find specialized clinical nodes and elite medical specialists across the global network.
            </p>
            
            <div className="relative max-w-xl w-full pt-4">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search Departments or Specialties..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-20 pr-8 py-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-xl text-md font-black italic tracking-tight"
                />
            </div>
        </div>

        {filteredDepts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredDepts.map(dept => (
              <button key={dept._id} onClick={() => handleDeptClick(dept)} className="group relative bg-white dark:bg-slate-900 rounded-[56px] border border-transparent dark:border-slate-800/50 hover:border-blue-500/50 hover:shadow-[0_48px_80px_-24px_rgba(37,99,235,0.25)] hover:-translate-y-4 transition-all duration-700 overflow-hidden text-left flex flex-col h-[500px] shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="relative h-[260px] w-full overflow-hidden">
                  <img src={imgSrc(dept.image)} alt={dept.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                </div>
                <div className="p-10 flex-1 flex flex-col justify-center">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-none group-hover:text-blue-600 transition-colors uppercase italic">{dept.name}</h2>
                  <p className="text-[0.85rem] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {dept.description || "Digital nodal node assigned for clinical expertise."}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-40 bg-white dark:bg-slate-900 rounded-[72px] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-8">
              <Search size={40} className="text-slate-300 animate-pulse" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">Zero Nodes Detected</h3>
          </div>
        )}
      </div>
    );
  }

  /* ──────── LEVEL 2: DETAILED SUB-DEPTS ──────── */
  if (view === 'subdepts') {
    const relevantSubs = subDepartments.filter(s => (s.departmentId?._id || s.departmentId) === selectedMainDept._id);
    return (
        <div className="max-w-7xl mx-auto px-6 py-20 animate-in slide-in-from-bottom-10 duration-700 w-full min-h-screen mt-32 text-left">
            <Breadcrumbs />
            <div className="bg-slate-900 dark:bg-black rounded-[72px] p-16 md:p-24 text-white mb-20 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h1 className="text-7xl font-black tracking-tighter italic leading-none">{selectedMainDept.name}</h1>
                        <p className="text-lg font-bold text-slate-400 leading-relaxed italic border-l-4 border-blue-600 pl-8">{selectedMainDept.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{renderDetails(selectedMainDept)}</div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {relevantSubs.map(sub => (
                    <button key={sub._id} onClick={() => handleSubDeptClick(sub)} className="group relative bg-white dark:bg-slate-900 rounded-[56px] border border-transparent dark:border-slate-800/50 hover:border-blue-500/50 hover:shadow-2xl hover:-translate-y-4 transition-all duration-700 overflow-hidden text-left flex flex-col h-[500px]">
                        <div className="relative h-[260px] w-full overflow-hidden">
                            <img src={imgSrc(sub.image)} alt={sub.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="p-10 flex-1 flex flex-col justify-center">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-none group-hover:text-blue-600 transition-colors uppercase italic">{sub.name}</h2>
                            <p className="text-[0.85rem] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-2">{sub.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
  }

  /* ──────── LEVEL 3: HOSPITALS ──────── */
  if (view === 'hospitals') {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20 animate-in slide-in-from-right-10 duration-700 w-full min-h-screen mt-32 text-left">
            <Breadcrumbs />
            <div className="grid lg:grid-cols-3 gap-16 items-start">
                <div className="lg:col-span-1 sticky top-32">
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-10">
                        <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-lg"><Microscope size={32} /></div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{selectedSubDept.name}</h1>
                        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 space-y-4">{renderDetails(selectedSubDept)}</div>
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {hospitals.map(h => (
                        <button key={h._id} onClick={() => handleHospitalClick(h)} className="group bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 p-8 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 text-left overflow-hidden">
                            <div className="relative mb-10 rounded-[42px] overflow-hidden h-60 border border-slate-50 dark:border-slate-800"><img src={imgSrc(h.avatar)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={h.name} /></div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">{h.name}</h3>
                            <div className="flex items-center gap-2 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest"><MapPin size={16} className="text-blue-500" /> SYNCED HUB</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  /* ──────── LEVEL 4: SPECIALISTS ──────── */
  if (view === 'doctors') {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20 animate-in slide-in-from-right-10 duration-700 w-full min-h-screen mt-32 text-left">
            <Breadcrumbs />
            <div className="mb-20 space-y-6">
                <h1 className="text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Verified <span className="text-blue-600 not-italic">Specialists</span></h1>
                <p className="text-lg font-bold text-slate-500 italic max-w-xl">Elite medical practitioners operating within the {selectedHospital.name} hub.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {doctors.map(doc => (
                    <button key={doc._id} onClick={() => handleDoctorClick(doc)} className="group p-10 bg-white dark:bg-slate-900 rounded-[64px] border border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 flex items-center gap-12 text-left relative overflow-hidden">
                        <div className="w-40 h-40 rounded-[48px] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-2xl flex-shrink-0 group-hover:rotate-3 transition-transform duration-1000"><img src={imgSrc(doc.avatar)} className="w-full h-full object-cover" alt={doc.name} /></div>
                        <div className="flex-1 space-y-6 relative z-10">
                            <h4 className="font-black text-4xl text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{doc.name}</h4>
                            <div className="flex flex-wrap gap-2">
                                <div className="inline-flex px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[0.55rem] font-black text-blue-600 uppercase tracking-widest">{doc.role} Specialist</div>
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
          <div className="max-w-6xl mx-auto px-6 py-24 animate-in zoom-in-95 duration-700 w-full min-h-screen mt-32 text-left relative">
              <Breadcrumbs />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-1 space-y-10">
                      <div className="bg-white dark:bg-slate-900 rounded-[72px] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-br from-blue-600 to-indigo-800"></div>
                          <div className="w-56 h-56 mx-auto rounded-[64px] border-[16px] border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-white mb-10 relative z-10 -mt-28 group-hover:scale-105 transition-transform duration-700"><img src={imgSrc(doc.avatar)} className="w-full h-full object-cover" alt={doc.name} /></div>
                          <div className="text-center relative z-10">
                              <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{doc.name}</h2>
                              <p className="text-[0.7rem] font-black text-blue-500 uppercase tracking-[0.3em] mt-10 mb-12">{doc.role} Specialist</p>
                              <div className="grid grid-cols-2 gap-6">
                                  <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner"><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-2 italic">RANK</p><p className="text-2xl font-black text-amber-500">★ 4.9</p></div>
                                  <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner"><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-2 italic">NODES</p><p className="text-2xl font-black text-blue-600">800+</p></div>
                              </div>
                          </div>
                      </div>
                      <div className="p-12 bg-slate-900 rounded-[64px] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <h4 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-500 mb-10 border-b border-white/5 pb-6">Clinical Home Node</h4>
                        <div className="flex items-center gap-6"><div className="p-5 bg-white/5 rounded-3xl border border-white/10"><Building2 size={24} className="text-blue-400" /></div><div><p className="text-[0.5rem] font-black text-slate-500 uppercase">Deployed Hub</p><p className="text-lg font-black tracking-tight">{selectedHospital.name}</p></div></div>
                      </div>
                  </div>

                  <div className="lg:col-span-2 space-y-12">
                      <div className="bg-white dark:bg-slate-900 rounded-[72px] p-16 border border-slate-100 dark:border-slate-800 shadow-xl text-left relative overflow-hidden">
                          <h4 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-16 flex items-center gap-6"><Info size={20} className="text-blue-600" /> Specialist Dossier</h4>
                          <div className="space-y-16">
                              <div><p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-6 ml-1 italic opacity-60">Professional Mandate</p><p className="text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-bold italic border-l-8 border-blue-600 pl-10">"Advanced clinical practitioner specialized in {selectedMainDept.name.toLowerCase()} diagnostics within the AxonX medical nexus."</p></div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-16 border-t border-slate-100 dark:border-slate-800">
                                  <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-3 ml-1 italic">Contact Address</p><p className="text-lg font-black text-blue-600 underline underline-offset-8 decoration-blue-100">{doc.email}</p></div>
                                  <div><p className="text-[0.6rem] font-black text-slate-400 uppercase mb-3 ml-1 italic">Digital Node ID</p><p className="text-lg font-black text-slate-900 dark:text-white uppercase">AX-NODE-{doc.username.toUpperCase()}</p></div>
                              </div>
                              <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border border-slate-100 dark:border-slate-800"><h5 className="text-[0.6rem] font-black text-slate-400 mb-4 italic uppercase">Extended Clinical Data</h5><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderDetails(doc)}</div></div>
                          </div>
                      </div>
                      <button onClick={openBookingModal} className="w-full py-10 bg-blue-600 text-white font-black rounded-[48px] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 hover:bg-blue-700 transition-all text-sm uppercase tracking-[0.3em]">
                        Initiate Consultation Protocol
                      </button>
                  </div>
              </div>

              {/* BOOKING MODAL */}
              {showBooking && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                      <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[64px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                          <div className="p-10 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Clinical Scheduling</h3>
                              <button onClick={() => setShowBooking(false)} className="p-3 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
                          </div>
                          <div className="p-12 overflow-y-auto space-y-10 text-left no-scrollbar">
                              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800">
                                  <div className="w-20 h-20 rounded-[24px] overflow-hidden shadow-xl"><img src={imgSrc(selectedDoctor.avatar)} className="w-full h-full object-cover" alt="" /></div>
                                  <div>
                                      <p className="text-[0.6rem] font-black text-blue-500 uppercase tracking-widest mb-1">Target Specialist</p>
                                      <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">{selectedDoctor.name}</h4>
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  <h5 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-4">Available Temporal Slots</h5>
                                  {loadingAvail ? (
                                      <div className="py-20 flex justify-center"><Clock className="animate-spin text-blue-500" size={32} /></div>
                                  ) : availability.length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {availability.map(slot => (
                                              <button key={slot._id} onClick={() => setSelectedSlot(slot)} className={`p-6 rounded-[32px] border-2 text-left transition-all group ${selectedSlot?._id === slot._id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-500'}`}>
                                                  <div className="flex items-center gap-3 mb-2">
                                                      <Calendar size={14} className={selectedSlot?._id === slot._id ? 'text-white' : 'text-blue-500'} />
                                                      <span className="text-xs font-black uppercase">{new Date(slot.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                      <Clock size={14} className={selectedSlot?._id === slot._id ? 'text-white' : 'text-blue-500'} />
                                                      <span className="text-sm font-black italic">{slot.startTime} - {slot.endTime}</span>
                                                  </div>
                                              </button>
                                          ))}
                                      </div>
                                  ) : (
                                      <div className="py-20 bg-slate-50 dark:bg-slate-900 rounded-[48px] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                          <p className="text-slate-400 font-bold italic">"Synchronized availability void for this specialist node."</p>
                                      </div>
                                  )}
                              </div>

                              <button 
                                disabled={!selectedSlot || bookingInProgress}
                                onClick={bookAppointment}
                                className="w-full py-8 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-blue-600 disabled:opacity-40 transition-all flex items-center justify-center gap-4"
                              >
                                {bookingInProgress ? 'Synchronizing Cluster...' : 'Verify & Book Consultation'} <Send size={18} />
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  return null;
};

export default Departments;
