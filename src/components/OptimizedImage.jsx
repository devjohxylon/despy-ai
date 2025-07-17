import { useState, useEffect } from 'react';
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
  const [blurDataURL, setBlurDataURL] = useState('');

  useEffect(() => {
    if (!priority && placeholder === 'blur') {
      // Generate tiny placeholder
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 40;
        canvas.height = 40;
        ctx.drawImage(img, 0, 0, 40, 40);
        setBlurDataURL(canvas.toDataURL());
      };
    }
  }, [src, priority, placeholder]);

  const handleLoad = () => {
    setIsLoading(false);
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
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <AnimatePresence>
        {isLoading && placeholder === 'blur' && blurDataURL && (
          <motion.img
            src={blurDataURL}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover filter blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width, height }}
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
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
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
          />
        )}
      </AnimatePresence>
    </div>
  );
} 