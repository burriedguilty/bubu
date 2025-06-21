"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef, memo } from 'react';

// Define interface for cloud layer configuration
interface CloudLayerConfig {
  count: number;
  sizeRange: [number, number];
  speedRange: [number, number];
  opacityRange: [number, number];
  floatRange: [number, number];
  floatSpeedRange: [number, number];
  blur: number;
}

// Define cloud layer configurations with enhanced parallax effect
const CLOUD_LAYERS: Record<'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND', CloudLayerConfig> = {
  FOREGROUND: {
    count: 6,
    sizeRange: [0.3, 0.6],
    speedRange: [80, 120],
    opacityRange: [0.9, 1.0],
    floatRange: [10, 20],
    floatSpeedRange: [15, 25],
    blur: 0,
  },
  MIDGROUND: {
    count: 6,
    sizeRange: [0.15, 0.4],
    speedRange: [50, 80],
    opacityRange: [0.7, 0.9],
    floatRange: [5, 15],
    floatSpeedRange: [10, 20],
    blur: 0.5,
  },
  BACKGROUND: {
    count: 8,
    sizeRange: [0.03, 0.12],
    speedRange: [30, 50],
    opacityRange: [0.2, 0.5],
    floatRange: [2, 5],
    floatSpeedRange: [8, 15],
    blur: 2,
  },
};

interface CloudProps {
  id: string;
  top: string;
  initialPosition: string;
  isInitial: boolean;
  size: number;
  speed: number;
  type: 1 | 2;
  depth: number;
  layer: 'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND';
  floatEffect: number;
  floatAmount: number;
  flipHorizontal: boolean;
  createdAt: number; // Timestamp when cloud was created for better lifecycle management
}

// Cloud component for better performance
const Cloud = memo(({ cloud, config }: { cloud: CloudProps; config: CloudLayerConfig }) => {
  // Get a stable opacity for this cloud using its ID as seed
  const cloudIdNum = parseInt(cloud.id.replace(/\D/g, '') || '0');
  const seed = cloudIdNum / 1000;
  const opacity = config.opacityRange[0] + (config.opacityRange[1] - config.opacityRange[0]) * ((seed * 7919) % 1);
  
  // Generate unique animation names for this cloud
  const moveAnim = `cloud-move-${cloud.id}`;
  const floatAnim = `cloud-float-${cloud.id}`;
  const floatAmount = cloud.floatAmount;
  
  return (
    <div
      className="absolute will-change-transform"
      style={{
        top: cloud.top,
        right: cloud.isInitial ? 'auto' : 'auto',
        left: cloud.isInitial ? cloud.initialPosition : '100%', // Start from right edge
        zIndex: Math.floor((1 - cloud.depth) * 20),
        animation: `${moveAnim} ${cloud.speed}s linear forwards`,
        willChange: 'transform',
        filter: `blur(${config.blur}px)`,
      }}
    >
      <div
        style={{
          transform: `scale(${cloud.size}) ${cloud.flipHorizontal ? 'scaleX(-1)' : ''}`,
          animation: `${floatAnim} ${cloud.floatEffect}s ease-in-out infinite`,
        }}
      >
        <Image
          src={cloud.type === 1 ? '/cloud1.svg' : '/cloud2.svg'}
          alt="Cloud"
          width={300}
          height={150}
          className="w-full h-auto"
          priority={cloud.isInitial}
          loading={cloud.isInitial ? "eager" : "lazy"}
          style={{ 
            filter: `brightness(${1 - cloud.depth * 0.2})`,
            opacity: opacity,
          }}
        />
      </div>
      <style jsx>{`
        @keyframes ${moveAnim} {
          from { transform: translateX(0); }
          to { transform: translateX(-200%); }
        }
        @keyframes ${floatAnim} {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-${floatAmount}px); }
        }
      `}</style>
    </div>
  );
});

Cloud.displayName = 'Cloud';

