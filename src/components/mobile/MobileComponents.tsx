import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// モバイルナビゲーションの型定義
export interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
  active?: boolean;
}

// モバイルボトムナビゲーション
export const MobileBottomNav = memo(({ 
  items, 
  activeItem, 
  onItemClick 
}: {
  items: MobileNavItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItem;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

// モバイルスワイプコンテナ
export const MobileSwipeContainer = memo(({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = '' 
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}) => {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || startX.current === null || startY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;

    // 水平スワイプを優先
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || startX.current === null || startY.current === null) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;

    // スワイプの閾値
    const swipeThreshold = 50;
    const verticalThreshold = 30;

    // 水平スワイプの判定
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaY) < verticalThreshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // リセット
    startX.current = null;
    startY.current = null;
    isDragging.current = false;
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <div
      className={`touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
});

MobileSwipeContainer.displayName = 'MobileSwipeContainer';

// モバイルプルツーリフレッシュ
export const MobilePullToRefresh = memo(({ 
  children, 
  onRefresh, 
  isRefreshing,
  className = '' 
}: {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  className?: string;
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || startY.current === null) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    
    // 下方向へのスワイプのみ
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY, 100));
      e.preventDefault();
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance > 60 && !isRefreshing) {
      await onRefresh();
    }

    setPullDistance(0);
    setIsPulling(false);
    startY.current = null;
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* プルツーリフレッシュインジケーター */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center bg-white border-b border-gray-200 transition-transform duration-200 z-10"
        style={{
          transform: `translateY(${Math.max(pullDistance - 60, -60)}px)`,
          height: '60px',
        }}
      >
        {isRefreshing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">更新中...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <ChevronDownIcon 
              className="h-5 w-5 text-gray-400 transition-transform duration-200"
              style={{
                transform: `rotate(${pullDistance > 60 ? 180 : 0}deg)`,
              }}
            />
            <span className="text-sm text-gray-400">
              {pullDistance > 60 ? '離して更新' : '下に引いて更新'}
            </span>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div 
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${Math.max(pullDistance, 0)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
});

MobilePullToRefresh.displayName = 'MobilePullToRefresh';

// モバイルモーダル
export const MobileModal = memo(({ 
  isOpen, 
  onClose, 
  title, 
  children,
  showCloseButton = true,
  size = 'full'
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'full' | 'large' | 'medium' | 'small';
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 背景クリックで閉じる
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    full: 'max-w-full mx-4',
    large: 'max-w-2xl mx-4',
    medium: 'max-w-lg mx-4',
    small: 'max-w-sm mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex min-h-full items-center justify-center bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      >
        <div 
          ref={modalRef}
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl`}
        >
          {/* ヘッダー */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* コンテンツ */}
          <div className="max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

MobileModal.displayName = 'MobileModal';

// モバイルフローティングアクションボタン
export const MobileFAB = memo(({ 
  icon, 
  onClick, 
  label,
  position = 'bottom-right',
  color = 'blue'
}: {
  icon: React.ComponentType<any>;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}) => {
  const [showLabel, setShowLabel] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <div className="relative">
        {/* ラベル */}
        {label && showLabel && (
          <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
            {label}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* FABボタン */}
        <button
          onClick={onClick}
          onMouseEnter={() => setShowLabel(true)}
          onMouseLeave={() => setShowLabel(false)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${colorClasses[color]}`}
        >
          {React.createElement(icon, { className: "h-6 w-6" })}
        </button>
      </div>
    </div>
  );
});

MobileFAB.displayName = 'MobileFAB';

// モバイルスライドパネル
export const MobileSlidePanel = memo(({ 
  isOpen, 
  onClose, 
  position = 'bottom',
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  position?: 'bottom' | 'top' | 'left' | 'right';
  children: React.ReactNode;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // 背景クリックで閉じる
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // スワイプで閉じる
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (position === 'bottom' && deltaY > 0) {
        panel.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleTouchEnd = () => {
      const deltaY = currentY - startY;
      
      if (position === 'bottom' && deltaY > 100) {
        onClose();
      } else {
        panel.style.transform = '';
      }
    };

    panel.addEventListener('touchstart', handleTouchStart);
    panel.addEventListener('touchmove', handleTouchMove);
    panel.addEventListener('touchend', handleTouchEnd);

    return () => {
      panel.removeEventListener('touchstart', handleTouchStart);
      panel.removeEventListener('touchmove', handleTouchMove);
      panel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, position, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    bottom: 'fixed bottom-0 left-0 right-0',
    top: 'fixed top-0 left-0 right-0',
    left: 'fixed top-0 left-0 bottom-0',
    right: 'fixed top-0 right-0 bottom-0',
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      />
      <div 
        ref={panelRef}
        className={`absolute ${positionClasses[position]} bg-white shadow-xl transition-transform duration-300`}
        style={{
          transform: position === 'bottom' ? 'translateY(0)' : 
                   position === 'top' ? 'translateY(0)' :
                   position === 'left' ? 'translateX(0)' : 'translateX(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
});

MobileSlidePanel.displayName = 'MobileSlidePanel';

// モバイルタッチフィードバック
export const MobileTouchFeedback = memo(({ 
  children, 
  className = '',
  feedbackScale = 0.95 
}: {
  children: React.ReactNode;
  className?: string;
  feedbackScale?: number;
}) => {
  return (
    <div 
      className={`active:scale-${Math.round(feedbackScale * 100)} transition-transform duration-100 ${className}`}
      style={{
        '--tw-scale-x': feedbackScale,
        '--tw-scale-y': feedbackScale,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
});

MobileTouchFeedback.displayName = 'MobileTouchFeedback';
