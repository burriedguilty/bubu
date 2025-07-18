"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Type definitions
export type CodeMessageType = 'success' | 'error' | 'info';

export interface HonoraryAsset {
  name: string;
  url: string;
  type: string;
  description: string;
  code: string;
}

export interface CodeMessage {
  text: string;
  type: CodeMessageType;
}

export interface CodeInputComponentProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  codeMessage: CodeMessage | null;
  unlockedAsset: HonoraryAsset | null;
}

const CodeInputComponent: React.FC<CodeInputComponentProps> = ({
  isVisible,
  onClose,
  onSubmit,
  codeMessage,
  unlockedAsset
}) => {
  const [codeInput, setCodeInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim()) {
      onSubmit(codeInput);
    }
  };

  // Pixel art style constants
  const pixelBorder = "border-4 border-black";
  const pixelShadow = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop with pixel pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          
          {/* Modal container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pixel art window */}
            <div className="relative">
              {/* Main window */}
              <div 
                className={`bg-amber-100 ${pixelBorder} ${pixelShadow} p-5 w-[300px]`}
                style={{ imageRendering: 'pixelated' }}
              >
                {/* Corner pixels */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-500 border-2 border-black"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 border-2 border-black"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-500 border-2 border-black"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500 border-2 border-black"></div>
                
                <form onSubmit={handleSubmit}>
                  {/* Window title bar */}
                  <div className="bg-amber-500 border-b-4 border-black -mt-5 -mx-5 mb-4 p-2 flex justify-between items-center">
                    <h2 
                      className="text-lg font-bold px-2" 
                      style={{ fontFamily: 'var(--font-press-start)' }}
                    >
                      SECRET CODE
                    </h2>
                    
                    {/* Close button */}
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="w-6 h-6 flex items-center justify-center bg-red-500 text-white font-bold border-2 border-black"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Code input field - simplified */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-white border-2 border-black text-center uppercase font-bold"
                        placeholder="ENTER CODE"
                        autoFocus
                        maxLength={10}
                        style={{ fontFamily: 'var(--font-press-start)' }}
                      />

                    </div>
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex justify-center mt-6">
                    <button
                      type="submit"
                      className={`bg-amber-500 ${pixelBorder} px-6 py-2 font-bold text-sm hover:bg-amber-400 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${pixelShadow}`}
                      style={{ fontFamily: 'var(--font-press-start)' }}
                    >
                      UNLOCK
                    </button>
                  </div>
                  
                  {/* Message display */}
                  <AnimatePresence>
                    {codeMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-4 p-2 border-2 border-black overflow-hidden ${codeMessage.type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}
                      >
                        <p className="text-center text-sm font-bold">
                          {codeMessage.text}
                        </p>
                        {unlockedAsset && codeMessage.type === 'success' && (
                          <p className="text-center text-xs mt-1">
                            {unlockedAsset.description}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CodeInputComponent;
