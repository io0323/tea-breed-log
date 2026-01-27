import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { NotificationService } from '../services/NotificationService';
import type { Notification, NotificationType } from '../types/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isEnabled: boolean;
  settings: NotificationSettings;
}

interface NotificationSettings {
  enablePush: boolean;
  enableEmail: boolean;
  enableInApp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    teaGrowth: boolean;
    health: boolean;
    weather: boolean;
    system: boolean;
  };
}

interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isEnabled: true,
  settings: {
    enablePush: true,
    enableEmail: false,
    enableInApp: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      teaGrowth: true,
      health: true,
      weather: true,
      system: true
    }
  }
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      };
    }
    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };
    }
    case 'MARK_ALL_AS_READ': {
      const readNotifications = state.notifications.map(n => ({ ...n, read: true }));
      return {
        ...state,
        notifications: readNotifications,
        unreadCount: 0
      };
    }
    case 'REMOVE_NOTIFICATION': {
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      };
    }
    case 'CLEAR_ALL': {
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    }
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    }
    case 'TOGGLE_NOTIFICATIONS': {
      return {
        ...state,
        isEnabled: !state.isEnabled
      };
    }
    case 'SET_NOTIFICATIONS': {
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };
    }
    default:
      return state;
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const notificationService = new NotificationService();

  useEffect(() => {
    // 通知サービスの初期化
    notificationService.initialize();
    
    // 保存された通知を読み込み
    loadNotifications();
    
    // パーミッションを要求
    requestNotificationPermission();
  }, []);

  const loadNotifications = async () => {
    try {
      const savedNotifications = await notificationService.getStoredNotifications();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: savedNotifications });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { enablePush: true } });
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!state.isEnabled) return;
    
    // カテゴリチェック
    if (!state.settings.categories[notification.category]) return;
    
    // 静止時間チェック
    if (state.settings.quietHours.enabled && isQuietHours()) {
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      timestamp: new Date().toISOString(),
      read: false
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // 通知を保存
    await notificationService.saveNotification(newNotification);

    // プッシュ通知を送信
    if (state.settings.enablePush) {
      await notificationService.showPushNotification(newNotification);
    }

    // ブラウザ通知
    if (state.settings.enableInApp) {
      showBrowserNotification(newNotification);
    }
  };

  const markAsRead = async (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
    await notificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
    await notificationService.markAllAsRead();
  };

  const removeNotification = async (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    await notificationService.removeNotification(id);
  };

  const clearAll = async () => {
    dispatch({ type: 'CLEAR_ALL' });
    await notificationService.clearAll();
  };

  const updateSettings = async (settings: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    await notificationService.updateSettings({ ...state.settings, ...settings });
  };

  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  };

  const isQuietHours = (): boolean => {
    if (!state.settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = state.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = state.settings.quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      });
    }
  };

  const generateNotificationId = (): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const value: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    toggleNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// 通知フック
export function useNotificationActions() {
  const { addNotification } = useNotifications();

  const notifyTeaGrowth = (teaName: string, growthStage: string) => {
    addNotification({
      type: 'success',
      title: '成長記録',
      message: `${teaName}が${growthStage}に達しました！`,
      category: 'teaGrowth',
      priority: 'medium',
      actions: [
        { label: '詳細を見る', action: 'view-details', data: { type: 'tea', name: teaName } }
      ]
    });
  };

  const notifyHealthIssue = (teaName: string, issue: string) => {
    addNotification({
      type: 'warning',
      title: '健康状態',
      message: `${teaName}で${issue}が確認されました`,
      category: 'health',
      priority: 'high',
      actions: [
        { label: '確認する', action: 'view-health', data: { type: 'tea', name: teaName } },
        { label: '対策を記録', action: 'add-treatment', data: { type: 'tea', name: teaName } }
      ]
    });
  };

  const notifyWeatherAlert = (description: string) => {
    addNotification({
      type: 'info',
      title: '天気情報',
      message: description,
      category: 'weather',
      priority: 'medium',
      actions: [
        { label: '詳細', action: 'view-weather', data: { type: 'weather' } }
      ]
    });
  };

  const notifySystem = (title: string, message: string, type: NotificationType = 'info') => {
    addNotification({
      type,
      title,
      message,
      category: 'system',
      priority: 'low'
    });
  };

  return {
    notifyTeaGrowth,
    notifyHealthIssue,
    notifyWeatherAlert,
    notifySystem
  };
}
