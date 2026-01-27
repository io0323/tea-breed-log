const CACHE_NAME = 'teabreed-log-v1';
const STATIC_CACHE_NAME = 'teabreed-log-static-v1';
const DYNAMIC_CACHE_NAME = 'teabreed-log-dynamic-v1';

// キャッシュするファイルのリスト
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // CSSファイル
  '/static/css/main.css',
  // JSファイル
  '/static/js/main.js',
  // フォント
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
];

// インストールイベント
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to activate', error);
      })
  );
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同じオリジンの場合のみ処理
  if (url.origin === self.location.origin) {
    event.respondWith(handleRequest(request));
  }
});

// リクエスト処理
async function handleRequest(request) {
  try {
    // 静的アセットの場合はキャッシュ優先
    if (isStaticAsset(request.url)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }

    // APIリクエストの場合はネットワーク優先
    if (isApiRequest(request.url)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }

    // その他のリクエストはネットワーク優先
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
  } catch (error) {
    console.error('Service Worker: Request handling failed', error);
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// キャッシュファースト戦略
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First: Network request failed', error);
    throw error;
  }
}

// ネットワークファースト戦略
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network First: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// ステールワイルレリニュ戦略
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// 静的アセットの判定
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('/icons/') ||
         url.includes('/static/') ||
         url.endsWith('.css') ||
         url.endsWith('.js') ||
         url.endsWith('.png') ||
         url.endsWith('.jpg') ||
         url.endsWith('.jpeg') ||
         url.endsWith('.svg') ||
         url.endsWith('.woff') ||
         url.endsWith('.woff2');
}

// APIリクエストの判定
function isApiRequest(url) {
  return url.includes('/api/') || 
         url.includes('supabase') ||
         url.includes('graphql');
}

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// バックグラウンド同期処理
async function doBackgroundSync() {
  try {
    // オフライン中のデータを同期
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      try {
        await syncData(data);
        await removeOfflineData(data.id);
      } catch (error) {
        console.error('Failed to sync data', error);
      }
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed', error);
  }
}

// プッシュ通知
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '詳細を見る',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TeaBreed Log', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 何もしない
  } else {
    // デフォルト動作
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// オフラインデータ管理（簡易実装）
async function getOfflineData() {
  // 実際の実装ではIndexedDBを使用
  return [];
}

async function removeOfflineData(id) {
  // 実際の実装ではIndexedDBを使用
  console.log('Removing offline data', id);
}

async function syncData(data) {
  // 実際の実装ではAPIにデータを送信
  console.log('Syncing data', data);
}
