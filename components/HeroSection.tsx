"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import AnimatedClouds from './AnimatedClouds';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = () => {
  const [showToast, setShowToast] = useState(false);
  return (
    <div className="relative w-full p-8 min-h-[100vh] flex flex-col justify-center items-center" style={{ fontFamily: 'var(--font-press-start)' }}>
      {/* Animated clouds background with dithered effect */}
      <AnimatedClouds />

      {/* Social media link in top left corner */}
      <div className="absolute top-6 left-6 z-10 hover-scale">
        <a href="https://x.com" target="_blank" rel="noopener noreferrer">
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
            width={70} 
            height={70} 
            className="text-white"
            style={{ filter: 'url(#white-outline)' }}
          />
        </a>
      </div>

      {/* Center logo with glow effect */}
      <div className="flex flex-col items-center justify-center py-16 z-10 mt-8">
        <div className="w-full max-w-2xl mb-12">
          <div className="relative">
            <Image 
              src="/bubu.svg" 
              alt="BuBu Logo" 
              width={400} 
              height={150}
              className="mx-auto relative pulse"
              priority
            />
          </div>
        </div>
        
        {/* Contract address with copy to clipboard functionality - Pixel Art Style */}
        <div className="mt-12 w-full flex flex-col items-center">
          <div 
            className="relative cursor-pointer inline-flex py-3 px-4 text-sm bg-white border-4 border-black items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
            onClick={() => {
              const contractAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
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
            <span className="text-black">
              0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
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
          
          {/* Pixel Art Style Buttons */}
          <div className="flex justify-center mt-8 gap-8">
            <button className="px-8 py-4 bg-amber-500 text-white font-bold text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 uppercase tracking-wide">
              Buy Now
            </button>
            <button className="px-8 py-4 bg-amber-500 text-white font-bold text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 uppercase tracking-wide">
              View Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
