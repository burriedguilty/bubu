"use client";

import React from 'react';

interface CloudDividerProps {
  position?: 'top' | 'bottom';
  color?: string;
}

const CloudDivider: React.FC<CloudDividerProps> = ({ 
  position = 'bottom',
  color = 'white'
}) => {
  return (
    <div className={`relative w-full h-20 overflow-hidden ${position === 'top' ? 'transform rotate-180' : ''}`}>
      {/* Base cloud fill */}
      <div 
        className="absolute bottom-0 w-full h-1/2"
        style={{ backgroundColor: color }}
      ></div>
      
      {/* Rounded cloud bumps - dengan ukuran yang lebih bervariasi */}
      <div className="absolute bottom-[40%] left-[2%] w-[12%] h-[70%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[30%] left-[12%] w-[10%] h-[80%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[25%] left-[20%] w-[15%] h-[90%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[20%] left-[33%] w-[10%] h-[85%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[28%] left-[42%] w-[13%] h-[75%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[22%] left-[54%] w-[11%] h-[85%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[25%] left-[64%] w-[14%] h-[80%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[30%] left-[77%] w-[10%] h-[70%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[35%] left-[86%] w-[12%] h-[65%] rounded-[50%] blur-[1px]" style={{ backgroundColor: color }}></div>
      
      {/* Lapisan awan kedua untuk kedalaman */}
      <div className="absolute bottom-[20%] left-[7%] w-[9%] h-[60%] rounded-[50%] blur-[2px] opacity-90" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[15%] left-[25%] w-[11%] h-[70%] rounded-[50%] blur-[2px] opacity-90" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[10%] left-[48%] w-[13%] h-[75%] rounded-[50%] blur-[2px] opacity-90" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[15%] left-[70%] w-[10%] h-[65%] rounded-[50%] blur-[2px] opacity-90" style={{ backgroundColor: color }}></div>
    </div>
  );
};

export default CloudDivider;
