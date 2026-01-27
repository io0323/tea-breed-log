import { useState, useEffect, useCallback, memo } from 'react';
import { usePWA } from '../hooks/usePWA';
import { 
  PhoneIcon, 
  WifiIcon, 
  BellIcon, 
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { MobileModal } from '../mobile/MobileComponents';

export const PWAInstaller = memo(() => {
  const { pwaInfo, installPWA } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');

  // インストールプロンプトの表示判定
  useEffect(() => {
    if (pwaInfo.installPrompt && !pwaInfo.isStandalone && !pwaInfo.isInstalled) {
      // ユーザーが初回訪問から一定時間経過後に表示
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [pwaInfo.installPrompt, pwaInfo.isStandalone, pwaInfo.isInstalled]);

  // インストール実行
  const handleInstall = useCallback(async () => {
    setInstallStatus('installing');
    
    try {
      const success = await installPWA();
      setInstallStatus(success ? 'success' : 'error');
      
      if (success) {
        setTimeout(() => {
          setShowInstallPrompt(false);
          setInstallStatus('idle');
        }, 2000);
      } else {
        setTimeout(() => {
          setInstallStatus('idle');
        }, 2000);
      }
    } catch (error) {
      setInstallStatus('error');
      setTimeout(() => {
        setInstallStatus('idle');
      }, 2000);
    }
  }, [installPWA]);

  // インストールプロンプトを閉じる
  const handleClose = useCallback(() => {
    setShowInstallPrompt(false);
  }, []);

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <PhoneIcon className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              TeaBreed Logをホーム画面に追加
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              アプリとしてインストールして、オフラインでも利用できます
            </p>
            
            {installStatus === 'success' && (
              <div className="flex items-center mt-2 text-xs text-green-600">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                インストール完了！
              </div>
            )}
            
            {installStatus === 'error' && (
              <div className="flex items-center mt-2 text-xs text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                インストールに失敗しました
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              disabled={installStatus === 'installing'}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {installStatus === 'installing' ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  インストール中...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                  インストール
                </>
              )}
            </button>
            
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PWAInstaller.displayName = 'PWAInstaller';

// PWA設定パネル
export const PWASettings = memo(({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { 
    pwaInfo, 
    requestNotificationPermission, 
    showNotification,
    updateApp 
  } = usePWA();
  
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: pwaInfo.notificationPermission === 'granted',
    teaGrowth: true,
    healthAlerts: true,
    systemUpdates: true,
  });

  // 通知設定の更新
  const handleNotificationToggle = useCallback(async () => {
    if (notificationSettings.enabled) {
      // 通知を無効化する場合は、ブラウザの設定画面に誘導
      showNotification({
        title: '通知設定',
        body: 'ブラウザの設定画面から通知を無効化してください',
      });
    } else {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setNotificationSettings(prev => ({ ...prev, enabled: true }));
        showNotification({
          title: '通知が有効になりました',
          body: '重要な情報をお知らせします',
        });
      }
    }
  }, [notificationSettings.enabled, requestNotificationPermission, showNotification]);

  // テスト通知
  const handleTestNotification = useCallback(() => {
    showNotification({
      title: 'テスト通知',
      body: 'これはテスト通知です',
      data: { url: '/' },
    });
  }, [showNotification]);

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} title="PWA設定">
      <div className="p-4 space-y-6">
        {/* 接続状態 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <WifiIcon className={`h-5 w-5 ${pwaInfo.isOnline ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-sm font-medium text-gray-900">
                {pwaInfo.isOnline ? 'オンライン' : 'オフライン'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <PhoneIcon className={`h-5 w-5 ${pwaInfo.isStandalone ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {pwaInfo.isStandalone ? 'PWAモード' : 'ブラウザモード'}
              </span>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">通知設定</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">プッシュ通知</div>
                <div className="text-xs text-gray-500">
                  現在: {pwaInfo.notificationPermission === 'granted' ? '有効' : 
                         pwaInfo.notificationPermission === 'denied' ? '拒否' : '未設定'}
                </div>
              </div>
              
              <button
                onClick={handleNotificationToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {notificationSettings.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">成長記録の通知</div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ 
                      ...prev, 
                      teaGrowth: !prev.teaGrowth 
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.teaGrowth ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.teaGrowth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">健康アラート</div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ 
                      ...prev, 
                      healthAlerts: !prev.healthAlerts 
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.healthAlerts ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.healthAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">システム更新</div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ 
                      ...prev, 
                      systemUpdates: !prev.systemUpdates 
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.systemUpdates ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.systemUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}

            {notificationSettings.enabled && (
              <button
                onClick={handleTestNotification}
                className="w-full mt-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                <BellIcon className="h-4 w-4 inline mr-2" />
                テスト通知を送信
              </button>
            )}
          </div>
        </div>

        {/* アプリ情報 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">アプリ情報</h3>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">バージョン</span>
              <span className="text-gray-900">1.0.0</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">PWA対応</span>
              <span className="text-green-600">✓ 対応</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">オフライン対応</span>
              <span className="text-green-600">✓ 対応</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">通知対応</span>
              <span className={pwaInfo.supportsNotifications ? 'text-green-600' : 'text-red-600'}>
                {pwaInfo.supportsNotifications ? '✓ 対応' : '✗ 非対応'}
              </span>
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="space-y-3">
          <button
            onClick={updateApp}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
            アプリを更新
          </button>
        </div>
      </div>
    </MobileModal>
  );
});

PWASettings.displayName = 'PWASettings';

// オフラインインジケーター
export const OfflineIndicator = memo(() => {
  const { pwaInfo } = usePWA();

  if (pwaInfo.isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white">
      <div className="px-4 py-2 text-center text-sm">
        <WifiIcon className="h-4 w-4 inline mr-2" />
        現在オフラインです。オンラインに戻ると自動的に同期されます。
      </div>
    </div>
  );
});

OfflineIndicator.displayName = 'OfflineIndicator';
