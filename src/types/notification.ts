export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'health_alert' | 'growth_reminder' | 'system_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  healthAlerts: boolean;
  growthReminders: boolean;
  systemUpdates: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  recent: Notification[];
}
