"use client";

import React from 'react';

/**
 * CloudFilters - Componente que define filtros SVG para aplicar a las nubes
 * Estos filtros se aplicarán directamente a las imágenes de las nubes
 */
const CloudFilters: React.FC = () => {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
      <defs>
        {/* Filtro Dithered - Efecto de punteado retro */}
        <filter id="cloud-dithered">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" in="noise" result="colorNoise" />
          <feComposite operator="arithmetic" k1="0" k2="0.1" k3="0.9" k4="0" in="SourceGraphic" in2="colorNoise" result="dithered" />
        </filter>
        
        {/* Filtro Pixelated - Efecto de pixelado */}
        <filter id="cloud-pixelated">
          <feGaussianBlur stdDeviation="0.5" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
            <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
            <feFuncB type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
          </feComponentTransfer>
        </filter>
        
        {/* Filtro Retro - Efecto de colores limitados */}
        <filter id="cloud-retro">
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0.5 1" />
            <feFuncG type="table" tableValues="0 0.5 1" />
            <feFuncB type="table" tableValues="0 0.5 1" />
          </feComponentTransfer>
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 5 -2" />
        </filter>
        
        {/* Filtro Glitch - Efecto de distorsión digital */}
        <filter id="cloud-glitch">
          <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="1" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="10" xChannelSelector="R" yChannelSelector="G" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0.3 0.6 1" />
            <feFuncG type="table" tableValues="0 0.4 0.7 1" />
            <feFuncB type="table" tableValues="0 0.2 0.8 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
};

export default CloudFilters;
