import { offlineStorage } from './OfflineStorage';
import type { Tea, GrowthRecord, HealthRecord } from '../types';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class SyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5秒

  constructor() {
    // ネットワーク状態の監視
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline(): void {
    this.isOnline = true;
    console.log('Network connection restored');
    this.autoSync();
  }

  private handleOffline(): void {
    this.isOnline = false;
    console.log('Network connection lost');
  }

  // 自動同期
  async autoSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    try {
      await this.syncPendingItems();
    } catch (error) {
      console.error('Auto sync failed:', error);
    }
  }

  // 手動同期
  async manualSync(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['オフライン状態です']
      };
    }

    if (this.syncInProgress) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['同期が進行中です']
      };
    }

    this.syncInProgress = true;

    try {
      const result = await this.syncPendingItems();
      return result;
    } catch (error) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : '同期に失敗しました']
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncPendingItems(): Promise<SyncResult> {
    const pendingItems = await offlineStorage.getPendingSyncItems();
    
    if (pendingItems.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        errors: []
      };
    }

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    // リトライ回数でソート
    const sortedItems = pendingItems.sort((a, b) => a.retries - b.retries);

    for (const item of sortedItems) {
      try {
        await this.syncItem(item);
        await offlineStorage.updateSyncItemStatus(item.id, 'completed');
        await offlineStorage.removeSyncItem(item.id);
        synced++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '同期エラー';
        
        if (item.retries >= this.MAX_RETRIES) {
          await offlineStorage.updateSyncItemStatus(item.id, 'failed');
          errors.push(`${item.resource} ${item.type}: ${errorMessage}`);
          failed++;
        } else {
          await offlineStorage.updateSyncItemStatus(item.id, 'pending');
          // リトライ遅延
          await this.delay(this.RETRY_DELAY * (item.retries + 1));
        }
      }
    }

    return {
      success: failed === 0,
      synced,
      failed,
      errors
    };
  }

  private async syncItem(item: any): Promise<void> {
    switch (item.resource) {
      case 'tea':
        await this.syncTea(item);
        break;
      case 'growthRecord':
        await this.syncGrowthRecord(item);
        break;
      case 'healthRecord':
        await this.syncHealthRecord(item);
        break;
      default:
        throw new Error(`Unknown resource type: ${item.resource}`);
    }
  }

  private async syncTea(item: any): Promise<void> {
    const tea = item.data as Tea;
    
    switch (item.type) {
      case 'create':
        await this.createTeaOnServer(tea);
        break;
      case 'update':
        await this.updateTeaOnServer(tea);
        break;
      case 'delete':
        await this.deleteTeaOnServer(tea.id);
        break;
    }
  }

  private async syncGrowthRecord(item: any): Promise<void> {
    const record = item.data as GrowthRecord;
    
    switch (item.type) {
      case 'create':
        await this.createGrowthRecordOnServer(record);
        break;
      case 'update':
        await this.updateGrowthRecordOnServer(record);
        break;
      case 'delete':
        await this.deleteGrowthRecordOnServer(record.id);
        break;
    }
  }

  private async syncHealthRecord(item: any): Promise<void> {
    const record = item.data as HealthRecord;
    
    switch (item.type) {
      case 'create':
        await this.createHealthRecordOnServer(record);
        break;
      case 'update':
        await this.updateHealthRecordOnServer(record);
        break;
      case 'delete':
        await this.deleteHealthRecordOnServer(record.id);
        break;
    }
  }

  // サーバーAPI呼び出し（実装例）
  private async createTeaOnServer(tea: Tea): Promise<void> {
    const response = await fetch('/api/teas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tea)
    });

    if (!response.ok) {
      throw new Error(`Failed to create tea: ${response.statusText}`);
    }
  }

  private async updateTeaOnServer(tea: Tea): Promise<void> {
    const response = await fetch(`/api/teas/${tea.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tea)
    });

    if (!response.ok) {
      throw new Error(`Failed to update tea: ${response.statusText}`);
    }
  }

  private async deleteTeaOnServer(id: string): Promise<void> {
    const response = await fetch(`/api/teas/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete tea: ${response.statusText}`);
    }
  }

  private async createGrowthRecordOnServer(record: GrowthRecord): Promise<void> {
    const response = await fetch('/api/growth-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      throw new Error(`Failed to create growth record: ${response.statusText}`);
    }
  }

  private async updateGrowthRecordOnServer(record: GrowthRecord): Promise<void> {
    const response = await fetch(`/api/growth-records/${record.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      throw new Error(`Failed to update growth record: ${response.statusText}`);
    }
  }

  private async deleteGrowthRecordOnServer(id: string): Promise<void> {
    const response = await fetch(`/api/growth-records/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete growth record: ${response.statusText}`);
    }
  }

  private async createHealthRecordOnServer(record: HealthRecord): Promise<void> {
    const response = await fetch('/api/health-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      throw new Error(`Failed to create health record: ${response.statusText}`);
    }
  }

  private async updateHealthRecordOnServer(record: HealthRecord): Promise<void> {
    const response = await fetch(`/api/health-records/${record.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      throw new Error(`Failed to update health record: ${response.statusText}`);
    }
  }

  private async deleteHealthRecordOnServer(id: string): Promise<void> {
    const response = await fetch(`/api/health-records/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete health record: ${response.statusText}`);
    }
  }

  // サーバーからデータを取得
  async fetchFromServer(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // お茶データの取得
      const teasResponse = await fetch('/api/teas');
      if (teasResponse.ok) {
        const teas = await teasResponse.json();
        await this.updateLocalTeas(teas);
      }

      // 成長記録の取得
      const growthResponse = await fetch('/api/growth-records');
      if (growthResponse.ok) {
        const growthRecords = await growthResponse.json();
        await this.updateLocalGrowthRecords(growthRecords);
      }

      // 健康記録の取得
      const healthResponse = await fetch('/api/health-records');
      if (healthResponse.ok) {
        const healthRecords = await healthResponse.json();
        await this.updateLocalHealthRecords(healthRecords);
      }
    } catch (error) {
      console.error('Failed to fetch data from server:', error);
    }
  }

  private async updateLocalTeas(serverTeas: Tea[]): Promise<void> {
    const localTeas = await offlineStorage.getAllTeas();
    
    for (const serverTea of serverTeas) {
      const localTea = localTeas.find(t => t.id === serverTea.id);
      
      if (!localTea || serverTea.lastModified! > localTea.lastModified!) {
        await offlineStorage.saveTea(serverTea);
      }
    }
  }

  private async updateLocalGrowthRecords(serverRecords: GrowthRecord[]): Promise<void> {
    for (const serverRecord of serverRecords) {
      const localRecords = await offlineStorage.getGrowthRecords(serverRecord.teaId);
      const localRecord = localRecords.find(r => r.id === serverRecord.id);
      
      if (!localRecord || serverRecord.lastModified! > localRecord.lastModified!) {
        await offlineStorage.saveGrowthRecord(serverRecord);
      }
    }
  }

  private async updateLocalHealthRecords(serverRecords: HealthRecord[]): Promise<void> {
    for (const serverRecord of serverRecords) {
      const localRecords = await offlineStorage.getHealthRecords(serverRecord.teaId);
      const localRecord = localRecords.find(r => r.id === serverRecord.id);
      
      if (!localRecord || serverRecord.lastModified! > localRecord.lastModified!) {
        await offlineStorage.saveHealthRecord(serverRecord);
      }
    }
  }

  // 衝突解決
  async resolveConflicts(): Promise<void> {
    // 実装が必要な場合は追加
    console.log('Conflict resolution not implemented yet');
  }

  // ユーティリティ
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 同期状態の取得
  getSyncStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    pendingItems: number;
  } {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingItems: 0 // 実際の値を取得する必要がある
    };
  }

  // 定期同期の設定
  setupPeriodicSync(intervalMinutes: number = 30): void {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.autoSync();
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export const syncService = new SyncService();
