import type { Notification } from '../types/notification';

export class NotificationService {
  private readonly STORAGE_KEY = 'tea_notifications';
  private readonly SETTINGS_KEY = 'tea_notification_settings';
  private readonly MAX_NOTIFICATIONS = 100;

  async initialize(): Promise<void> {
    // Service Workerの登録
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  async showPushNotification(notification: Notification): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationOptions: NotificationOptions = {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        actions: notification.actions?.map(action => ({
          action: action.action,
          title: action.label
        }))
      };

      const browserNotification = new Notification(notification.title, notificationOptions);

      // クリックイベントの処理
      browserNotification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      // 自動クローズ（低・中優先度のみ）
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  private handleNotificationClick(notification: Notification): void {
    // 通知クリック時の処理
    if (notification.actions && notification.actions.length > 0) {
      const primaryAction = notification.actions[0];
      this.executeAction(primaryAction.action, primaryAction.data);
    }

    // カスタムイベントを発行
    window.dispatchEvent(new CustomEvent('notificationClick', {
      detail: { notification }
    }));
  }

  private executeAction(action: string, data?: any): void {
    switch (action) {
      case 'view-details':
        // 詳細ページへ遷移
        window.location.href = `/tea/${data.name}`;
        break;
      case 'view-health':
        // 健康状態ページへ遷移
        window.location.href = `/tea/${data.name}/health`;
        break;
      case 'add-treatment':
        // 対策記録ページへ遷移
        window.location.href = `/tea/${data.name}/treatment`;
        break;
      case 'view-weather':
        // 天気ページへ遷移
        window.location.href = '/weather';
        break;
      default:
        console.log('Unknown action:', action, data);
    }
  }

  async saveNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = [notification, ...notifications]
        .slice(0, this.MAX_NOTIFICATIONS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  }

  async getStoredNotifications(): Promise<Notification[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async removeNotification(id: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.filter(n => n.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  async updateSettings(settings: any): Promise<void> {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  async getSettings(): Promise<any> {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      return null;
    }
  }

  // 定期通知のスケジュール
  scheduleNotification(notification: Notification, delay: number): void {
    setTimeout(() => {
      this.showPushNotification(notification);
    }, delay);
  }

  // 位置情報ベースの通知
  async requestLocationPermission(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }

  // 天気通知の設定
  async setupWeatherNotifications(latitude: number, longitude: number): Promise<void> {
    // 天気APIを呼び出して通知を設定
    try {
      const weatherData = await this.fetchWeatherData(latitude, longitude);
      if (weatherData.alerts && weatherData.alerts.length > 0) {
        weatherData.alerts.forEach(alert => {
          this.showPushNotification({
            id: `weather_${Date.now()}`,
            type: 'warning',
            title: '天気警報',
            message: alert.description,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high',
            category: 'weather',
            actions: [
              { label: '詳細を見る', action: 'view-weather', data: { type: 'weather' } }
            ]
          });
        });
      }
    } catch (error) {
      console.error('Failed to setup weather notifications:', error);
    }
  }

  private async fetchWeatherData(latitude: number, longitude: number): Promise<any> {
    // 天気APIの実装（実際のAPIキーが必要）
    const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
    );
    return response.json();
  }

  // バッテリー状態通知
  async setupBatteryNotifications(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            this.showPushNotification({
              id: `battery_${Date.now()}`,
              type: 'warning',
              title: 'バッテリー低下',
              message: 'バッテリー残量が20%以下です。充電してください。',
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'medium',
              category: 'system'
            });
          }
        });
      } catch (error) {
        console.error('Battery API not available:', error);
      }
    }
  }

  // ネットワーク状態通知
  setupNetworkNotifications(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      connection.addEventListener('change', () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.showPushNotification({
            id: `network_${Date.now()}`,
            type: 'info',
            title: 'ネットワーク状態',
            message: '接続速度が遅いです。WiFi環境を推奨します。',
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'low',
            category: 'system'
          });
        }
      });
    }
  }

  // 定期健康チェック通知
  scheduleHealthCheckNotifications(): void {
    // 毎朝9時に健康チェック通知
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const delay = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.showPushNotification({
        id: `health_check_${Date.now()}`,
        type: 'info',
        title: '健康チェック',
        message: 'お茶の健康状態を確認しましょう。',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'health',
        actions: [
          { label: '確認する', action: 'view-health', data: { type: 'health' } }
        ]
      });
      
      // 毎日繰り返す
      this.scheduleHealthCheckNotifications();
    }, delay);
  }
}
