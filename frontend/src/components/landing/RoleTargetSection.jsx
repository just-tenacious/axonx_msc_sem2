import React from 'react';

const roles = [
  { id: 'students', title: 'Medical Students', desc: 'Find study partners, access exclusive academic resources, and connect with mentors.', icon: '🎓' },
  { id: 'patients', title: 'Patients', desc: 'Join support groups, seek expert opinions, and track local health events.', icon: '❤️' },
  { id: 'doctors', title: 'Doctors', desc: 'Expand your medical network, discuss complex cases, and share your expertise.', icon: '🩺' },
  { id: 'research', title: 'Researchers', desc: 'Publish papers, find collaboration opportunities, and gather data for studies.', icon: '🔬' },
  { id: 'hospitals', title: 'Hospitals', desc: 'Host events, recruit talent, and communicate with the local community directly.', icon: '🏥' }
];

const RoleTargetSection = () => {
  return (
    <section style={{ padding: '6rem 0' }} id="community">
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="text-center mb-16">
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }} className="text-slate-900 dark:text-white">
            Who is{' '}
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>AxonX</span>{' '}For?
          </h2>
          <p style={{ fontSize: '1.125rem', maxWidth: '42rem', margin: '0 auto' }} className="text-slate-600 dark:text-slate-400">
            A unified ecosystem designed specifically to bridge the gap between all members of the healthcare community.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
          {roles.map(role => (
            <div
              key={role.id}
              style={{
                width: '100%',
                maxWidth: '22rem',
                flex: '0 1 calc(33.333% - 2rem)',
                minWidth: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(203,213,225,0.5)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 40px rgba(148,163,184,0.1)'
              }}
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:-translate-y-2"
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1.5rem',
                width: '5rem',
                height: '5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1px solid rgba(203,213,225,0.6)',
                transition: 'all 0.3s'
              }} className="bg-slate-100 dark:bg-slate-700/50">
                {role.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }} className="text-slate-900 dark:text-white uppercase tracking-tight">
                {role.title}
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }} className="text-slate-600 dark:text-slate-400 font-medium">
                {role.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleTargetSection;
