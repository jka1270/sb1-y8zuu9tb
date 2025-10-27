// Performance monitoring and optimization utilities

// Measure and log performance metrics
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  return async () => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  };
};

// Throttle function calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Debounce function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimize animations based on user preference
export const getAnimationDuration = (defaultDuration: number): number => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};

// Memory usage monitoring
export const getMemoryUsage = (): PerformanceMemory | null => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

// Network connection monitoring
export const getConnectionInfo = (): NetworkInformation | null => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    return (navigator as any).connection;
  }
  return null;
};

// Adaptive loading based on connection
export const shouldLoadHighQualityImages = (): boolean => {
  const connection = getConnectionInfo();
  if (!connection) return true; // Default to high quality if unknown
  
  // Load high quality on fast connections
  return connection.effectiveType === '4g' || connection.downlink > 1.5;
};

// Preload critical resources
export const preloadCriticalResources = (resources: string[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      link.as = 'image';
    } else if (resource.match(/\.(woff|woff2|ttf|otf)$/i)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (resource.match(/\.css$/i)) {
      link.as = 'style';
    } else if (resource.match(/\.js$/i)) {
      link.as = 'script';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Cleanup function for removing preload links
export const cleanupPreloadLinks = () => {
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  preloadLinks.forEach(link => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  });
};