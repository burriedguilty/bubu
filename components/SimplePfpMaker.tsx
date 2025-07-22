"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Type definitions
type AssetCategory = 'bg' | 'body' | 'eye' | 'hat' | 'mouth' | 'costume';
interface Asset {
  name: string;
  url: string;
  backUrl?: string;
  usePathfinder?: boolean;
  img?: HTMLImageElement;
  backImg?: HTMLImageElement;
}

interface EquippedState {
  bg: boolean;
  body: boolean;
  eye: boolean;
  mouth: boolean;
  hat: boolean;
  costume: boolean;
}

type AssetMap = Record<AssetCategory, Asset[]>;
type SelectionMap = Record<AssetCategory, number> & {
  activeTab?: AssetCategory;
};

interface SimplePfpMakerProps {
  width?: number;
  className?: string;
  randomizeOnMount?: boolean;
  onSave?: (dataUrl: string) => void;
}

interface SimplePfpMakerRef {
  randomize: () => void;
}

// Import asset configurations from separate files - use relative paths
import { backgroundAssets as importedBgAssets } from './pfp/BackgroundAssets';
import { bodyAssets as importedBodyAssets } from './pfp/BodyAssets';
import { eyeAssets as importedEyeAssets } from './pfp/EyeAssets';
import { hatAssets as importedHatAssets } from './pfp/HatAssets';
import { mouthAssets as importedMouthAssets } from './pfp/MouthAssets';
import { costumeAssets as importedCostumeAssets } from './pfp/CostumeAssets';
import { PFP_X_CAPTION } from './x';

// Export the ref type for external use
export type { SimplePfpMakerRef };

