"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import AnimatedClouds from './AnimatedClouds';
import { motion, AnimatePresence } from 'framer-motion';
import PfpMakerModal from './PfpMakerModal';
import { CONTRACT_ADDRESS } from './contract';

const HeroSection = () => {
  // Ref for measuring button height
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scrollIndicatorMargin, setScrollIndicatorMargin] = useState('2.2rem'); // default margin if button hidden

  const [showToast, setShowToast] = useState(false);
  // State for delayed scroll indicator appearance
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  // State for fading out the Create PFP button
  const [showHeroButton, setShowHeroButton] = useState(true);
  // State for scroll indicator opacity
  const [scrollOpacity, setScrollOpacity] = useState(1);
  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to the next section
  const scrollToNextSection = () => {
    // Find the section divider or about section
    const nextSection = document.querySelector('.section-divider, #about-section');
    
    if (nextSection) {
      // Smooth scroll to the next section
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll down 100vh if section not found
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };
  
  useEffect(() => {
    // Update scrollIndicatorMargin whenever button visibility changes
    const updateMargin = () => {
      if (buttonRef.current && showHeroButton) {
        setScrollIndicatorMargin(`${buttonRef.current.offsetHeight + 18}px`); // 18px = spacing
      } else {
        setScrollIndicatorMargin('2.2rem'); // fallback margin
      }
    };
    updateMargin();
  }, [showHeroButton]);

  useEffect(() => {
    // Show scroll indicator after 1 second
    const timer = setTimeout(() => {
      setShowScrollIndicator(true);
    }, 1000);
    // Handle scroll event to fade out indicator and button
    const handleScroll = () => {
      if (window.scrollY > 50) {
        // Fade out scroll indicator
        const newOpacity = Math.max(0, 1 - (window.scrollY - 50) / 150);
        setScrollOpacity(newOpacity);
        // Fade out hero button
        setShowHeroButton(false);
      } else {
        setScrollOpacity(1);
        setShowHeroButton(true);
      }
    };
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 md:p-8" style={{ fontFamily: 'var(--font-press-start)' }}>
      {/* Animated clouds background with dithered effect */}
      <AnimatedClouds />

      {/* Social media links in top left corner */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-4">
        {/* X Social Media */}
        <div className="hover-scale">
          <a href="https://x.com/BubuTheLilBoy" target="_blank" rel="noopener noreferrer">
            {/* SVG filter definition for white outline */}
            <svg width="0" height="0" className="absolute">
              <filter id="white-outline" x="-20%" y="-20%" width="140%" height="140%">
                <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thicken" />
                <feFlood floodColor="white" result="white" />
                <feComposite in="white" in2="thicken" operator="in" result="whiteOutline" />
                <feComposite in="SourceGraphic" in2="whiteOutline" operator="over" />
              </filter>
            </svg>
            
            <Image 
              src="/X.svg" 
              alt="X Social Media" 
              width={50} 
              height={50} 
              className="text-white sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px]"
              style={{ filter: 'url(#white-outline)' }}
            />
          </a>
        </div>
      </div>

      {/* HERO CONTENT GROUPED */}
      <div className="flex flex-col justify-center items-center w-full max-w-2xl mx-auto flex-1">
        {/* Logo */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl mb-8 md:mb-12">
          <div className="relative">
            <Image 
              src="/bubu.svg" 
              alt="BuBu Logo" 
              width={400} 
              height={150}
              className="mx-auto relative pulse w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Contract address with copy to clipboard functionality - Pixel Art Style */}
        <div className="w-full flex flex-col items-center mb-6">
          <div 
            className="relative cursor-pointer inline-flex py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm bg-white border-4 border-black items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 max-w-full overflow-hidden mb-6"
            onClick={() => {
              const contractAddress = CONTRACT_ADDRESS;
              navigator.clipboard.writeText(contractAddress)
                .then(() => {
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                })
                .catch(err => {
                  console.error('Failed to copy: ', err);
                });
            }}
          >
            <span className="text-black text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[250px] md:max-w-full">
              {CONTRACT_ADDRESS}
            </span>
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          {/* Pixel Art Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div 
                className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 bg-white border-4 border-black py-3 px-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-black text-xs">Address Copied!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create PFP Button */}
        <div 
          ref={buttonRef}
          className="w-full max-w-xs mb-8 z-30 relative"
          style={{
            opacity: showHeroButton ? 1 : 0,
            pointerEvents: showHeroButton ? 'auto' : 'none',
            transition: 'opacity 0.5s cubic-bezier(0.4,0,0.2,1)'
          }}
        >
          <PfpMakerModal 
            buttonText="Create PFP"
            buttonClassName="px-6 sm:px-8 py-3 sm:py-4 bg-amber-500 text-white font-bold text-xs sm:text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 uppercase tracking-wide w-full"
            modalClassName="bg-amber-500 border-4 border-black p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto"
            width={320}
            onSave={(dataUrl) => {
              // You can handle the saved dataUrl here
              console.log('PFP saved:', dataUrl);
              // You could use this dataUrl to display the image or upload it
            }}
          />
        </div>

        {/* SCROLL DOWN indicator always below button, with fixed spacing */}
        {showScrollIndicator && (
          <div 
            className="flex flex-col items-center mb-8 cursor-pointer animate-fadeIn"
            style={{ 
              opacity: scrollOpacity, 
              transition: 'opacity 0.5s cubic-bezier(0.4,0,0.2,1)' 
            }}
            onClick={scrollToNextSection}
            role="button"
            tabIndex={0}
            aria-label="Scroll to next section"
          >
            <div className="mb-2 animate-blink">
              <p className="text-black font-bold text-xs sm:text-sm uppercase tracking-widest">SCROLL DOWN</p>
            </div>
            <div className="animate-bounce-slow">
              <div className="w-10 h-10 relative">
                <svg width="40" height="40" viewBox="0 0 24 24" className="fill-amber-500 stroke-black stroke-[2px] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <path d="M12 20L4 12H9V4H15V12H20L12 20Z" />
                </svg>
                <div className="absolute inset-0 animate-pulse-fast opacity-50">
                  <svg width="40" height="40" viewBox="0 0 24 24" className="fill-amber-400 stroke-black stroke-[2px]">
                    <path d="M12 20L4 12H9V4H15V12H20L12 20Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
