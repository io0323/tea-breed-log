import React, { useState, useCallback, memo } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { XMarkIcon, BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Notification } from '../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem = memo(({ notification, onMarkAsRead, onRemove }: NotificationItemProps) => {
  const handleMarkAsRead = useCallback(() => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  }, [notification.id, notification.read, onMarkAsRead]);

  const handleRemove = useCallback(() => {
    onRemove(notification.id);
  }, [notification.id, onRemove]);

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'health_alert':
        return '🏥';
      case 'growth_reminder':
        return '🌱';
      case 'system_update':
        return '🔄';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'health_alert':
        return 'border-orange-200 bg-orange-50';
      case 'growth_reminder':
        return 'border-blue-200 bg-blue-50';
      case 'system_update':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`relative border-l-4 p-4 rounded-lg transition-all duration-200 ${getNotificationColor()} ${
        !notification.read ? 'shadow-md' : 'shadow-sm'
      }`}
      onClick={handleMarkAsRead}
    >
      {/* 優先度インジケーター */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getPriorityColor()}`} />
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-xl">
          {getNotificationIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium text-gray-900 ${
              !notification.read ? 'font-semibold' : ''
            }`}>
              {notification.title}
            </h3>
            
            <div className="flex items-center space-x-2 ml-4">
              {!notification.read && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  新着
                </span>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="mt-1 text-sm text-gray-600">
            {notification.message}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(notification.timestamp).toLocaleString('ja-JP')}
            </span>
            
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {notification.actionText || '詳細を見る'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export const NotificationCenter = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, stats, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="relative">
      {/* 通知ボタン */}
      <button
        onClick={toggleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        
        {/* 未読数バッジ */}
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
          </span>
        )}
      </button>

      {/* 通知パネル */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">通知</h2>
            
            <div className="flex items-center space-x-2">
              {unreadNotifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  すべて既読
                </button>
              )}
              
              <button
                onClick={toggleOpen}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 通知リスト */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <BellIcon className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500">通知はありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>合計 {notifications.length} 件</span>
                <span>未読 {unreadNotifications.length} 件</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={toggleOpen}
        />
      )}
    </div>
  );
});

NotificationCenter.displayName = 'NotificationCenter';
