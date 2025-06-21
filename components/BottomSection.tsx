"use client";

import Image from 'next/image';
import React from 'react';
import AnimatedClouds from './AnimatedClouds';

const BottomSection = () => {
  // Create an array of money drops with random positions and delays
  const moneyDrops = Array.from({ length: 15 }, (_, index) => {
    const leftPosition = Math.floor(Math.random() * 90) + 5; // 5% to 95%
    const animationDelay = Math.random() * 10; // 0 to 10s delay
    const animationDuration = 12 + Math.random() * 10; // 12-22s duration (longer for taller area)
    const size = 60 + Math.floor(Math.random() * 60); // 60-120px (larger size)
    
    return { id: index, leftPosition, animationDelay, animationDuration, size };
  });
  
  return (
    <footer className="w-full py-96 min-h-[200vh] relative z-10 overflow-visible">
      {/* Single cloud layer covering the entire section */}
      <div className="absolute inset-0 z-5">
        <AnimatedClouds />
      </div>
      
      {/* Combined styles for all animations */}
      <style jsx global>{`
        /* Money falling animation */
        @keyframes fall {
          0% { 
            transform: translateY(-100px); 
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          20% { 
            transform: translateY(40vh) translateX(100px); 
          }
          40% { 
            transform: translateY(80vh) translateX(-100px); 
          }
          60% { 
            transform: translateY(120vh) translateX(80px); 
          }
          80% { 
            transform: translateY(160vh) translateX(-50px); 
            opacity: 1;
          }
          95% {
            opacity: 0.5;
          }
          100% { 
            transform: translateY(200vh) translateX(30px); 
            opacity: 0;
          }
        }
        
        .money-drop {
          position: absolute;
          top: -100px;
          z-index: 5;
          will-change: transform;
        }
        
        /* Character floating animation */
        @keyframes float {
          0% { transform: translateY(0px) translateX(-50%); }
          50% { transform: translateY(-15px) translateX(-50%); }
          100% { transform: translateY(0px) translateX(-50%); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* White aura effect */
        .white-aura {
          position: relative;
        }
        
        .white-aura::before {
          content: '';
          position: absolute;
          top: -20px;
          left: -20px;
          right: -20px;
          bottom: -20px;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: -1;
          mix-blend-mode: overlay;
        }
      `}</style>
      
      {/* Render money drops */}
      {moneyDrops.map((drop) => (
        <div 
          key={drop.id}
          className="money-drop"
          style={{
            left: `${drop.leftPosition}%`,
            animation: `fall ${drop.animationDuration}s ease-in-out ${drop.animationDelay}s infinite`,
            width: `${drop.size}px`,
            height: `${drop.size}px`,
          }}
        >
          <Image 
            src="/moneydrop.svg"
            alt="Money"
            width={drop.size}
            height={drop.size}
            style={{ 
              width: '150%',
              height: '150%',
            }}
          />
        </div>
      ))}
      
      {/* Additional content area */}
      <div className="max-w-7xl mx-auto px-8 h-full flex flex-col justify-center">
        <div className="mb-80">
          {/* Empty space for future content */}
        </div>
      </div>
      
      {/* Character image positioned above the hill with levitation effect */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 z-10 animate-float" 
        style={{ bottom: '25%' }}
      >
        <div className="white-aura">
          <Image 
            src="/char.svg" 
            alt="Character" 
            width={500}
            height={500}
            className="h-auto" 
            style={{ 
              display: 'block'
            }}
            priority
          />
        </div>
      </div>
      
      {/* Hill image that touches both left and right edges */}
      <div className="absolute left-0 w-full" style={{ bottom: '-2%' }}>
        <Image 
          src="/hill.svg" 
          alt="Hill" 
          width={4589}
          height={965}
          className="w-full h-auto" 
          style={{ 
            display: 'block', 
            width: '100%', 
            objectFit: 'cover', 
            minWidth: '100%',
            objectPosition: 'bottom'
          }}
          priority
        />
      </div>
    </footer>
  );
};

export default BottomSection;
