"use client";

import React from 'react';

interface SkyBackgroundProps {
  children: React.ReactNode;
}

const SkyBackground: React.FC<SkyBackgroundProps> = ({ children }) => {
  // Generate stars with fixed positions to avoid re-rendering issues
  const stars = React.useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      const size = i % 5 === 0 ? Math.random() * 4 + 2 : Math.random() * 2 + 1;
      const top = `${Math.random() * 100}%`;
      const left = `${Math.random() * 100}%`;
      const opacity = Math.random() * 0.7 + 0.3;
      const animationDelay = `${Math.random() * 8}s`;
      const animationDuration = `${Math.random() * 3 + 2}s`;
      
      return { size, top, left, opacity, animationDelay, animationDuration, id: i };
    });
  }, []);
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Sky gradient background - super smooth blending */}
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(180deg, #3b82f6 0%, #4f90f7 20%, #60a5fa 40%, #76b5fb 60%, #8bc5fd 80%, #93c5fd 100%)',
        backgroundSize: '100% 100%'
      }} />
      
      {/* Small stars/sparkles effect */}
      <div className="absolute inset-0 z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white shadow-glow"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animation: `twinkle ${star.animationDuration} infinite ease-in-out`,
              animationDelay: star.animationDelay
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SkyBackground;
