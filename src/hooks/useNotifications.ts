import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Notification, NotificationSettings, NotificationStats } from '../types/notification';

const STORAGE_KEY = 'teaNotifications';
const SETTINGS_KEY = 'notificationSettings';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (typeof window === 'undefined') {
      return {
        enabled: true,
        healthAlerts: true,
        growthReminders: true,
        systemUpdates: true,
        soundEnabled: false,
        desktopNotifications: false,
        emailNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      };
    }
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      enabled: true,
      healthAlerts: true,
      growthReminders: true,
      systemUpdates: true,
      soundEnabled: false,
      desktopNotifications: false,
      emailNotifications: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };
  });

  // localStorageへの保存を最適化（debounce）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [notifications]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [settings]);

  // 通知を追加（メモ化）
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // デスクトップ通知
    if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }

    // 音声通知
    if (settings.soundEnabled) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        // 音声再生失敗を無視
      });
    }

    return newNotification;
  }, [settings.desktopNotifications, settings.soundEnabled]);

  // 通知を既読にする（メモ化）
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // すべて既読にする（メモ化）
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // 通知を削除（メモ化）
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // 期限切れ通知をクリーンアップ（メモ化）
  const cleanupExpiredNotifications = useCallback(() => {
    const now = new Date();
    setNotifications(prev =>
      prev.filter(notification => {
        if (!notification.expiresAt) return true;
        return new Date(notification.expiresAt) > now;
      })
    );
  }, []);

  // 統計情報の計算（メモ化）
  const stats = useMemo((): NotificationStats => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recent = notifications
      .filter(n => !n.read)
      .slice(0, 5);

    return {
      total,
      unread,
      byType,
      byPriority,
      recent,
    };
  }, [notifications]);

  // デスクトップ通知の権限をリクエスト
  const requestDesktopNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // 通知設定を更新（メモ化）
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // 定期的なクリーンアップ
  useEffect(() => {
    const interval = setInterval(cleanupExpiredNotifications, 60000); // 1分ごと
    return () => clearInterval(interval);
  }, [cleanupExpiredNotifications]);

  // 初期化時にデスクトップ通知権限を確認
  useEffect(() => {
    if (settings.desktopNotifications && 'Notification' in window) {
      requestDesktopNotificationPermission();
    }
  }, [settings.desktopNotifications, requestDesktopNotificationPermission]);

  return {
    notifications,
    settings,
    stats,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    cleanupExpiredNotifications,
    requestDesktopNotificationPermission,
    updateSettings,
  };
};
