import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [data, setData] = useState({
    users: [],
    appointments: [],
    research: [],
    events: [],
    departments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Catch individual errors so one failure doesn't ruin the whole board
      const requests = [
        axios.get('http://localhost:5000/api/users').catch(() => ({ data: { data: [] }})),
        axios.get('http://localhost:5000/api/appointments').catch(() => ({ data: { data: [] }})),
        axios.get('http://localhost:5000/api/research-papers').catch(() => ({ data: { data: [] }})),
        axios.get('http://localhost:5000/api/events').catch(() => ({ data: { data: [] }})),
        axios.get('http://localhost:5000/api/departments').catch(() => ({ data: { data: [] }}))
      ];

      const [u, a, r, e, d] = await Promise.all(requests);
      
      setData({
        users: u.data?.data || [],
        appointments: a.data?.data || [],
        research: r.data?.data || [],
        events: e.data?.data || [],
        departments: d.data?.data || []
      });
    } catch (err) {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const userGrowthByRole = () => {
    const roles = ['Doctor', 'Patient', 'Hospital', 'Researcher', 'Student'];
    return roles.map(role => {
      const target = role.toLowerCase();
      const count = data.users.filter(u => {
        const ur = (u.role || '').toLowerCase();
        return ur === target || (target === 'researcher' && ur === 'academic researcher');
      }).length;
      return { role, count };
    });
  };

  const appointmentImpact = () => {
    const statuses = ['Confirmed', 'Pending', 'Completed', 'Cancelled'];
    return statuses.map(s => {
      const target = s.toLowerCase();
      return {
        status: s,
        count: data.appointments.filter(a => (a.status || '').toLowerCase() === target).length
      };
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
         <h1 className="font-black text-4xl tracking-tight text-slate-900">
            System Analytics
         </h1>
         <p className="text-slate-500 font-medium">Advanced data insights and platform growth metrics.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Distribution */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
          <h4 className="font-black text-xl mb-8 text-slate-800">User Demographics</h4>
          <div className="flex flex-col gap-6">
             {userGrowthByRole().map((r, i) => {
               const maxCount = Math.max(data.users.length, 1);
               const pct = (r.count / maxCount) * 100;
               return (
                 <div key={i} className="flex flex-col gap-3">
                    <div className="flex justify-between text-[0.65rem] font-black uppercase text-slate-500 tracking-widest px-1">
                        <span>{r.role}s</span>
                        <span className="text-blue-600">{r.count} Registered</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                    </div>
                 </div>
               )
             })}
          </div>
        </div>

        {/* Appointment Status */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
          <h4 className="font-black text-xl mb-8 text-slate-800">Booking Lifecycle</h4>
          <div className="flex flex-col gap-6">
             {appointmentImpact().map((s, i) => {
               const maxCount = Math.max(data.appointments.length, 1);
               const pct = (s.count / maxCount) * 100;
               const colorClass = s.status === 'Completed' ? 'bg-emerald-500' : s.status === 'Cancelled' ? 'bg-rose-500' : s.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500';
               return (
                 <div key={i} className="flex flex-col gap-3">
                    <div className="flex justify-between text-[0.65rem] font-black uppercase text-slate-500 tracking-widest px-1">
                        <span>{s.status}</span>
                        <span className="text-slate-600">{s.count} Total</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className={`${colorClass} h-full transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                    </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>

      {/* Domain Spread */}
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
         <h4 className="font-black text-xl mb-8 text-slate-800">Departmental Network Load</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Depts', val: data.departments.length, icon: '🏢' },
              { label: 'Papers', val: data.research.length, icon: '📄' },
              { label: 'Events', val: data.events.length, icon: '📅' },
              { label: 'Total Logs', val: data.users.length + data.appointments.length, icon: '💾' }
            ].map((m, i) => (
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 transition-transform hover:-translate-y-1 cursor-default" key={i}>
                 <div className="text-4xl mb-3 drop-shadow-sm">{m.icon}</div>
                 <h2 className="font-black text-3xl text-slate-900 mb-1">{m.val}</h2>
                 <span className="text-slate-400 text-[0.65rem] font-black tracking-widest uppercase">{m.label}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Analytics;