const SimplePfpMaker = forwardRef<SimplePfpMakerRef, SimplePfpMakerProps>(({ 
  className, 
  width = 500, 
  onSave, 
  randomizeOnMount = false 
}, ref): JSX.Element => {
  // Use 1000px for optimal quality and performance
  const canvasSize = 2000;
  // Track container width for responsive sizing
  const [containerWidth, setContainerWidth] = useState(width);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize assets state
  const [assets, setAssets] = useState<AssetMap>({
    bg: [],
    body: [],
    eye: [],
    hat: [],
    mouth: [],
    costume: []
  });
  
  // Track which assets are selected
  const [selections, setSelections] = useState<SelectionMap>({
    bg: 0,
    body: 0,
    eye: 0,
    hat: 0,
    mouth: 0,
    costume: 0,
    activeTab: 'bg' // Default active tab for mobile view
  });

  // State for equipped (visible) elements
  const [equipped, setEquipped] = useState<EquippedState>({
    bg: true,
    body: true,
    eye: true,
    mouth: true,
    hat: true,
    costume: true
  });
  
  // State for showing save notification
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Track if essential assets are loaded (enough to show UI)
  const [essentialAssetsLoaded, setEssentialAssetsLoaded] = useState(false);
  
  // Helper function to deduplicate assets by name
  const deduplicateAssets = (assets: Asset[]): Asset[] => {
    const uniqueAssets: Asset[] = [];
    const seenNames = new Set<string>();
    
    for (const asset of assets) {
      if (!seenNames.has(asset.name)) {
        seenNames.add(asset.name);
        uniqueAssets.push(asset);
      }
    }
    
    return uniqueAssets;
  };

  // Helper function to load an image and return a Promise
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.style.imageRendering = 'pixelated';
      // Add a timeout to prevent hanging on slow connections
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout loading image: ${url}`));
      }, 10000); // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  };

  // Load assets on component mount
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        // Create a data URI for a transparent placeholder
        const transparentPlaceholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23FFFFFF" fill-opacity="0"/></svg>';
        
        // Global asset cache to prevent duplicate loading
        const assetCache = new Map<string, HTMLImageElement>();
        
        // Check browser storage for previously loaded assets
        const checkCachedAsset = (url: string): HTMLImageElement | null => {
          // Skip for data URLs - they're already fast
          if (url.startsWith('data:')) return null;
          
          // Check memory cache first
          if (assetCache.has(url)) {
            return assetCache.get(url) || null;
          }
          
          return null;
        };
        
        // Optimize Cloudinary URLs for faster loading
        const optimizeCloudinaryUrl = (url: string): string => {
          if (!url.includes('cloudinary.com')) return url;
          
          // Add quality and format optimization parameters
          // q_auto:good - good quality with compression
          // f_auto - automatic format selection based on browser
          // w_500 - resize to 500px width (enough for our canvas)
          try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            
            // Check if transformation parameters already exist
            const hasTransformations = pathParts.some(part => part.startsWith('q_') || part.startsWith('f_') || part.startsWith('w_'));
            
            if (!hasTransformations) {
              // Find the upload part of the path and insert optimizations after it
              const uploadIndex = pathParts.findIndex(part => part === 'upload');
              if (uploadIndex !== -1) {
                pathParts.splice(uploadIndex + 1, 0, 'q_auto:good,f_auto,w_500');
                urlObj.pathname = pathParts.join('/');
                return urlObj.toString();
              }
            }
          } catch (e) {
            // If URL parsing fails, return original URL
            console.warn('Failed to optimize Cloudinary URL:', url);
          }
          
          return url;
        };
        
        // Load a single image with timeout
        const loadSingleImage = async (url: string, timeout = 2000): Promise<HTMLImageElement> => {
          // Check cache first
          const cachedImg = checkCachedAsset(url);
          if (cachedImg) return cachedImg;
          
          // Optimize URL if it's a Cloudinary URL
          const optimizedUrl = optimizeCloudinaryUrl(url);
          
          try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout loading: ${optimizedUrl}`));
              }, timeout);
              
              img.onload = () => {
                clearTimeout(timeoutId);
                // Cache the successfully loaded image
                assetCache.set(url, img);
                resolve(img);
              };
              
              img.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load: ${optimizedUrl}`));
              };
              
              img.src = optimizedUrl;
            });
            
            return img;
          } catch (error) {
            console.warn(`Asset load error: ${error}`);
            // Return transparent placeholder on error
            const placeholder = new Image();
            placeholder.src = transparentPlaceholder;
            return placeholder;
          }
        };
        
        // Process a category of assets efficiently
        const processAssetCategory = async (category: AssetCategory, assets: Asset[], limit?: number): Promise<Asset[]> => {
          // If limit is provided, only process that many assets
          const assetsToProcess = limit ? assets.slice(0, limit) : assets;
          
          // For data URI backgrounds, process immediately without network requests
          if (category === 'bg') {
            const dataUriAssets = assetsToProcess.filter(asset => asset.url.startsWith('data:'));
            if (dataUriAssets.length > 0) {
              dataUriAssets.forEach(asset => {
                const img = new Image();
                img.src = asset.url;
                asset.img = img;
              });
            }
          }
          
          // Process remaining assets that need network requests
          const networkAssets = assetsToProcess.filter(asset => !asset.url.startsWith('data:') || !asset.img);
          
          // Use a small concurrency limit to avoid overwhelming the network
          const concurrencyLimit = 3;
          const results: Asset[] = [...assetsToProcess];
          
          // Process in small batches with limited concurrency
          for (let i = 0; i < networkAssets.length; i += concurrencyLimit) {
            const batch = networkAssets.slice(i, i + concurrencyLimit);
            
            await Promise.all(batch.map(async (asset) => {
              if (!asset.url) return;
              
              try {
                // Find the index in the original array
                const assetIndex = assetsToProcess.findIndex(a => a.name === asset.name);
                if (assetIndex === -1) return;
                
                // Load the image
                const img = await loadSingleImage(asset.url);
                results[assetIndex] = { ...asset, img };
                
                // If this asset has a back URL, load it in the background
                if (asset.backUrl) {
                  loadSingleImage(asset.backUrl).then(backImg => {
                    results[assetIndex].backImg = backImg;
                    // Force a re-render when back image loads
                    setAssets((prev: AssetMap) => ({ ...prev }));
                  }).catch(() => {});
                }
              } catch (error) {
                // On error, use placeholder
                const assetIndex = assetsToProcess.findIndex(a => a.name === asset.name);
                if (assetIndex !== -1) {
                  const placeholder = new Image();
                  placeholder.src = transparentPlaceholder;
                  results[assetIndex] = { ...asset, img: placeholder };
                }
              }
            }));
            
            // Small delay between batches
            if (i + concurrencyLimit < networkAssets.length) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          return results;
        };
        
        // PHASE 1: Load essential assets first (minimal set to show something)
        const [essentialBgs, essentialBodies] = await Promise.all([
          processAssetCategory('bg', importedBgAssets.slice(0, 3)),
          processAssetCategory('body', importedBodyAssets.slice(0, 2))
        ]);
        
        // Update state with essential assets (deduplicated)
        setAssets(prev => ({
          ...prev,
          bg: deduplicateAssets(essentialBgs),
          body: deduplicateAssets(essentialBodies)
        }));
        
        // Mark essential assets as loaded and turn off loading state
        setEssentialAssetsLoaded(true);
        setIsLoading(false);
        
        // PHASE 2: Load core assets needed for basic functionality
        const loadCoreAssets = async () => {
          const [moreBgs, moreBodies, allEyes, allMouths] = await Promise.all([
            processAssetCategory('bg', importedBgAssets.slice(3)),
            processAssetCategory('body', importedBodyAssets.slice(2)),
            processAssetCategory('eye', importedEyeAssets),
            processAssetCategory('mouth', importedMouthAssets)
          ]);
          
          // Update state with core assets (deduplicated)
          setAssets(prev => ({
            ...prev,
            bg: deduplicateAssets([...prev.bg, ...moreBgs]),
            body: deduplicateAssets([...prev.body, ...moreBodies]),
            eye: deduplicateAssets(allEyes),
            mouth: deduplicateAssets(allMouths)
          }));
        };
        
        // PHASE 3: Load secondary assets in the background
        const loadSecondaryAssets = async () => {
          // Load all hats and costumes to ensure proper detection
          const [basicHats, basicCostumes] = await Promise.all([
            processAssetCategory('hat', importedHatAssets),
            processAssetCategory('costume', importedCostumeAssets)
          ]);
          
          // Update state with secondary assets (deduplicated)
          setAssets(prev => ({
            ...prev,
            hat: deduplicateAssets(basicHats),
            costume: deduplicateAssets(basicCostumes)
          }));
        };
        
        // We've loaded all assets in PHASE 2 and PHASE 3, so we don't need PHASE 4 anymore
        const loadRemainingAssets = async () => {
          // All assets are already loaded in previous phases
          console.log('All assets loaded in previous phases');
        };
        
        // Execute phases in sequence with delays to prioritize UI responsiveness
        loadCoreAssets().then(() => {
          setTimeout(() => {
            loadSecondaryAssets().then(() => {
              setTimeout(loadRemainingAssets, 1000);
            });
          }, 500);
        });
        
        // Randomize if requested - use only the initially loaded assets
        if (randomizeOnMount) {
          const newSelections = {
            bg: Math.floor(Math.random() * Math.min(3, essentialBgs.length)),
            body: Math.floor(Math.random() * Math.min(2, essentialBodies.length)),
            eye: 0,
            mouth: 0,
            hat: 0,
            costume: 0
          };
          setSelections(newSelections);
        }
      } catch (error) {
        console.error('Error loading assets:', error);
        // Even on error, turn off loading state and show what we have
        setIsLoading(false);
      }
    };
    
    loadAssets();
    
    // Safety timeout - ensure loading state is turned off almost immediately
    // Show UI right away and continue loading assets in background
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
      setEssentialAssetsLoaded(true);
    }, 500);
    
    return () => clearTimeout(safetyTimeout);
  }, [randomizeOnMount]);

  // Draw the current selection on the canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get the actual display size of the canvas container
    const container = canvas.parentElement;
    if (!container) return;
    
    // Use high-quality rendering context with alpha for better quality
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Set canvas display size to match container exactly
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Set internal canvas resolution to 1000px as preferred
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Always disable image smoothing to maintain pixel art quality
    // This follows the user's preference for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Helper function to draw an asset
    const drawAsset = (category: AssetCategory) => {
      // Skip if category should not be equipped
      if ((category === 'eye' && !equipped.eye) || 
          (category === 'mouth' && !equipped.mouth) || 
          (category === 'hat' && !equipped.hat) || 
          (category === 'costume' && !equipped.costume)) {
        return;
      }
      
      const categoryAssets = assets[category];
      const selectedIndex = selections[category];
      
      if (categoryAssets && categoryAssets.length > 0 && selectedIndex !== undefined) {
        const asset = categoryAssets[selectedIndex];
        if (asset && asset.url) {
          try {
            // Create a new image if one doesn't exist
            if (!asset.img) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              // Draw the image once it's loaded
              img.onload = () => {
                try {
                  ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
                } catch (error) {
                  console.error(`Error drawing image for ${category}:`, error);
                }
              };
              img.onerror = () => {
                console.error(`Failed to load image for ${category}: ${asset.url}`);
              };
              img.src = asset.url;
              // Store the image for future use
              categoryAssets[selectedIndex] = { ...asset, img };
            } else {
              // Check if image is in a valid state before drawing
              if (asset.img.complete && asset.img.naturalWidth > 0) {
                // Draw image with crisp pixel rendering
                ctx.drawImage(asset.img, 0, 0, canvasSize, canvasSize);
              } else {
                // Reload the image if it's in a broken state
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  try {
                    ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
                  } catch (error) {
                    console.error(`Error drawing reloaded image for ${category}:`, error);
                  }
                };
                img.src = asset.url;
                // Update the asset with the new image
                categoryAssets[selectedIndex] = { ...asset, img };
              }
            }
          } catch (error) {
            console.error(`Error processing asset for ${category}:`, error);
          }
        }
      }
    };
    
    // Draw background first
    if (assets.bg.length > 0 && selections.bg !== undefined) {
      const bgAsset = assets.bg[selections.bg];
      if (bgAsset && bgAsset.img && bgAsset.img.complete) {
        ctx.drawImage(bgAsset.img, 0, 0, canvasSize, canvasSize);
      }
    }
    
    // Draw hat back if it exists
    const selectedHat = assets.hat[selections.hat];
    if (equipped.hat && selectedHat && selectedHat.backUrl && selectedHat.backImg && selectedHat.backImg.complete) {
      ctx.drawImage(selectedHat.backImg, 0, 0, canvasSize, canvasSize);
    }
    
    // Draw body
    if (assets.body.length > 0 && selections.body !== undefined) {
      const bodyAsset = assets.body[selections.body];
      if (bodyAsset && bodyAsset.img && bodyAsset.img.complete) {
        ctx.drawImage(bodyAsset.img, 0, 0, canvasSize, canvasSize);
      }
    }
    
    // Draw costume if equipped
    if (equipped.costume && assets.costume.length > 0 && selections.costume !== undefined) {
      const costumeAsset = assets.costume[selections.costume];
      if (costumeAsset && costumeAsset.img && costumeAsset.img.complete) {
        ctx.drawImage(costumeAsset.img, 0, 0, canvasSize, canvasSize);
      }
    }
    
    // Draw mouth
    if (equipped.mouth && assets.mouth.length > 0 && selections.mouth !== undefined) {
      const mouthAsset = assets.mouth[selections.mouth];
      if (mouthAsset && mouthAsset.img && mouthAsset.img.complete) {
        ctx.drawImage(mouthAsset.img, 0, 0, canvasSize, canvasSize);
      }
    }
    
    // Create temporary canvases for the masking operation
    const eyeMaskCanvas = document.createElement('canvas');
    const bodyMaskCanvas = document.createElement('canvas');
    const hatCanvas = document.createElement('canvas');
    const eyeCanvas = document.createElement('canvas');
    const outsideBodyMaskCanvas = document.createElement('canvas');
    
    // Set dimensions for all canvases
    [eyeMaskCanvas, bodyMaskCanvas, hatCanvas, eyeCanvas, outsideBodyMaskCanvas].forEach(canvas => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    });
    
    // Get contexts for all canvases
    const eyeMaskCtx = eyeMaskCanvas.getContext('2d');
    const bodyMaskCtx = bodyMaskCanvas.getContext('2d');
    const hatCtx = hatCanvas.getContext('2d');
    const eyeCtx = eyeCanvas.getContext('2d');
    const outsideBodyMaskCtx = outsideBodyMaskCanvas.getContext('2d');
    
    // Check if the selected hat should use the pathfinder effect
    const hatAsset = assets.hat[selections.hat];
    const shouldUsePathfinder = equipped.hat && equipped.eye && hatAsset && hatAsset.usePathfinder === true;
    
    if (shouldUsePathfinder && eyeMaskCtx && bodyMaskCtx && hatCtx && eyeCtx && outsideBodyMaskCtx) {
      // Disable image smoothing for pixel art on all contexts
      [eyeMaskCtx, bodyMaskCtx, hatCtx, eyeCtx, outsideBodyMaskCtx].forEach(ctx => {
        if (ctx) ctx.imageSmoothingEnabled = false;
      });
      
      // 1. Draw body to body mask canvas to detect body area
      const bodyAsset = assets.body[selections.body];
      if (bodyAsset && bodyAsset.img && bodyAsset.img.complete) {
        bodyMaskCtx.drawImage(bodyAsset.img, 0, 0, canvasSize, canvasSize);
      }
      
      // 2. Draw eye on eye canvas
      const eyeAsset = assets.eye[selections.eye];
      if (eyeAsset && eyeAsset.img && eyeAsset.img.complete) {
        eyeCtx.drawImage(eyeAsset.img, 0, 0, canvasSize, canvasSize);
      }
      
      // 3. Create eye mask that follows exact pixel shape
      eyeMaskCtx.fillStyle = 'white';
      
      // Get eye image data to detect non-transparent pixels
      const eyeImageData = eyeCtx.getImageData(0, 0, canvasSize, canvasSize);
      const bodyImageData = bodyMaskCtx.getImageData(0, 0, canvasSize, canvasSize);
      const eyeData = eyeImageData.data;
      const bodyData = bodyImageData.data;
      
      // Create a dilated version of the eye pixels that are outside the body
      const dilationRadius = 1; // Adjust this for more/less padding
      
      // Draw the eye pixels with dilation to the mask, but only for pixels outside body
      for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
          const pixelPos = (y * canvasSize + x) * 4;
          const eyeAlpha = eyeData[pixelPos + 3];
          const bodyAlpha = bodyData[pixelPos + 3];
          
          // Only apply pathfinder effect to eye pixels outside the body area
          if (eyeAlpha > 0 && bodyAlpha < 128) { // Body alpha threshold
            // For each qualifying eye pixel, fill a small circle around it
            eyeMaskCtx.beginPath();
            eyeMaskCtx.arc(x, y, dilationRadius, 0, Math.PI * 2);
            eyeMaskCtx.fill();
          }
        }
      }
      
      // 3. Draw hat on hat canvas
      if (hatAsset && hatAsset.img && hatAsset.img.complete) {
        hatCtx.drawImage(hatAsset.img, 0, 0, canvasSize, canvasSize);
      }
      
      // 4. Cut out eye area from hat
      hatCtx.globalCompositeOperation = 'destination-out';
      hatCtx.drawImage(eyeMaskCanvas, 0, 0);
      hatCtx.globalCompositeOperation = 'source-over';
      
      // 5. Draw the eyes on main canvas
      ctx.drawImage(eyeCanvas, 0, 0);
      
      // 6. Draw the hat with cutout to main canvas
      ctx.drawImage(hatCanvas, 0, 0);
    } else {
      // If not using the pathfinder effect, draw normally
      if (equipped.eye) {
        const eyeAsset = assets.eye[selections.eye];
        if (eyeAsset && eyeAsset.img && eyeAsset.img.complete) {
          ctx.drawImage(eyeAsset.img, 0, 0, canvasSize, canvasSize);
        }
      }
      
      if (equipped.hat) {
        const hatAsset = assets.hat[selections.hat];
        if (hatAsset && hatAsset.img && hatAsset.img.complete) {
          ctx.drawImage(hatAsset.img, 0, 0, canvasSize, canvasSize);
        }
      }
    }
  };

  // Update canvas when selections or assets change
  useEffect(() => {
    drawCanvas();
  }, [assets, selections, equipped, width]);

  // Handle asset selection changes
  const handleAssetChange = (category: AssetCategory, index: number) => {
    setSelections((prev: SelectionMap) => ({
      ...prev,
      [category]: index
    }));
  };
  
  // Handle equip/unequip toggle
  const handleEquipToggle = (category: keyof EquippedState) => {
    setEquipped((prev: EquippedState) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle saving
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      // Create a temporary canvas for export at full resolution (1000px as per user preference)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasSize; // Use canvasSize (2000px) for high resolution
      tempCanvas.height = canvasSize;
      const tempCtx = tempCanvas.getContext('2d', { alpha: false });
      if (!tempCtx) return;
      
      // Always disable smoothing for export to preserve pixel art fidelity
      tempCtx.imageSmoothingEnabled = false;
      
      // Draw the current canvas content to the export canvas
      tempCtx.drawImage(canvas, 0, 0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'my-bubu-pfp.png';
      const dataUrl = tempCanvas.toDataURL('image/png', 1.0); // Use highest quality
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Copy X post caption to clipboard
      navigator.clipboard.writeText(PFP_X_CAPTION)
        .then(() => {
          console.log('X caption copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy X caption: ', err);
        });
      
      // Open X (Twitter) in new tab with pre-filled caption
      const encodedText = encodeURIComponent(PFP_X_CAPTION);
      const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
      window.open(twitterIntentUrl, '_blank');
      
      // Show save notification
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
      
      // Call onSave callback if provided
      if (onSave) onSave(dataUrl);
    } catch (error) {
      console.error('Error saving canvas:', error);
    }
  };
  
  // Handle randomizing selections
  const handleRandomize = () => {
    const randomizeCategory = (category: AssetCategory) => {
      const categoryAssets = assets[category];
      if (categoryAssets.length > 0) {
        return Math.floor(Math.random() * categoryAssets.length);
      }
      return 0;
    };
    
    const categories: AssetCategory[] = ['bg', 'body', 'eye', 'hat', 'mouth', 'costume'];
    const newSelections = { ...selections };
    
    categories.forEach(category => {
      newSelections[category] = randomizeCategory(category);
    });
    
    setSelections(newSelections);
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    randomize: handleRandomize
  }));

  // Helper function to render asset selector
  const renderAssetSelector = (category: AssetCategory) => {
    const currentAssets = assets[category] || [];
    const currentIndex = selections[category];
    const currentAsset = currentAssets[currentIndex];
    
    return (
      <div key={category} className="asset-selector bg-amber-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-6">
        <h3 className="asset-selector-title text-sm font-bold mb-2 capitalize">{category}</h3>
        
        <div className="asset-selector-controls flex items-center justify-between">
          <button 
            onClick={() => handleAssetChange(category, -1)}
            className="asset-selector-button w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-bold border-2 border-black hover:bg-blue-600 transition-colors"
          >
            &lt;
          </button>
          
          <div className="asset-name flex-1 text-center px-2 py-1 bg-amber-100 border-2 border-black mx-2 truncate">
            {currentAsset ? currentAsset.name : 'Loading...'}
          </div>
          
          <button 
            onClick={() => handleAssetChange(category, 1)}
            className="asset-selector-button w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-bold border-2 border-black hover:bg-blue-600 transition-colors"
          >
            &gt;
          </button>
        </div>
        
        <div className="flex items-center justify-center mt-2">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={equipped[category]}
              onChange={() => handleEquipToggle(category)}
            />
            <div className={`w-9 h-5 bg-gray-200 rounded-full p-1 ${equipped[category] ? 'bg-blue-500' : ''}`}>
              <div className={`w-4 h-4 rounded-full transition-all ${equipped[category] ? 'bg-white translate-x-4' : 'bg-gray-400'}`}></div>
            </div>
            <span className="ml-2 text-xs">Show</span>
          </label>
        </div>
      </div>
    );
  };

// Helper function to render action button
const renderActionButton = (label: string, onClick: () => void, bgColor: string) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 ${bgColor} text-white font-bold text-xs border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 uppercase tracking-wide`}
  >
    {label}
  </button>
);

  // Effect for responsive canvas sizing and redrawing
  useEffect(() => {
    const handleResize = () => {
      // Update container width based on parent container
      const container = canvasRef.current?.parentElement;
      if (container) {
        setContainerWidth(container.clientWidth);
      }
      // Call drawCanvas directly here since it's defined in the component scope
      drawCanvas();
    };

    // Initial draw
    handleResize();
    
    // Add resize listener for responsive behavior
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);
  
  // Effect to redraw canvas whenever assets or selections change
  useEffect(() => {
    drawCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections, equipped, assets]);

  return (
    <div className={`pfp-maker ${className || ''}`} style={{ fontFamily: 'var(--font-press-start)' }}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 h-[400px]">
          <div className="relative w-16 h-16 mb-4">
            <div className="animate-spin absolute inset-0 border-4 border-t-amber-500 border-amber-200 rounded-full"></div>
          </div>
          <p className="text-center text-sm">Preparing PFP maker...</p>
          <p className="text-center text-xs mt-2 text-gray-500">Loading essential assets</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Canvas - responsive container with fixed dimensions on desktop */}
          <div className="w-full md:w-[500px] flex-shrink-0">
            <PfpCanvas canvasRef={canvasRef} width={width} />
          </div>
          
          {/* Controls - optimized for mobile with compact layout */}
          <div className="pfp-controls flex-1 space-y-3 md:space-y-4 bg-amber-100 p-2 sm:p-3 md:p-4 overflow-y-auto max-h-[60vh] sm:max-h-[65vh] md:max-h-[500px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] pb-[80px] md:pb-[90px]">
            {/* Mobile tabs for categories on small screens */}
            <div className="block sm:hidden mb-2">
              <div className="flex overflow-x-auto pb-2 hide-scrollbar">
                {(['bg', 'body', 'eye', 'mouth', 'hat', 'costume'] as AssetCategory[]).map((category) => (
                  <button 
                    key={`tab-${category}`}
                    className={`px-3 py-1 text-xs whitespace-nowrap mr-2 last:mr-0 border-2 border-black ${selections.activeTab === category ? 'bg-blue-500 text-white' : 'bg-amber-200'}`}
                    onClick={() => setSelections(prev => ({ ...prev, activeTab: category as AssetCategory }))}
                  >
                    {category.toUpperCase()}
                  </button>
                ))}
              </div>
              
              {/* Show only active category on mobile */}
              <div className="mt-2">
                {renderAssetSelector(selections.activeTab || 'bg')}
              </div>
            </div>
            
            {/* Regular grid layout on larger screens */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {(['bg', 'body', 'eye', 'mouth', 'hat', 'costume'] as AssetCategory[]).map(renderAssetSelector)}
            </div>
            
            {/* Action Buttons - more compact on mobile */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4 md:mt-6 pb-4 md:pb-6 sticky bottom-0 pt-3 md:pt-4 border-t-4 border-black z-20 bg-amber-100">
              {renderActionButton('Randomize', handleRandomize, 'bg-blue-500')}
              {renderActionButton('Save PFP', handleSave, 'bg-orange-500')}
            </div>
          </div>
        </div>
      )}
      
      {/* Save Notification */}
      <SaveNotification 
        isVisible={showSaveNotification} 
        message="PFP Saved Successfully!" 
      />
    </div>
  );
});

// Interface for PfpCanvas component
interface PfpCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number | string;
}

const PfpCanvas: React.FC<PfpCanvasProps> = ({ canvasRef, width }) => {
  return (
    <div style={{ 
      border: '4px solid black', 
      boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
      width: '100%',
      maxWidth: typeof width === 'number' ? `${width}px` : width,
      aspectRatio: '1/1',
      backgroundColor: 'white',
      padding: '0',
      margin: '0 auto',
      overflow: 'hidden',
      position: 'relative',
      // Ensure crisp rendering on high-DPI displays
      imageRendering: 'pixelated',
    }}>
      <canvas 
        ref={canvasRef} 
        className="pixelated"
        style={{ 
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '2px solid black',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

// Save Notification Component
interface SaveNotificationProps {
  isVisible: boolean;
  message: string;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.75rem' }}
        >
          <div className="flex flex-col gap-1">
            <div>{message}</div>
            <div className="text-xs">X caption copied to clipboard!</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimplePfpMaker;
