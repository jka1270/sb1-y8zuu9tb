// Image optimization utilities
export const getOptimizedImageUrl = (
  originalUrl: string, 
  width: number, 
  height?: number,
  quality: number = 80
): string => {
  // For Pexels images, use their optimization parameters
  if (originalUrl.includes('pexels.com')) {
    const baseUrl = originalUrl.split('?')[0];
    const params = new URLSearchParams({
      auto: 'compress',
      cs: 'tinysrgb',
      w: width.toString(),
      ...(height && { h: height.toString() }),
      fit: 'crop',
      q: quality.toString()
    });
    return `${baseUrl}?${params.toString()}`;
  }
  
  // For other images, return as-is (could add other CDN optimizations here)
  return originalUrl;
};

export const generateSrcSet = (originalUrl: string, sizes: number[] = [400, 600, 800, 1200]): string => {
  if (originalUrl.includes('pexels.com')) {
    return sizes
      .map(size => `${getOptimizedImageUrl(originalUrl, size)} ${size}w`)
      .join(', ');
  }
  return '';
};

export const getImageSizes = (breakpoints: { [key: string]: string }): string => {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(${breakpoint}) ${size}`)
    .join(', ');
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Lazy load images with intersection observer
export const createLazyImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );
};