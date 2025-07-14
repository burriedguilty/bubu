"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useAnimation,
  PanInfo,
} from "framer-motion";

// Default images - exactly 5 images that will loop
const imageUrls = Array.from({ length: 5 }, (_, i) => `/gallery/${i + 1}.jpg`);

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  images?: string[];
}

interface DragInfo {
  offset: { x: number };
  velocity: { x: number };
}

interface UpdateInfo {
  rotateY?: number;
}

const RollingGallery: React.FC<RollingGalleryProps> = ({
  autoplay = false,
  pauseOnHover = false,
  images = [],
}) => {
  images = images.length > 0 ? images : imageUrls;

  const [isScreenSizeSm, setIsScreenSizeSm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStartRotation, setDragStartRotation] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);

  const spacing = 220; // Space between images
  const maxScroll = spacing * (images.length - 1);
  const dragFactor = 1;

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const updateScreenSize = () => {
      setIsScreenSizeSm(window.innerWidth < 640);
    };

    window.addEventListener("resize", updateScreenSize);
    updateScreenSize();

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isDragging && autoplay && !isHovered) {
      const interval = setInterval(() => {
        setRotation((prev) => {
          const next = prev + 1;
          return next >= maxScroll ? 0 : next;
        });
      }, 1000 / 60);

      return () => clearInterval(interval);
    }
  }, [isDragging, autoplay, isHovered]);

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(event.clientX);
    setDragStartRotation(rotation);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handleDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStartX;
    let newRotation = dragStartRotation - deltaX * dragFactor;

    // Clamp the rotation to keep images in view
    newRotation = Math.max(0, Math.min(newRotation, maxScroll));
    setRotation(newRotation);
  };

  const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }
  };

  const handleHoverStart = () => {
    if (pauseOnHover) {
      setIsHovered(true);
    }
  };

  const handleHoverEnd = () => {
    if (pauseOnHover) {
      setIsHovered(false);
    }
  };

  const cylinderWidth = isScreenSizeSm ? 700 : 1000;
  const faceCount = images.length;
  const faceWidth = (cylinderWidth / faceCount) * 1.15;

  return (
    <div className="relative h-[300px] w-full overflow-hidden">
      <div className="flex h-full items-center justify-start pl-[calc(50%-100px)]">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-amber-500 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-500 to-transparent z-10"></div>
        <motion.div
          onPointerDown={handleDragStart}
          onPointerMove={handleDrag}
          onPointerUp={handleDragEnd}
          onPointerLeave={handleDragEnd}
          onMouseEnter={handleHoverStart}
          onMouseLeave={handleHoverEnd}
          style={{
            width: cylinderWidth,
            transform: `translateX(${-rotation}px)`,
            touchAction: "none"
          }}
          className="flex min-h-[200px] cursor-grab active:cursor-grabbing items-center justify-center [transform-style:preserve-3d]"
          draggable={false}
        >
          {images.map((url, i) => (
            <div
              key={i}
              className="group absolute flex h-fit items-center justify-center p-[8%] [backface-visibility:hidden] md:p-[6%]"
              style={{
                width: faceWidth,
                transform: `translateX(${i * 220}px)`,
                opacity: 1,
                transition: 'all 0.3s ease'
              }}
            >
              <img
                src={url}
                alt={`gallery-${i + 1}`}
                className="pointer-events-none h-[150px] w-[200px] rounded-[12px] border-[3px] border-black object-cover
                         transition-transform duration-300 ease-out group-hover:scale-105
                         sm:h-[130px] sm:w-[180px]"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery;
