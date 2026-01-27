import React, { useState, useRef, useEffect, memo, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = memo(({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.jpg',
  threshold = 0.1,
  onLoad,
  onError,
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observerで画像がビューポートに入ったことを検出
  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observerRef.current.observe(imgElement);

    return () => {
      if (observerRef.current && imgElement) {
        observerRef.current.unobserve(imgElement);
      }
    };
  }, [threshold]);

  // 画像読み込み完了ハンドラ
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // 画像読み込みエラーハンドラ
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {/* ローディングスケルトン */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* エラー時のフォールバック */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">読み込み失敗</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';
