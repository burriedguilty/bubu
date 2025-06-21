"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import AnimatedClouds from './AnimatedClouds';
import HeroSection from './HeroSection';
import SkyBackground from './SkyBackground';
import { motion, AnimatePresence } from 'framer-motion';

const Intro: React.FC = () => {
  // State to track if intro has been clicked
  const [introComplete, setIntroComplete] = useState(false);
  
  // While developing, always show the intro screen
  useEffect(() => {
    // Reset the localStorage key during development
    localStorage.removeItem('bubu_visited');
    
    // Disable scrolling while in intro mode
    if (!introComplete) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = '';
    };
  }, [introComplete]);

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
      <AnimatePresence>
        {!introComplete && (
          <motion.div 
            className="fixed inset-0 z-[100] cursor-pointer overflow-hidden bg-black" 
            onClick={handleIntroClick}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SkyBackground>
              <div className="min-h-screen flex items-center justify-center">
                {/* Animated clouds in the background */}
                <AnimatedClouds />
                
                {/* Centered large BuBu logo with animation */}
                <motion.div 
                  className="z-20 relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeOut",
                    delay: 0.3
                  }}
                >
                  <Image 
                    src="/bubu.svg" 
                    alt="BuBu Logo" 
                    width={900}  
                    height={350}
                    className="mx-auto"
                    priority
                  />
                </motion.div>
              </div>
            </SkyBackground>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always render HeroSection, but it's hidden behind the intro overlay until intro is complete */}
      <motion.div
        initial={{ opacity: introComplete ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection />
      </motion.div>
    </>
  );
};

export default Intro;
