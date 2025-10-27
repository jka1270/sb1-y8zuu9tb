import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  loading = 'lazy',
  sizes,
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
  };

  // Generate optimized Pexels URLs
  const getOptimizedSrc = (originalSrc: string, width: number) => {
    if (originalSrc.includes('pexels.com')) {
      // Extract the base URL and add optimization parameters
      const baseUrl = originalSrc.split('?')[0];
      return `${baseUrl}?auto=compress&cs=tinysrgb&w=${width}&h=${width}&fit=crop`;
    }
    return originalSrc;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (originalSrc: string) => {
    if (originalSrc.includes('pexels.com')) {
      return [
        `${getOptimizedSrc(originalSrc, 400)} 400w`,
        `${getOptimizedSrc(originalSrc, 600)} 600w`,
        `${getOptimizedSrc(originalSrc, 800)} 800w`,
        `${getOptimizedSrc(originalSrc, 1200)} 1200w`
      ].join(', ');
    }
    return undefined;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-pulse">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <span className="text-gray-500 text-sm">Image unavailable</span>
          </div>
        </div>
      ) : (
        <img
          src={currentSrc}
          srcSet={generateSrcSet(currentSrc)}
          sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          alt={alt}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          decoding="async"
        />
      )}
    </div>
  );
}