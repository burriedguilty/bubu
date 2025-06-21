"use client";

import React from 'react';

const MarqueeText = () => {
  // Create an array with multiple $BUBU items
  const bubuItems = Array(15).fill('$BUBU');

  return (
    <div className="w-full overflow-hidden py-6 bg-white">
      <div className="animate-marquee flex items-center gap-16 font-display text-3xl tracking-widest">
        {bubuItems.map((item, index) => (
          <span key={index} className="whitespace-nowrap">
            <span className="text-green-500 drop-shadow-md">{item}</span>
          </span>
        ))}
        {bubuItems.map((item, index) => (
          <span key={`repeat-${index}`} className="whitespace-nowrap">
            <span className="text-yellow-500 drop-shadow-md">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeText;
