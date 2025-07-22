"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SimplePfpMaker, { SimplePfpMakerRef } from './SimplePfpMaker';


interface PfpMakerModalProps {
  buttonText?: string;
  buttonClassName?: string;
  modalClassName?: string;
  width?: number;
  onSave?: (dataUrl: string) => void;
}

const PfpMakerModal: React.FC<PfpMakerModalProps> = ({
  buttonText = "Create Profile Picture",
  buttonClassName = "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors",
  modalClassName = "bg-amber-500 p-6 max-w-4xl mx-auto",
  width = 320,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pfpMakerRef = useRef<SimplePfpMakerRef>(null);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Detect screen size changes for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  


  const handleOpen = () => {
    setIsOpen(true);
    
    // Use setTimeout to ensure the component is mounted before calling randomize
    setTimeout(() => {
      if (pfpMakerRef.current) {
        pfpMakerRef.current.randomize();
      }
    }, 100);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = (dataUrl: string) => {
    // Call the parent's onSave handler if provided
    if (onSave) {
      onSave(dataUrl);
    }
    // Close the modal after saving
    handleClose();
  };
  


  // Portal container state
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  // Set up portal container on mount
  useEffect(() => {
    // Check if we're in the browser
    if (typeof document !== 'undefined') {
      // Look for existing portal container or create one
      let container = document.getElementById('modal-portal-container');
      
      if (!container) {
        container = document.createElement('div');
        container.id = 'modal-portal-container';
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '99999';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
      }
      
      setPortalContainer(container);
    }
    
    // Clean up on unmount
    return () => {
      if (typeof document !== 'undefined') {
        const container = document.getElementById('modal-portal-container');
        if (container && container.childNodes.length === 0) {
          document.body.removeChild(container);
        }
      }
    };
  }, []);

  return (
    <>
      {/* Button to open the modal */}
      <button 
        onClick={handleOpen} 
        className={buttonClassName}
      >
        {buttonText}
      </button>

      {/* Modal with AnimatePresence for smooth entry/exit */}
      {portalContainer && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 99999, pointerEvents: 'auto' }}>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              >
                {/* Modal content - stop propagation to prevent closing when clicking inside */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative overflow-hidden max-h-[90vh] w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[1100px] bg-amber-500 border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  style={{ fontFamily: 'var(--font-press-start)' }}
                >
                  {/* Modal structure with header */}
                  <div className="flex flex-col h-full">
                    {/* Header with blue bar - pixel art style */}
                    <div 
                      className="w-full bg-blue-500 border-b-4 border-black flex-shrink-0"
                      style={{
                        backgroundImage: 'linear-gradient(to bottom, #3b82f6, #2563eb)',
                        boxShadow: 'inset 0 -4px 0 #1d4ed8, inset 0 4px 0 #60a5fa',
                        padding: screenWidth < 640 ? '8px 0' : '12px 0'
                      }}
                    >
                      <h2 className={`${screenWidth < 640 ? 'text-xl' : 'text-2xl'} font-bold text-center text-white`} style={{ 
                        fontFamily: 'var(--font-press-start)', 
                        textShadow: '2px 2px 0 #000, -1px -1px 0 #93c5fd'
                      }}>Create Your PFP</h2>
                    </div>
                    
                    {/* Close button - smaller on mobile */}
                    <button 
                      onClick={handleClose}
                      className={`absolute ${screenWidth < 640 ? 'top-1 right-1 w-8 h-8' : 'top-2 right-2 w-10 h-10'} flex items-center justify-center bg-orange-500 text-white font-bold border-3 border-black hover:bg-orange-600 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 z-10`}
                      style={{ fontSize: screenWidth < 640 ? '14px' : '16px' }}
                    >
                      X
                    </button>

                    {/* Content area - optimized padding for mobile */}
                    <div className="flex-grow overflow-y-auto p-1 xs:p-2 sm:p-4 md:p-6">
                      <div className="w-full">
                        <SimplePfpMaker 
                          ref={pfpMakerRef}
                          className="w-full mobile-optimized"
                          width={screenWidth >= 768 ? 500 : (screenWidth >= 640 ? 300 : 260)} /* Smaller canvas on mobile */
                          onSave={handleSave}
                          randomizeOnMount={true}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        portalContainer
      )}
    </>
  );
};

export default PfpMakerModal;
