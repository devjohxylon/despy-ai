import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'blur',
}) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate a simple placeholder instead of heavy canvas blur
  const placeholderUrl = useMemo(() => {
    if (placeholder === 'blur') {
      // Create a simple gradient placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      
      // Create a subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, 40, 40);
      gradient.addColorStop(0, '#374151');
      gradient.addColorStop(1, '#4b5563');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 40, 40);
      
      return canvas.toDataURL();
    }
    return null;
  }, [placeholder]);

  useEffect(() => {
    if (priority) {
      setIsLoading(false);
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  if (error) {
    return (
      <div 
        className={`bg-gray-900 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <AnimatePresence>
        {isLoading && placeholder === 'blur' && placeholderUrl && (
          <motion.img
            src={placeholderUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width, height }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />

      <AnimatePresence>
        {isLoading && placeholder !== 'blur' && (
          <motion.div
            className="absolute inset-0 bg-gray-900 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
} 