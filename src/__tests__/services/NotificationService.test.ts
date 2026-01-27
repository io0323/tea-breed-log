import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications, useNotificationActions } from '../contexts/NotificationContext';
import { NotificationService } from '../services/NotificationService';

// Mock NotificationService
jest.mock('../services/NotificationService');

describe('NotificationContext', () => {
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    mockNotificationService = new NotificationService() as jest.Mocked<NotificationService>;
    mockNotificationService.initialize = jest.fn().mockResolvedValue(undefined);
    mockNotificationService.requestPermission = jest.fn().mockResolvedValue('granted');
    mockNotificationService.saveNotification = jest.fn().mockResolvedValue(undefined);
    mockNotificationService.showPushNotification = jest.fn().mockResolvedValue(undefined);
    mockNotificationService.getStoredNotifications = jest.fn().mockResolvedValue([]);
  });

  const TestComponent = () => {
    const { notifications, unreadCount } = useNotifications();
    const { notifyTeaGrowth, notifyHealthIssue } = useNotificationActions();

    return (
      <div>
        <div data-testid="notification-count">{unreadCount}</div>
        <div data-testid="notifications-length">{notifications.length}</div>
        <button onClick={() => notifyTeaGrowth('Test Tea', 'Seedling')}>
          Notify Growth
        </button>
        <button onClick={() => notifyHealthIssue('Test Tea', 'Pest detected')}>
          Notify Health
        </button>
      </div>
    );
  };

  it('should initialize with empty notifications', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    expect(screen.getByTestId('notifications-length')).toHaveTextContent('0');
  });

  it('should add tea growth notification', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const notifyButton = screen.getByText('Notify Growth');
    fireEvent.click(notifyButton);

    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notifications-length')).toHaveTextContent('1');
    });

    expect(mockNotificationService.saveNotification).toHaveBeenCalled();
    expect(mockNotificationService.showPushNotification).toHaveBeenCalled();
  });

  it('should add health issue notification', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const notifyButton = screen.getByText('Notify Health');
    fireEvent.click(notifyButton);

    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notifications-length')).toHaveTextContent('1');
    });

    expect(mockNotificationService.saveNotification).toHaveBeenCalled();
    expect(mockNotificationService.showPushNotification).toHaveBeenCalled();
  });

  it('should mark notification as read', async () => {
    const TestComponentWithMarkAsRead = () => {
      const { notifications, markAsRead } = useNotifications();

      return (
        <div>
          <button 
            onClick={() => notifications[0] && markAsRead(notifications[0].id)}
            disabled={!notifications[0]}
          >
            Mark as Read
          </button>
          <div data-testid="notifications-length">{notifications.length}</div>
        </div>
      );
    };

    render(
      <NotificationProvider>
        <TestComponentWithMarkAsRead />
      </NotificationProvider>
    );

    // First add a notification
    const notifyButton = screen.getByText('Notify Growth');
    fireEvent.click(notifyButton);

    await waitFor(() => {
      expect(screen.getByTestId('notifications-length')).toHaveTextContent('1');
    });

    // Then mark it as read
    const markAsReadButton = screen.getByText('Mark as Read');
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(mockNotificationService.markAsRead).toHaveBeenCalled();
    });
  });
});

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    // Mock browser APIs
    Object.defineProperty(window, 'Notification', {
      value: jest.fn(),
      writable: true
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue(undefined)
      },
      writable: true
    });
  });

  it('should initialize service worker', async () => {
    await notificationService.initialize();
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
  });

  it('should request notification permission', async () => {
    const mockPermission = 'granted';
    (window.Notification as jest.Mock).mockImplementation({
      requestPermission: jest.fn().mockResolvedValue(mockPermission)
    });

    const permission = await notificationService.requestPermission();
    expect(permission).toBe(mockPermission);
  });

  it('should save notification to storage', async () => {
    const notification = {
      id: 'test-id',
      type: 'info' as const,
      title: 'Test',
      message: 'Test message',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium' as const,
      category: 'system' as const
    };

    const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    await notificationService.saveNotification(notification);
    
    expect(localStorageSpy).toHaveBeenCalledWith(
      'tea_notifications',
      expect.any(String)
    );
    
    localStorageSpy.mockRestore();
  });

  it('should handle browser notifications', async () => {
    const notification = {
      id: 'test-id',
      type: 'info' as const,
      title: 'Test',
      message: 'Test message',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'medium' as const,
      category: 'system' as const
    };

    const mockNotification = {
      close: jest.fn(),
      onclick: null
    };

    (window.Notification as jest.Mock).mockImplementation(() => mockNotification);
    Object.defineProperty(window.Notification, 'permission', {
      value: 'granted',
      writable: true
    });

    await notificationService.showPushNotification(notification);

    expect(window.Notification).toHaveBeenCalledWith(
      'Test',
      expect.objectContaining({
        body: 'Test message',
        icon: '/icons/icon-192x192.png'
      })
    );
  });
});
