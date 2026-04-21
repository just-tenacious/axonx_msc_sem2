import React from 'react';

const features = [
  {
    title: 'Event Publishing System',
    desc: 'Hospitals and organizations can easily host, manage, and promote medical camps, webinars, and regional conferences.',
    tag: 'Events',
    image: '/images/events.png'
  },
  {
    title: 'Research Database',
    desc: 'Publish your academic findings to a global audience of medical professionals, or collaborate on groundbreaking studies.',
    tag: 'Publications',
    image: '/images/research.png'
  }
];

const FeaturesSection = () => {
  return (
    <section style={{ padding: '6rem 0' }} id="features">
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="text-center mb-20">
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }} className="text-slate-900 dark:text-white">
            Clinical{' '}
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Intelligence</span>
          </h2>
          <p style={{ fontSize: '1.125rem', maxWidth: '42rem', margin: '0 auto' }} className="text-slate-600 dark:text-slate-400">
            Advanced medical infrastructure for doctors, researchers, and healthcare institutions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
          {features.map((feat, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem 5rem',
                alignItems: 'center',
                direction: index % 2 !== 0 ? 'rtl' : 'ltr'
              }}
            >
              {/* Text */}
              <div style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(14,165,233,0.3)',
                  backgroundColor: 'rgba(14,165,233,0.1)',
                  color: '#0284c7'
                }}>
                  {feat.tag}
                </span>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: '1.5rem'
                }} className="text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }} className="text-slate-600 dark:text-slate-400">
                  {feat.desc}
                </p>
                <button style={{
                  background: 'transparent',
                  border: '1px solid rgba(203,213,225,0.8)',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} className="text-slate-900 dark:text-white hover:border-[#0ea5e9] hover:text-[#0ea5e9]">
                  Learn More
                </button>
              </div>

              {/* Image */}
              <div
                style={{
                  direction: 'ltr',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(203,213,225,0.5)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
                  aspectRatio: '4/3',
                  padding: '0.5rem'
                }}
                className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-950 border-slate-300 dark:border-slate-700"
              >
                <img
                  src={feat.image}
                  alt={feat.title}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    transition: 'transform 0.7s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
