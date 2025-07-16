"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import AnimatedClouds from './AnimatedClouds';
import HeroSection from './HeroSection';
import SkyBackground from './SkyBackground';
import { motion, AnimatePresence } from 'framer-motion';

const Intro: React.FC = () => {
  // State to track if intro has been clicked
  const [introComplete, setIntroComplete] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Handle component mount
  useEffect(() => {
    setMounted(true);
    
    // For development, always set as visited
    localStorage.setItem('bubu_visited', 'true');
    
    // Check if user has visited before
    const hasVisited = localStorage.getItem('bubu_visited') === 'true';
    if (hasVisited) {
      setIntroComplete(true);
    }
    
    // Disable scrolling while in intro mode
    if (!hasVisited) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = '';
    };
  }, []);

  // Handle click on the intro screen
  const handleIntroClick = () => {
    console.log('Intro clicked, transitioning to HeroSection');
    // Re-enable scrolling
    document.body.style.overflow = '';
    // Set intro as complete
    setIntroComplete(true);
    localStorage.setItem('bubu_visited', 'true');
  };

  return (
    <>
      {/* Intro overlay - only shown when intro is not complete */}
      {mounted && !introComplete && (
        <div className="fixed inset-0 z-[100] cursor-pointer overflow-hidden bg-black" onClick={handleIntroClick}>
          <SkyBackground>
            <div className="min-h-screen flex items-center justify-center">
              {/* Animated clouds in the background */}
              <AnimatedClouds />
              
              {/* Centered large BuBu logo with animation */}
              <div className="z-20 relative w-full px-4 sm:px-8 md:px-12 animate-fadeIn">
                <Image 
                  src="/bubu.svg" 
                  alt="BuBu Logo" 
                  width={900}  
                  height={350}
                  className="mx-auto w-full max-w-[300px] sm:max-w-[450px] md:max-w-[600px] lg:max-w-[900px] h-auto animate-scaleIn"
                  priority
                />
              </div>
            </div>
          </SkyBackground>
        </div>
      )}

      {/* Always render HeroSection */}
      <div style={{ display: mounted && !introComplete ? 'none' : 'block' }}>
        <HeroSection />
      </div>
    </>
  );
};

export default Intro;
