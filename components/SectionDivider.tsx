"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SectionDividerProps {
  text?: string;
  textColor?: 'amber' | 'blue-purple' | 'black';
  backgroundColor?: string;
  overlayGradient?: string;
  borderTop?: boolean;
  borderBottom?: boolean;
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  text = '$BUBU',
  textColor = 'black',
  backgroundColor = 'white',
  overlayGradient,
  borderTop = false,
  borderBottom = false,
}) => {
  // Create an array with many more items to avoid gaps
  const items = Array(30).fill(text);
  
  // Use white color for text
  const textColorClass = 'text-white';
  
  return (
    <div className="relative py-3 sm:py-4 md:py-6" style={{ backgroundColor }}>
      {/* Simple yellow background with borders */}
      <div className="absolute inset-0 bg-amber-500 border-y-4 border-black" />

      {/* Gradient overlay removed as requested */}
      
      {/* Marquee with Better Black Outline */}
      <div className="w-full overflow-hidden relative z-10">
        <motion.div 
          className="flex items-center gap-4 px-0"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ 
            repeat: Infinity, 
            duration: 15,
            ease: "linear"
          }}
          style={{ fontFamily: 'var(--font-press-start)' }}
        >
          {items.map((item, index) => (
            <div key={index} className="relative">
              {/* Multiple text shadows to create outline effect */}
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '-2px', top: '0px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '2px', top: '0px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '0px', top: '-2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '0px', top: '2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '-2px', top: '-2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '2px', top: '-2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '-2px', top: '2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '2px', top: '2px' }}>{item}</span>
              {/* Main text */}
              <span className={`${textColorClass} relative text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold`}>{item}</span>
            </div>
          ))}
          {items.map((item, index) => (
            <div key={`repeat-${index}`} className="relative">
              {/* Multiple text shadows to create outline effect */}
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '-2px', top: '0px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '2px', top: '0px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '0px', top: '-2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '0px', top: '2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '-2px', top: '-2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '2px', top: '-2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '-2px', top: '2px' }}>{item}</span>
              <span className="absolute text-black text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold" style={{ left: '2px', top: '2px' }}>{item}</span>
              {/* Main text */}
              <span className={`${textColorClass} relative text-sm sm:text-lg md:text-xl uppercase tracking-wide font-bold`}>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SectionDivider;
