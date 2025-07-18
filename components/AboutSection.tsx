"use client";

import Image from 'next/image';
import React, { useState } from 'react';

const AboutSection = () => {
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    { icon: '🔒', title: 'Safe & Secure', description: 'Liquidity locked, contract renounced' },
    { icon: '🚀', title: 'Moon Potential', description: '100x growth potential with strong community' },
    { icon: '🧹', title: 'Cleaning Meme', description: 'First cleaning-themed meme coin in the space' },
    { icon: '💰', title: 'Tokenomics', description: '2% buy/sell tax, 50% burned at launch' },
  ];

  return (
    <div className="w-full py-24 sm:py-32 md:py-48 lg:py-64 relative z-10 min-h-screen overflow-hidden">
      {/* Hand image positioned absolutely to the section */}
      <div className="absolute right-0 bottom-0 z-20 w-[45%] sm:w-[40%] md:w-[35%] lg:w-[30%]">
        <Image 
          src="/hand.svg" 
          alt="Hand" 
          width={900} 
          height={900}
          className="block w-full h-auto"
          style={{ transform: 'translateX(20%)' }}
          priority
        />
      </div>
      {/* Removed max-width constraint to allow full width usage */}
      <div className="w-full">
        <div className="text-center mb-16 sm:mb-20 md:mb-32 relative">
          <div className="inline-flex items-center flex-wrap justify-center">
            {/* ABOUT with amber color and black outline */}
            <div className="inline-block">
              <h2 className="text-4xl md:text-5xl uppercase tracking-wide font-bold relative" style={{ fontFamily: 'var(--font-press-start)' }}>
                {/* Black outline effect */}
                <span className="absolute text-black" style={{ left: '-2px', top: '0' }}>ABOUT</span>
                <span className="absolute text-black" style={{ left: '2px', top: '0' }}>ABOUT</span>
                <span className="absolute text-black" style={{ left: '0', top: '-2px' }}>ABOUT</span>
                <span className="absolute text-black" style={{ left: '0', top: '2px' }}>ABOUT</span>
                <span className="absolute text-black" style={{ left: '-2px', top: '-2px' }}>ABOUT</span>
                <span className="absolute text-black" style={{ left: '2px', top: '-2px' }}>ABOUT</span>
                <span className="absolute text-black" style={{ left: '-2px', top: '2px' }}>ABOUT</span>
                <span className="absolute text-black" style={{ left: '2px', top: '2px' }}>ABOUT</span>
                
                {/* Diagonal shadow to the right */}
                <span className="absolute text-black" style={{ left: '6px', top: '6px' }}>ABOUT</span>
                
                {/* Main amber text */}
                <span className="relative z-10 text-amber-500">ABOUT</span>
              </h2>
            </div>
            
            {/* BUBU with amber color and black outline - in the same line */}
            <div className="inline-block ml-4">
              <h2 className="text-4xl md:text-5xl uppercase tracking-wide font-bold relative" style={{ fontFamily: 'var(--font-press-start)' }}>
                {/* Black outline effect */}
                <span className="absolute text-black" style={{ left: '-2px', top: '0' }}>BUBU</span>
                <span className="absolute text-black" style={{ left: '2px', top: '0' }}>BUBU</span>
                <span className="absolute text-black" style={{ left: '0', top: '-2px' }}>BUBU</span>
                <span className="absolute text-black" style={{ left: '0', top: '2px' }}>BUBU</span>
                <span className="absolute text-black" style={{ left: '-2px', top: '-2px' }}>BUBU</span>
                <span className="absolute text-black" style={{ left: '2px', top: '-2px' }}>BUBU</span>
                <span className="absolute text-black" style={{ left: '-2px', top: '2px' }}>BUBU</span>
                <span className="absolute text-black" style={{ left: '2px', top: '2px' }}>BUBU</span>
                
                {/* Diagonal shadow to the right */}
                <span className="absolute text-black" style={{ left: '6px', top: '6px' }}>BUBU</span>
                
                {/* Main amber text */}
                <span className="relative z-10 text-amber-500">BUBU</span>
              </h2>
            </div>
          </div>
        </div>
        
        {/* Changed to allow more flexible layout with more space for images */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="w-full md:w-3/5 mb-12 md:mb-0">
            {/* Pixel art style card with black border */}
            <div className="relative ml-4 sm:ml-8 md:ml-12 bg-amber-500 p-4 sm:p-6 md:p-8 border-4 border-black">
              {/* Black shadow for 3D effect */}
              <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 -z-10"></div>
              
              {/* Card content */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 relative" style={{ fontFamily: 'var(--font-press-start)' }}>
                {/* Black outline effect */}
                <span className="absolute text-black" style={{ left: '-2px', top: '0' }}>The BUBU Story</span>
                <span className="absolute text-black" style={{ left: '2px', top: '0' }}>The BUBU Story</span>
                <span className="absolute text-black" style={{ left: '0', top: '-2px' }}>The BUBU Story</span>
                <span className="absolute text-black" style={{ left: '0', top: '2px' }}>The BUBU Story</span>
                <span className="absolute text-black" style={{ left: '-2px', top: '-2px' }}>The BUBU Story</span>
                <span className="absolute text-black" style={{ left: '2px', top: '-2px' }}>The BUBU Story</span>
                <span className="absolute text-black" style={{ left: '-2px', top: '2px' }}>The BUBU Story</span>
                <span className="absolute text-black" style={{ left: '2px', top: '2px' }}>The BUBU Story</span>
                
                {/* Diagonal shadow to the right */}
                <span className="absolute text-black" style={{ left: '6px', top: '6px' }}>The BUBU Story</span>
                
                {/* Main white text */}
                <span className="relative z-10 text-white">The BUBU Story</span>
              </h3>
              
              {/* Description field with pixel art border */}
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 -z-10"></div>
                <div 
                  className="w-full h-48 sm:h-56 md:h-72 p-3 sm:p-4 md:p-6 border-4 border-black bg-amber-100 text-black overflow-y-auto"
                  style={{ fontFamily: 'var(--font-press-start)' }}
                >
                  <p className="text-xs sm:text-sm leading-relaxed">
                    BUBU is a revolutionary cleaning meme coin designed to transform the crypto space! Born from the idea that the crypto market needs some cleaning up, BUBU combines humor with real utility.
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed mt-2 sm:mt-4">
                    With innovative tokenomics and a strong community focus, BUBU aims to sweep away the competition and mop up the floor with other meme coins. Join the cleaning revolution today!
                  </p>
                </div>
              </div>
              
              {/* Action button */}
              <div className="flex justify-center mt-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>
                  <button className="relative z-10 bg-amber-100 border-4 border-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-black font-bold uppercase text-xs sm:text-sm" style={{ fontFamily: 'var(--font-press-start)' }}>
                    FOLLOW ME
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Image section - adjusted width */}
          <div className="w-full md:w-2/5 relative">
            {/* Space for additional content if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
