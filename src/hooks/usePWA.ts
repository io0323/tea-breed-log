import { useState, useEffect, useCallback } from 'react';

// PWA機能の型定義
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWANotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PWAInfo {
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  installPrompt: PWAInstallPrompt | null;
  supportsNotifications: boolean;
  notificationPermission: NotificationPermission;
  supportsBackgroundSync: boolean;
  supportsShareAPI: boolean;
}

export const usePWA = () => {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo>({
    isInstalled: false,
    isStandalone: false,
    isOnline: navigator.onLine,
    installPrompt: null,
    supportsNotifications: 'Notification' in window,
    notificationPermission: 'default',
    supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    supportsShareAPI: 'share' in navigator,
  });

  // PWA情報の更新
  const updatePWAInfo = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    setPwaInfo(prev => ({
      ...prev,
      isStandalone,
      isOnline: navigator.onLine,
    }));
  }, []);

  // インストールプロンプトの検出
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPwaInfo(prev => ({
        ...prev,
        installPrompt: event as any,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // オンライン/オフライン状態の監視
  useEffect(() => {
    const handleOnline = () => {
      setPwaInfo(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPwaInfo(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 表示モードの監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleChange = () => {
      updatePWAInfo();
    };

    mediaQuery.addEventListener('change', handleChange);
    updatePWAInfo();

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [updatePWAInfo]);

  // 通知権限の取得
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!pwaInfo.supportsNotifications) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setPwaInfo(prev => ({ ...prev, notificationPermission: permission }));
    
    return permission;
  }, [pwaInfo.supportsNotifications]);

  // 通知の表示
  const showNotification = useCallback(async (options: PWANotificationOptions) => {
    if (!pwaInfo.supportsNotifications) {
      console.warn('Notifications are not supported');
      return false;
    }

    if (pwaInfo.notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag,
        data: options.data,
        actions: options.actions,
      });

      // 通知クリック処理
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // データに基づいてアクションを実行
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }, [pwaInfo.supportsNotifications, pwaInfo.notificationPermission, requestNotificationPermission]);

  // PWAのインストール
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!pwaInfo.installPrompt) {
      return false;
    }

    try {
      await pwaInfo.installPrompt.prompt();
      const { outcome } = await pwaInfo.installPrompt.userChoice;
      
      setPwaInfo(prev => ({ ...prev, installPrompt: null }));
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }, [pwaInfo.installPrompt]);

  // シェア機能
  const shareContent = useCallback(async (data: {
    title: string;
    text: string;
    url?: string;
  }): Promise<boolean> => {
    if (!pwaInfo.supportsShareAPI) {
      console.warn('Share API is not supported');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to share:', error);
      }
      return false;
    }
  }, [pwaInfo.supportsShareAPI]);

  // バックグラウンド同期の登録
  const registerBackgroundSync = useCallback(async (tag: string): Promise<boolean> => {
    if (!pwaInfo.supportsBackgroundSync) {
      console.warn('Background Sync is not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Failed to register background sync:', error);
      return false;
    }
  }, [pwaInfo.supportsBackgroundSync]);

  // Service Workerの登録
  const registerServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker is not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // アップデートチェック
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新しいバージョンが利用可能
              showNotification({
                title: 'アップデート利用可能',
                body: '新しいバージョンのアプリが利用可能です。再読み込みしてください。',
                data: { action: 'reload' },
              });
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to register Service Worker:', error);
      return false;
    }
  }, [showNotification]);

  // アプリの更新
  const updateApp = useCallback(async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update app:', error);
    }
  }, []);

  // 初期化
  useEffect(() => {
    // 通知権限の初期状態を取得
    if (pwaInfo.supportsNotifications) {
      setPwaInfo(prev => ({
        ...prev,
        notificationPermission: Notification.permission,
      }));
    }

    // Service Workerの登録
    registerServiceWorker();
  }, [pwaInfo.supportsNotifications, registerServiceWorker]);

  return {
    pwaInfo,
    requestNotificationPermission,
    showNotification,
    installPWA,
    shareContent,
    registerBackgroundSync,
    registerServiceWorker,
    updateApp,
  };
};
