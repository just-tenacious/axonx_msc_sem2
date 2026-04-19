import React from 'react';

const Logo = ({ className = "h-10", showText = false }) => {
    // Reverting to use only LIGHT MODE logo as requested everywhere
    const logoSrc = '/light-mode.png';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img 
                src={logoSrc} 
                alt="AxonX Logo" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                    e.target.style.display = 'none'; 
                }}
            />
            {showText && (
                <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter leading-none text-[var(--text-main)]">
                        Axon<span className="text-[#0ea5e9]">X</span>
                    </span>
                    <span className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        Healthcare System
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
