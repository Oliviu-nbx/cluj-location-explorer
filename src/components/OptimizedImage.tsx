
import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderColor?: string;
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  placeholderColor = '#f3f4f6',
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState('');
  
  useEffect(() => {
    // Reset loading state when source changes
    setIsLoading(true);
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setIsLoading(false);
    };
    
    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        backgroundColor: isLoading ? placeholderColor : 'transparent',
      }}
    >
      {isLoading && (
        <div 
          className="absolute inset-0 animate-pulse" 
          style={{ backgroundColor: placeholderColor }}
        />
      )}
      
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
