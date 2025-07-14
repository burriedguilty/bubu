// Mock for window.matchMedia for server-side rendering
if (typeof window === 'undefined') {
  global.matchMedia = () => {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
}

export {};