const AnimatedClouds: React.FC = () => {
  const [clouds, setClouds] = useState<CloudProps[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const cloudCountRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpawnTimeRef = useRef(Date.now());
  
  // No necesitamos estado para el filtro ya que siempre es dithered

  const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

  // Cache cloud generator to avoid recalculating cloud properties
  const createCloud = (isInitial: boolean, forcedLayer?: 'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND'): CloudProps => {
    const layerNames = Object.keys(CLOUD_LAYERS) as Array<'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND'>;
    
    // Use the forced layer if provided, otherwise select one
    const layer = forcedLayer || (isInitial
      ? layerNames[Math.floor(Math.random() * layerNames.length)]
      : layerNames[Math.floor(Math.random() * layerNames.length)]);

    const config = CLOUD_LAYERS[layer];
    
    // Create more natural depth variation based on layer
    let depthBase = 0;
    if (layer === 'FOREGROUND') depthBase = 0.7;
    else if (layer === 'MIDGROUND') depthBase = 0.4;
    else depthBase = 0.1;
    
    // Add some randomness to depth but keep it within layer-appropriate range
    const depth = depthBase + randomRange(-0.1, 0.1);
    
    const size = randomRange(config.sizeRange[0], config.sizeRange[1]);
    const speed = randomRange(config.speedRange[0], config.speedRange[1]);
    const floatEffect = randomRange(config.floatSpeedRange[0], config.floatSpeedRange[1]);
    const floatAmount = randomRange(config.floatRange[0], config.floatRange[1]);
    
    // Distribute clouds more evenly across vertical space
    const top = `${randomRange(5, 80)}%`;
    
    // Create timestamp for tracking cloud lifetime
    const createdAt = Date.now();

    return {
      id: `${isInitial ? 'initial-' : ''}cloud-${cloudCountRef.current++}`,
      top,
      initialPosition: isInitial ? `${randomRange(-10, 110)}%` : '-300px',
      isInitial,
      size,
      speed,
      type: Math.random() > 0.5 ? 1 : 2,
      depth,
      layer,
      floatEffect,
      floatAmount,
      flipHorizontal: Math.random() > 0.5,
      createdAt
    };
  };

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust cloud count based on screen size
  const getAdjustedCloudCount = (baseCount: number): number => {
    if (windowWidth < 640) { // Small mobile
      return Math.max(Math.floor(baseCount * 0.5), 2); // Reduce clouds on small screens
    } else if (windowWidth < 768) { // Mobile
      return Math.max(Math.floor(baseCount * 0.7), 3);
    } else if (windowWidth < 1024) { // Tablet
      return Math.max(Math.floor(baseCount * 0.85), 4);
    }
    return baseCount; // Desktop - use full count
  };

  useEffect(() => {
    // Initialize clouds for each layer based on their configuration and screen size
    const initialClouds: CloudProps[] = [];
    Object.entries(CLOUD_LAYERS).forEach(([layer, config]) => {
      const layerType = layer as 'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND';
      const adjustedCount = getAdjustedCloudCount(config.count);
      for (let i = 0; i < adjustedCount; i++) {
        initialClouds.push(createCloud(true, layerType));
      }
    });
    setClouds(initialClouds);

    // Track target counts for each layer - this is how many clouds should be visible at once
    // Adjust based on screen size
    const targetCounts = {
      FOREGROUND: getAdjustedCloudCount(CLOUD_LAYERS.FOREGROUND.count),
      MIDGROUND: getAdjustedCloudCount(CLOUD_LAYERS.MIDGROUND.count),
      BACKGROUND: getAdjustedCloudCount(CLOUD_LAYERS.BACKGROUND.count)
    };
    
    // Simple function to ensure proper cloud cycling
    const maintainClouds = () => {
      const now = Date.now();
      
      setClouds(prev => {
        // Remove clouds that have finished their animation
        let visibleClouds = prev.filter(cloud => {
          // Always keep initial clouds
          if (cloud.isInitial) return true;
          
          // Calculate how far the cloud has moved based on elapsed time
          const elapsedSeconds = (now - cloud.createdAt) / 1000;
          
          // Keep clouds that haven't completed their animation yet
          return elapsedSeconds < cloud.speed;
        });
        
        // Fix: Cap the number of clouds to avoid performance issues
        // Adjust max clouds based on screen size
        const maxClouds = windowWidth < 640 ? 20 : windowWidth < 1024 ? 35 : 50;
        if (visibleClouds.length > maxClouds) {
          const initialClouds = visibleClouds.filter(c => c.isInitial);
          const dynamicClouds = visibleClouds.filter(c => !c.isInitial)
            .sort((a, b) => (b.createdAt - a.createdAt))  // Keep newest
            .slice(0, maxClouds - initialClouds.length);
          visibleClouds = [...initialClouds, ...dynamicClouds];
        }
        
        // Count current clouds by layer
        const layerCounts = {
          FOREGROUND: visibleClouds.filter(c => c.layer === 'FOREGROUND' && !c.isInitial).length,
          MIDGROUND: visibleClouds.filter(c => c.layer === 'MIDGROUND' && !c.isInitial).length,
          BACKGROUND: visibleClouds.filter(c => c.layer === 'BACKGROUND' && !c.isInitial).length
        };
        
        // Always add clouds if we're below target count
        const newClouds: CloudProps[] = [];
        
        Object.entries(targetCounts).forEach(([layer, targetCount]) => {
          const layerType = layer as 'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND';
          const currentCount = layerCounts[layerType];
          const deficit = targetCount - currentCount;
          
          // Add any missing clouds
          if (deficit > 0) {
            for (let i = 0; i < deficit; i++) {
              // Stagger cloud creation slightly to avoid synchronized movement
              const cloudDelay = i * 200;
              setTimeout(() => {
                setClouds(current => {
                  const newCloud = createCloud(false, layerType);
                  return [...current, newCloud].sort((a, b) => b.depth - a.depth);
                });
              }, cloudDelay);
            }
          }
        });
        
        return visibleClouds;
      });
      
      // Maintain a consistent check interval
      spawnIntervalRef.current = setTimeout(maintainClouds, 1000);
    };
    
    // Start the cloud maintenance cycle with a shorter initial delay
    spawnIntervalRef.current = setTimeout(maintainClouds, 1000);
    
    return () => {
      if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
    };
  }, []);

  // No aplicar ningún filtro especial
  const getCloudFilter = (baseFilter: string) => {
    return baseFilter;
  };

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {clouds.map(cloud => (
        <Cloud 
          key={cloud.id} 
          cloud={cloud} 
          config={CLOUD_LAYERS[cloud.layer]} 
        />
      ))}
    </div>
  );
};

export default AnimatedClouds;
