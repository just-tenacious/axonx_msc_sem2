import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section style={{ position: 'relative', paddingTop: '12rem', paddingBottom: '10rem', overflow: 'hidden', minHeight: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '600px',
        background: 'rgba(186, 230, 253, 0.4)',
        zIndex: 0, filter: 'blur(100px)', borderRadius: '50%',
        pointerEvents: 'none'
      }} className="dark:opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative" style={{ zIndex: 1, width: '100%' }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center" style={{ gap: '4rem' }}>

          {/* Text Content */}
          <div className="flex flex-col items-start pt-10 lg:pt-0 text-left">
            {/* Badge */}


            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              letterSpacing: '-0.025em'
            }} className="text-slate-900 dark:text-white">
              <span className="opacity-70">Precision.</span> <br />
              <span style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 10px 20px rgba(14, 165, 233, 0.1))'
              }}>Intelligence.</span><br />
              AxonX.
            </h1>

            <p style={{ fontSize: '1.125rem', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '36rem' }} className="text-slate-600 dark:text-slate-400">
              Navigate the world\'s most advanced clinical discovery and medical intelligence network to find elite specialists and world-class healthcare nodes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 font-bold text-white rounded-full shadow-lg transition-all hover:-translate-y-1"
                style={{
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)'
                }}
              >
                Join Community
                <svg style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/departments"
                className="inline-flex items-center justify-center px-8 py-4 font-bold rounded-full shadow-md border border-slate-300 dark:border-slate-700 hover:-translate-y-1 transition-all bg-white/90 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                style={{ textDecoration: 'none', backdropFilter: 'blur(8px)' }}
              >
                View Departments
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div style={{ position: 'relative', width: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(52,211,153,0.2))',
              filter: 'blur(48px)', borderRadius: '24px',
              transform: 'translate(40px, 40px)', zIndex: 0,
              pointerEvents: 'none'
            }} className="dark:opacity-40" />
            <img
              src="/images/hero.png"
              alt="AxonX Neural Network"
              style={{
                position: 'relative', zIndex: 1,
                width: '100%', maxWidth: '32rem',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                transition: 'transform 0.7s ease',
                objectFit: 'cover',
                aspectRatio: '1'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
