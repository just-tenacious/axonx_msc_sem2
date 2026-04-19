import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import RoleTargetSection from '../components/landing/RoleTargetSection';

const Home = () => {
  return (
    <div className="bg-[var(--bg-color)] animate-in fade-in duration-1000">
      <HeroSection />
      <RoleTargetSection />
      <FeaturesSection />
      

    </div>
  );
};

export default Home;
