import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import RoleTargetSection from '../components/landing/RoleTargetSection';

const Home = () => {
  return (
    <div className="bg-[var(--bg-color)] animate-in fade-in duration-1000">
      <HeroSection />
      <FeaturesSection />
      <RoleTargetSection />
      
      {/* Quick CTA section */}
      <section className="py-24 max-w-7xl mx-auto px-8 w-full">
        <div className="p-16 rounded-[48px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl text-center">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
                <h2 className="text-5xl font-black tracking-tighter uppercase">Ready to join the Hub?</h2>
                <p className="text-xl font-bold opacity-80 max-w-2xl mx-auto italic">Integrate your medical career or healthcare journey into the most advanced neural diagnostic community.</p>
                <div className="pt-8 flex justify-center gap-6">
                    <a href="/register" className="px-10 py-5 bg-white text-blue-600 font-black rounded-full shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs">Get Started Now</a>
                    <a href="/about" className="px-10 py-5 border-2 border-white/20 text-white font-black rounded-full hover:bg-white/10 transition-all uppercase tracking-widest text-xs">Learn the Protocol</a>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
