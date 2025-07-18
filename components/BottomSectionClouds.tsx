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

// Define cloud layer configurations with enhanced distribution for BottomSection
const CLOUD_LAYERS: Record<'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND', CloudLayerConfig> = {
  FOREGROUND: {
    count: 12, // Increased count
    sizeRange: [0.4, 0.8],
    speedRange: [80, 120],
    opacityRange: [0.9, 1.0],
    floatRange: [10, 20],
    floatSpeedRange: [15, 25],
    blur: 0,
  },
  MIDGROUND: {
    count: 16, // Increased count
    sizeRange: [0.2, 0.5],
    speedRange: [50, 80],
    opacityRange: [0.7, 0.9],
    floatRange: [5, 15],
    floatSpeedRange: [10, 20],
    blur: 0.5,
  },
  BACKGROUND: {
    count: 20, // Increased count
    sizeRange: [0.03, 0.15],
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
  createdAt: number;
}

// Cloud component for better performance
const Cloud = memo(({ cloud, config }: { cloud: CloudProps; config: CloudLayerConfig }) => {
  const cloudIdNum = parseInt(cloud.id.replace(/\D/g, '') || '0');
  const seed = cloudIdNum / 1000;
  const opacity = config.opacityRange[0] + (config.opacityRange[1] - config.opacityRange[0]) * ((seed * 7919) % 1);
  
  const moveAnim = `cloud-move-${cloud.id}`;
  const floatAnim = `cloud-float-${cloud.id}`;
  const floatAmount = cloud.floatAmount;
  
  return (
    <div
      className="absolute will-change-transform"
      style={{
        top: cloud.top,
        right: cloud.isInitial ? 'auto' : 'auto',
        left: cloud.isInitial ? cloud.initialPosition : '100%',
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

const BottomSectionClouds: React.FC = () => {
  const [clouds, setClouds] = useState<CloudProps[]>([]);
  const cloudCountRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpawnTimeRef = useRef(Date.now());
  
  const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

  // Improved cloud generator with better distribution
  const createCloud = (isInitial: boolean, forcedLayer?: 'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND'): CloudProps => {
    const createdAt = Date.now();
    cloudCountRef.current += 1;
    
    // Determine cloud layer - ensure even distribution across the entire height
    const layer = forcedLayer || (Math.random() < 0.33 
      ? 'FOREGROUND' 
      : Math.random() < 0.5 
        ? 'MIDGROUND' 
        : 'BACKGROUND');
    
    const config = CLOUD_LAYERS[layer];
    
    // Improved vertical distribution - ensure clouds are spread throughout the entire height
    // For initial clouds, distribute them evenly across the full height
    let topPosition;
    if (isInitial) {
      // Divide the screen into sections based on total cloud count and position this cloud in its section
      const totalInitialClouds = CLOUD_LAYERS.FOREGROUND.count + CLOUD_LAYERS.MIDGROUND.count + CLOUD_LAYERS.BACKGROUND.count;
      const sectionHeight = 100 / totalInitialClouds;
      const sectionIndex = cloudCountRef.current % totalInitialClouds;
      // Add some randomness within the section
      topPosition = (sectionIndex * sectionHeight) + randomRange(-sectionHeight/3, sectionHeight/3);
    } else {
      // For new clouds, distribute them randomly but ensure good coverage
      topPosition = randomRange(0, 100);
    }
    
    // Ensure the position is within bounds
    topPosition = Math.max(0, Math.min(100, topPosition));
    
    // Calculate horizontal position - for initial clouds, distribute them across the width
    let initialPos;
    if (isInitial) {
      // Distribute initial clouds evenly across the width
      const totalInitialClouds = CLOUD_LAYERS.FOREGROUND.count + CLOUD_LAYERS.MIDGROUND.count + CLOUD_LAYERS.BACKGROUND.count;
      const sectionWidth = 100 / totalInitialClouds;
      const sectionIndex = cloudCountRef.current % totalInitialClouds;
      initialPos = (sectionIndex * sectionWidth) + randomRange(-sectionWidth/3, sectionWidth/3);
      // Ensure the position is within bounds
      initialPos = Math.max(0, Math.min(100, initialPos));
    } else {
      initialPos = 0; // Not used for non-initial clouds
    }
    
    return {
      id: isInitial ? `initial-cloud-${cloudCountRef.current}` : `cloud-${cloudCountRef.current}`,
      top: `${topPosition}%`,
      initialPosition: `${initialPos}%`,
      isInitial,
      size: randomRange(...config.sizeRange),
      speed: randomRange(...config.speedRange),
      type: Math.random() > 0.5 ? 1 : 2,
      depth: layer === 'FOREGROUND' ? randomRange(0, 0.33) : layer === 'MIDGROUND' ? randomRange(0.33, 0.66) : randomRange(0.66, 1),
      layer,
      floatEffect: randomRange(...config.floatSpeedRange),
      floatAmount: randomRange(...config.floatRange),
      flipHorizontal: Math.random() > 0.5,
      createdAt
    };
  };

  useEffect(() => {
    // Initialize clouds for each layer with better distribution
    const initialClouds: CloudProps[] = [];
    Object.entries(CLOUD_LAYERS).forEach(([layer, config]) => {
      const layerType = layer as 'FOREGROUND' | 'MIDGROUND' | 'BACKGROUND';
      for (let i = 0; i < config.count; i++) {
        initialClouds.push(createCloud(true, layerType));
      }
    });
    setClouds(initialClouds);

    // Track target counts for each layer
    const targetCounts = {
      FOREGROUND: CLOUD_LAYERS.FOREGROUND.count,
      MIDGROUND: CLOUD_LAYERS.MIDGROUND.count,
      BACKGROUND: CLOUD_LAYERS.BACKGROUND.count
    };
    
    // Cloud maintenance function
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
        
        // Cap the number of clouds to avoid performance issues
        const maxClouds = 80; // Increased max clouds for better coverage
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
    
    // Start the cloud maintenance cycle
    spawnIntervalRef.current = setTimeout(maintainClouds, 1000);
    
    return () => {
      if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

export default BottomSectionClouds;
