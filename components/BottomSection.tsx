"use client";

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import AnimatedClouds from './AnimatedClouds';
import Masonry from './Masonry';

const useGalleryImages = () => {
  const [images, setImages] = useState<{ id: string; img: string }[]>([]);

  useEffect(() => {
    // Get all images from 1 to 6
    const galleryImages = Array.from({ length: 6 }, (_, i) => ({
      id: String(i + 1),
      img: `/gallery/${i + 1}.jpg`
    }));
    setImages(galleryImages);
  }, []);

  return images;
};

const BottomSection = () => {
  const galleryImages = useGalleryImages();
  // Create an array of money drops with random positions and delays
  const moneyDrops = Array.from({ length: 20 }, (_, index) => {
    const leftPosition = Math.floor(Math.random() * 90) + 5; // 5% to 95%
    const animationDelay = Math.random() * 10; // 0 to 10s delay
    const animationDuration = 8 + Math.random() * 6; // 8-14s duration
    const size = 60 + Math.floor(Math.random() * 60); // 60-120px (larger size)
    
    return { id: index, leftPosition, animationDelay, animationDuration, size };
  });
  
  return (
    <footer className="w-full py-24 sm:py-32 md:py-48 min-h-[150vh] sm:min-h-[180vh] md:min-h-[200vh] relative z-10 overflow-visible">
      {/* Single cloud layer covering the entire section */}
      <div className="absolute inset-0 z-5">
        <AnimatedClouds />
      </div>

      {/* Gallery Section */}
      <div className="relative z-20 -mt-12 sm:-mt-16 md:-mt-24 px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-24">
        <Masonry
          items={galleryImages}
          ease="power3.out"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover={true}
          hoverScale={0.95}
          blurToFocus={true}
          colorShiftOnHover={false}
        />
      </div>
      
      {/* Combined styles for all animations */}
      <style jsx global>{`
        /* Money falling animation */
        @keyframes fall {
          0% { 
            transform: translateY(0); 
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          30% { 
            transform: translateY(40vh) translateX(100px); 
          }
          50% { 
            transform: translateY(80vh) translateX(-100px); 
          }
          70% { 
            transform: translateY(120vh) translateX(80px); 
          }
          90% { 
            transform: translateY(160vh) translateX(-50px); 
            opacity: 1;
          }
          100% { 
            transform: translateY(180vh) translateX(30px); 
            opacity: 0;
          }
        }
        
        .money-drop {
          position: absolute;
          top: 60vh;
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
              width: '100%',
              height: '100%',
              maxWidth: '150%',
              maxHeight: '150%',
            }}
          />
        </div>
      ))}
      
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
            className="h-auto w-[250px] sm:w-[350px] md:w-[450px] lg:w-[500px]" 
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
