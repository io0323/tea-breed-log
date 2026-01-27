import { openDB } from 'idb';
import type { Tea, GrowthRecord, HealthRecord } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version: string;
}

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

class OfflineStorage {
  private db: any;
  private readonly DB_NAME = 'teaBreedLogOffline';
  private readonly DB_VERSION = 1;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24時間

  async initialize(): Promise<void> {
    try {
      this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // キャッシュストア
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt');
          cacheStore.createIndex('timestamp', 'timestamp');

          // 同期キュー
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status');
          syncStore.createIndex('timestamp', 'timestamp');

          // お茶データ
          const teaStore = db.createObjectStore('teas', { keyPath: 'id' });
          teaStore.createIndex('name', 'name');
          teaStore.createIndex('category', 'category');
          teaStore.createIndex('lastModified', 'lastModified');

          // 成長記録
          const growthStore = db.createObjectStore('growthRecords', { keyPath: 'id' });
          growthStore.createIndex('teaId', 'teaId');
          growthStore.createIndex('date', 'date');
          growthStore.createIndex('lastModified', 'lastModified');

          // 健康記録
          const healthStore = db.createObjectStore('healthRecords', { keyPath: 'id' });
          healthStore.createIndex('teaId', 'teaId');
          healthStore.createIndex('date', 'date');
          healthStore.createIndex('lastModified', 'lastModified');

          // メディアキャッシュ
          const mediaStore = db.createObjectStore('media', { keyPath: 'url' });
          mediaStore.createIndex('type', 'type');
          mediaStore.createIndex('expiresAt', 'expiresAt');
        }
      });

      // 期限切れキャッシュのクリーンアップ
      await this.cleanupExpiredCache();
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      throw error;
    }
  }

  // キャッシュ操作
  async setCache<T>(key: string, data: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : Date.now() + this.CACHE_EXPIRY,
      version: '1.0'
    };

    await this.db.put('cache', entry, key);
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.db.get('cache', key) as CacheEntry<T>;
      
      if (!entry) return null;
      
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.db.delete('cache', key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  async clearCache(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = await this.db.getAllKeys('cache');
      const matchingKeys = keys.filter(key => key.includes(pattern));
      await Promise.all(matchingKeys.map(key => this.db.delete('cache', key)));
    } else {
      await this.db.clear('cache');
    }
  }

  private async cleanupExpiredCache(): Promise<void> {
    const now = Date.now();
    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const index = store.index('expiresAt');
    
    let cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
  }

  // お茶データ操作
  async saveTea(tea: Tea): Promise<void> {
    const teaWithTimestamp = {
      ...tea,
      lastModified: Date.now()
    };
    
    await this.db.put('teas', teaWithTimestamp);
    
    // 同期キューに追加
    await this.addToSyncQueue({
      id: `tea_${tea.id}_${Date.now()}`,
      type: tea.id.includes('temp_') ? 'create' : 'update',
      resource: 'tea',
      data: teaWithTimestamp,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
  }

  async getTea(id: string): Promise<Tea | null> {
    try {
      return await this.db.get('teas', id);
    } catch (error) {
      console.error('Failed to get tea:', error);
      return null;
    }
  }

  async getAllTeas(): Promise<Tea[]> {
    try {
      return await this.db.getAll('teas');
    } catch (error) {
      console.error('Failed to get all teas:', error);
      return [];
    }
  }

  async deleteTea(id: string): Promise<void> {
    await this.db.delete('teas', id);
    
    // 同期キューに追加
    await this.addToSyncQueue({
      id: `tea_${id}_${Date.now()}`,
      type: 'delete',
      resource: 'tea',
      data: { id },
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
  }

  // 成長記録操作
  async saveGrowthRecord(record: GrowthRecord): Promise<void> {
    const recordWithTimestamp = {
      ...record,
      lastModified: Date.now()
    };
    
    await this.db.put('growthRecords', recordWithTimestamp);
    
    await this.addToSyncQueue({
      id: `growth_${record.id}_${Date.now()}`,
      type: record.id.includes('temp_') ? 'create' : 'update',
      resource: 'growthRecord',
      data: recordWithTimestamp,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
  }

  async getGrowthRecords(teaId: string): Promise<GrowthRecord[]> {
    try {
      return await this.db.getAllFromIndex('growthRecords', 'teaId', teaId);
    } catch (error) {
      console.error('Failed to get growth records:', error);
      return [];
    }
  }

  async deleteGrowthRecord(id: string): Promise<void> {
    await this.db.delete('growthRecords', id);
    
    await this.addToSyncQueue({
      id: `growth_${id}_${Date.now()}`,
      type: 'delete',
      resource: 'growthRecord',
      data: { id },
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
  }

  // 健康記録操作
  async saveHealthRecord(record: HealthRecord): Promise<void> {
    const recordWithTimestamp = {
      ...record,
      lastModified: Date.now()
    };
    
    await this.db.put('healthRecords', recordWithTimestamp);
    
    await this.addToSyncQueue({
      id: `health_${record.id}_${Date.now()}`,
      type: record.id.includes('temp_') ? 'create' : 'update',
      resource: 'healthRecord',
      data: recordWithTimestamp,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
  }

  async getHealthRecords(teaId: string): Promise<HealthRecord[]> {
    try {
      return await this.db.getAllFromIndex('healthRecords', 'teaId', teaId);
    } catch (error) {
      console.error('Failed to get health records:', error);
      return [];
    }
  }

  async deleteHealthRecord(id: string): Promise<void> {
    await this.db.delete('healthRecords', id);
    
    await this.addToSyncQueue({
      id: `health_${id}_${Date.now()}`,
      type: 'delete',
      resource: 'healthRecord',
      data: { id },
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
  }

  // 同期キュー操作
  private async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    await this.db.put('syncQueue', item);
  }

  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    try {
      return await this.db.getAllFromIndex('syncQueue', 'status', 'pending');
    } catch (error) {
      console.error('Failed to get pending sync items:', error);
      return [];
    }
  }

  async updateSyncItemStatus(id: string, status: SyncQueueItem['status']): Promise<void> {
    const item = await this.db.get('syncQueue', id);
    if (item) {
      item.status = status;
      if (status === 'failed') {
        item.retries += 1;
      }
      await this.db.put('syncQueue', item);
    }
  }

  async removeSyncItem(id: string): Promise<void> {
    await this.db.delete('syncQueue', id);
  }

  async clearCompletedSyncItems(): Promise<void> {
    const tx = this.db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const index = store.index('status');
    
    let cursor = await index.openCursor('completed');
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
  }

  // メディアキャッシュ
  async cacheMedia(url: string, blob: Blob, type: string): Promise<void> {
    const entry = {
      url,
      blob,
      type,
      timestamp: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7日間
    };
    
    await this.db.put('media', entry);
  }

  async getCachedMedia(url: string): Promise<Blob | null> {
    try {
      const entry = await this.db.get('media', url);
      
      if (!entry) return null;
      
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.db.delete('media', url);
        return null;
      }

      return entry.blob;
    } catch (error) {
      console.error('Failed to get cached media:', error);
      return null;
    }
  }

  // ストレージ統計
  async getStorageStats(): Promise<{
    teas: number;
    growthRecords: number;
    healthRecords: number;
    mediaFiles: number;
    cacheSize: number;
    syncQueueSize: number;
  }> {
    try {
      const [
        teas,
        growthRecords,
        healthRecords,
        mediaFiles,
        cacheEntries,
        syncQueueItems
      ] = await Promise.all([
        this.db.count('teas'),
        this.db.count('growthRecords'),
        this.db.count('healthRecords'),
        this.db.count('media'),
        this.db.count('cache'),
        this.db.count('syncQueue')
      ]);

      return {
        teas,
        growthRecords,
        healthRecords,
        mediaFiles,
        cacheSize: cacheEntries,
        syncQueueSize: syncQueueItems
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        teas: 0,
        growthRecords: 0,
        healthRecords: 0,
        mediaFiles: 0,
        cacheSize: 0,
        syncQueueSize: 0
      };
    }
  }

  // データエクスポート
  async exportData(): Promise<{
    teas: Tea[];
    growthRecords: GrowthRecord[];
    healthRecords: HealthRecord[];
    exportDate: string;
  }> {
    try {
      const [teas, growthRecords, healthRecords] = await Promise.all([
        this.getAllTeas(),
        this.db.getAll('growthRecords'),
        this.db.getAll('healthRecords')
      ]);

      return {
        teas,
        growthRecords,
        healthRecords,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // データインポート
  async importData(data: {
    teas: Tea[];
    growthRecords: GrowthRecord[];
    healthRecords: HealthRecord[];
  }): Promise<void> {
    try {
      const tx = this.db.transaction(['teas', 'growthRecords', 'healthRecords'], 'readwrite');
      
      // お茶データ
      for (const tea of data.teas) {
        await tx.objectStore('teas').put(tea);
      }
      
      // 成長記録
      for (const record of data.growthRecords) {
        await tx.objectStore('growthRecords').put(record);
      }
      
      // 健康記録
      for (const record of data.healthRecords) {
        await tx.objectStore('healthRecords').put(record);
      }
      
      await tx.done;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}

export const offlineStorage = new OfflineStorage();
