"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeInputComponent, { CodeMessage, HonoraryAsset as CodeHonoraryAsset } from './CodeInputComponent';

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

// Reuse HonoraryAsset and CodeMessage from CodeInputComponent

interface EquippedState {
  eye: boolean;
  mouth: boolean;
  hat: boolean;
  costume: boolean;
}

type AssetMap = Record<AssetCategory, Asset[]>;
type SelectionMap = Record<AssetCategory, number>;

interface SimplePfpMakerProps {
  width?: number;
  className?: string;
  randomizeOnMount?: boolean;
  onSave?: (dataUrl: string) => void;
}

interface SimplePfpMakerRef {
  randomize: () => void;
  addHonoraryAsset: (asset: CodeHonoraryAsset) => boolean;
}

// Import asset configurations from separate files - use relative paths
import { backgroundAssets as importedBgAssets } from './pfp/BackgroundAssets';
import { bodyAssets as importedBodyAssets } from './pfp/BodyAssets';
import { eyeAssets as importedEyeAssets } from './pfp/EyeAssets';
import { hatAssets as importedHatAssets } from './pfp/HatAssets';
import { mouthAssets as importedMouthAssets } from './pfp/MouthAssets';
import { costumeAssets as importedCostumeAssets } from './pfp/CostumeAssets';
import { getAssetByCode, HonoraryAsset as ImportedHonoraryAsset } from './pfp/HonoraryAssets';

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
    costume: 0
  });

  // State for equipped (visible) elements
  const [equipped, setEquipped] = useState<EquippedState>({
    eye: true,
    mouth: true,
    hat: true,
    costume: true
  });
  
  // State for showing save notification
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Code input state
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeMessage, setCodeMessage] = useState<CodeMessage | null>(null);
  const [unlockedAsset, setUnlockedAsset] = useState<CodeHonoraryAsset | null>(null);
  const [unlockedHonoraryAssets, setUnlockedHonoraryAssets] = useState<CodeHonoraryAsset[]>([]);

  // Helper function to load an image and return a Promise
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      // Set image to pixelated rendering for better quality
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
        // Load all assets in parallel
        const loadCategoryAssets = async (category: AssetCategory, assetList: Asset[]) => {
          // Preload images
          const loadedAssets = await Promise.all(
            assetList.map(async (asset) => {
              if (!asset.url) {
                return asset; // Skip empty URLs (like 'None' options)
              }
              
              return new Promise<Asset>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  // Add the image to the asset for later use
                  const assetWithImg = { ...asset, img };
                  resolve(assetWithImg);
                };
                img.onerror = () => {
                  console.error(`Failed to load asset: ${asset.url}`);
                  resolve(asset); // Resolve anyway to prevent blocking
                };
                img.src = asset.url;
              });
            })
          );
          
          return loadedAssets;
        };
        
        // Load all categories in parallel
        const [bgAssets, bodyAssets, eyeAssets, mouthAssets, hatAssets, costumeAssets] = await Promise.all([
          loadCategoryAssets('bg', importedBgAssets),
          loadCategoryAssets('body', importedBodyAssets),
          loadCategoryAssets('eye', importedEyeAssets),
          loadCategoryAssets('mouth', importedMouthAssets),
          loadCategoryAssets('hat', importedHatAssets),
          loadCategoryAssets('costume', importedCostumeAssets)
        ]);
        
        // Preload hat back images
        for (const hatAsset of hatAssets) {
          if (hatAsset.backUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              hatAsset.backImg = img;
            };
            img.onerror = () => {
              console.error(`Failed to load hat back image: ${hatAsset.backUrl}`);
            };
            img.src = hatAsset.backUrl;
          }
        }
        
        // Update state with loaded assets
        setAssets({
          bg: bgAssets,
          body: bodyAssets,
          eye: eyeAssets,
          mouth: mouthAssets,
          hat: hatAssets,
          costume: costumeAssets
        });
        
        // Randomize if requested
        if (randomizeOnMount) {
          const newSelections = {
            bg: Math.floor(Math.random() * bgAssets.length),
            body: Math.floor(Math.random() * bodyAssets.length),
            eye: Math.floor(Math.random() * eyeAssets.length),
            mouth: Math.floor(Math.random() * mouthAssets.length),
            hat: Math.floor(Math.random() * hatAssets.length),
            costume: Math.floor(Math.random() * costumeAssets.length)
          };
          setSelections(newSelections);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading assets:', error);
        setIsLoading(false);
      }
    };
    
    loadAssets();
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
      tempCanvas.width = canvasSize; // 1000px internal resolution
      tempCanvas.height = canvasSize;
      const tempCtx = tempCanvas.getContext('2d', { alpha: false });
      if (!tempCtx) return;
      
      // Always disable smoothing for export to preserve pixel art fidelity
      tempCtx.imageSmoothingEnabled = false;
      
      // Draw the current canvas content to the export canvas
      tempCtx.drawImage(canvas, 0, 0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'my-pfp.png';
      const dataUrl = tempCanvas.toDataURL('image/png', 1.0); // Use highest quality
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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

  // Handle code submission
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the code matches any honorary asset using the imported function
    const matchingAsset = getAssetByCode(codeInput);
    
    if (matchingAsset) {
      // Success
      setCodeMessage({
        text: `Unlocked: ${matchingAsset.name}!`,
        type: 'success'
      });
      
      // Convert the imported HonoraryAsset to CodeHonoraryAsset
      const typedAsset: CodeHonoraryAsset = {
        name: matchingAsset.name,
        url: matchingAsset.url,
        type: matchingAsset.type,
        description: matchingAsset.description || '',
        code: matchingAsset.code
      };
      
      // Add to unlocked assets
      setUnlockedHonoraryAssets(prev => [...prev, typedAsset]);
      setUnlockedAsset(typedAsset);
      
      // Add the asset to the PFP maker
      handleAddHonoraryAsset(typedAsset);
      
      // Clear input
      setCodeInput('');
      
      // Auto-dismiss success after 2 seconds
      setTimeout(() => {
        setCodeMessage(null);
        setShowCodeInput(false);
      }, 2000);
    } else {
      // Error
      setCodeMessage({
        text: 'Invalid code. Try again.',
        type: 'error'
      });
      
      // Auto-dismiss error after 2 seconds
      setTimeout(() => {
        setCodeMessage(null);
      }, 2000);
    }
  };
  
  // Handle adding honorary assets
  const handleAddHonoraryAsset = (honoraryAsset: CodeHonoraryAsset): boolean => {
    const category = honoraryAsset.type as AssetCategory;
    const existingAssets = assets[category];
    
    // Check if this asset already exists by URL
    const assetExists = existingAssets.some((asset: Asset) => asset.url === honoraryAsset.url);
    
    if (assetExists) {
      return false;
    }
    
    // Load the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = honoraryAsset.url;
    
    // Create a new asset with the image
    const newAsset: Asset = {
      name: honoraryAsset.name,
      url: honoraryAsset.url,
      img
    };

    // Add the asset to the category
    setAssets(prev => {
      const updatedCategory = [...prev[category], newAsset];
      return {
        ...prev,
        [category]: updatedCategory
      };
    });

    // Make sure the asset is equipped if it's a toggleable category
    if (category === 'eye' || category === 'mouth' || category === 'hat') {
      setEquipped(prev => ({
        ...prev,
        [category as keyof EquippedState]: true
      }));
    }

    // Redraw the canvas
    setTimeout(drawCanvas, 100);

    return true;
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    randomize: handleRandomize,
    addHonoraryAsset: handleAddHonoraryAsset
  }));

  // Helper function to render asset selector
  const renderAssetSelector = (category: AssetCategory) => {
    const categoryAssets = assets[category] || [];
    const currentIndex = selections[category];
    const isToggleable = category !== 'bg' && category !== 'body';
    const isEquipped = isToggleable ? equipped[category as keyof EquippedState] : true;
    
    return (
      <div key={category} className="asset-selector">
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wide">{category}</h3>
        </div>
        
        <div className="flex items-center">
          <select
            value={currentIndex}
            onChange={(e) => handleAssetChange(category, parseInt(e.target.value))}
            className="flex-1 px-2 py-1 border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            disabled={!isEquipped}
          >
            {categoryAssets.map((asset, index) => (
              <option key={index} value={index}>
                {asset.name}
              </option>
            ))}
          </select>
          
          {isToggleable && (
            <button
              onClick={() => handleEquipToggle(category as keyof EquippedState)}
              className={`ml-2 px-2 py-1 border-4 border-black text-xs font-bold flex items-center ${
                isEquipped 
                  ? 'bg-orange-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-gray-300 text-gray-600'
              }`}
              title={isEquipped ? "Unequip" : "Equip"}
              aria-label={isEquipped ? `Unequip ${category}` : `Equip ${category}`}
            >
              {isEquipped ? "✓" : "✗"}
            </button>
          )}
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
          <p className="text-center text-sm">Loading assets...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Canvas - responsive container with fixed dimensions on desktop */}
          <div className="w-full md:w-[500px] flex-shrink-0">
            <PfpCanvas canvasRef={canvasRef} width={width} />
          </div>
          
          {/* Controls - with fixed height to match canvas */}
          <div className="pfp-controls flex-1 space-y-4 bg-amber-100 p-4 overflow-y-auto max-h-[70vh] md:max-h-[500px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            {/* Asset Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['bg', 'body', 'eye', 'mouth', 'hat', 'costume'] as AssetCategory[]).map(renderAssetSelector)}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 pb-6 sticky bottom-0 bg-amber-100 pt-4 border-t-4 border-black">
              {renderActionButton('Randomize', handleRandomize, 'bg-blue-500')}
              {renderActionButton('Save PFP', handleSave, 'bg-orange-500')}
              {renderActionButton('CODE', () => setShowCodeInput(true), 'bg-blue-500')}
            </div>
          </div>
        </div>
      )}
      
      {/* Code Input Modal */}
      <CodeInputComponent
        isVisible={showCodeInput}
        onClose={() => setShowCodeInput(false)}
        onSubmit={(code) => {
          setCodeInput(code);
          handleCodeSubmit(new Event('submit') as unknown as React.FormEvent);
        }}
        codeMessage={codeMessage}
        unlockedAsset={unlockedAsset as CodeHonoraryAsset}
      />
      
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
          style={{ fontFamily: 'var(--font-press-start)' }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimplePfpMaker;
