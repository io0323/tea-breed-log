export interface PerformanceMetrics {
  // ページパフォーマンス
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };
  
  // リソースパフォーマンス
  resources: {
    totalSize: number;
    count: number;
    cached: number;
    compressionRatio: number;
  };
  
  // ランタイムパフォーマンス
  runtime: {
    memoryUsage: number;
    jsHeapSize: number;
    frameRate: number;
    longTasks: number[];
  };
  
  // ユーザーインタラクション
  interactions: {
    clickResponse: number;
    scrollPerformance: number;
    inputDelay: number;
  };
  
  // ネットワークパフォーマンス
  network: {
    connectionType: string;
    effectiveBandwidth: number;
    rtt: number;
    offlineTime: number;
  };
  
  // エラーと警告
  errors: {
    javascript: number;
    network: number;
    console: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  score: number;
  recommendations: string[];
}

class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private isMonitoring: boolean = false;
  private readonly UPDATE_INTERVAL = 5000; // 5秒
  private readonly HISTORY_LIMIT = 100;
  private metricsHistory: PerformanceReport[] = [];

  constructor() {
    this.metrics = this.initializeMetrics();
    this.setupPerformanceObservers();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      pageLoad: {
        domContentLoaded: 0,
        loadComplete: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0
      },
      resources: {
        totalSize: 0,
        count: 0,
        cached: 0,
        compressionRatio: 0
      },
      runtime: {
        memoryUsage: 0,
        jsHeapSize: 0,
        frameRate: 0,
        longTasks: []
      },
      interactions: {
        clickResponse: 0,
        scrollPerformance: 0,
        inputDelay: 0
      },
      network: {
        connectionType: 'unknown',
        effectiveBandwidth: 0,
        rtt: 0,
        offlineTime: 0
      },
      errors: {
        javascript: 0,
        network: 0,
        console: 0
      }
    };
  }

  // 監視の開始
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.collectInitialMetrics();
    this.startContinuousMonitoring();
    this.setupErrorTracking();
    this.setupNetworkMonitoring();
    
    console.log('Performance monitoring started');
  }

  // 監視の停止
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    console.log('Performance monitoring stopped');
  }

  // パフォーマンスオブザーバーの設定
  private setupPerformanceObservers(): void {
    // ナビゲーションタイミング
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.pageLoad.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
            this.metrics.pageLoad.loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;
          }
        });
      });
      
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    }

    // ペイントタイミング
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-paint') {
            this.metrics.pageLoad.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            this.metrics.pageLoad.firstContentfulPaint = entry.startTime;
          }
        });
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // LCP（Largest Contentful Paint）
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.pageLoad.largestContentfulPaint = lastEntry.startTime;
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // リソースタイミング
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            this.metrics.resources.count++;
            this.metrics.resources.totalSize += resource.transferSize || 0;
            
            // キャッシュ判定
            if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
              this.metrics.resources.cached++;
            }
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }

    // ロングタスク
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'longtask') {
            this.metrics.runtime.longTasks.push(entry.duration);
            
            // アラートチェック
            if (entry.duration > 50) {
              this.addAlert({
                id: `longtask_${Date.now()}`,
                type: 'warning',
                metric: 'longTask',
                value: entry.duration,
                threshold: 50,
                message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                timestamp: new Date().toISOString(),
                resolved: false
              });
            }
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    }
  }

  // 初期メトリクスの収集
  private collectInitialMetrics(): void {
    // ナビゲーションタイミングAPI
    if (performance.timing) {
      const timing = performance.timing;
      this.metrics.pageLoad.domContentLoaded = timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart;
      this.metrics.pageLoad.loadComplete = timing.loadEventEnd - timing.loadEventStart;
    }

    // ペイントタイミングAPI
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.metrics.pageLoad.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.pageLoad.firstContentfulPaint = entry.startTime;
        }
      });
    }

    // リソース情報
    if (performance.getEntriesByType) {
      const resourceEntries = performance.getEntriesByType('resource');
      resourceEntries.forEach(entry => {
        const resource = entry as PerformanceResourceTiming;
        this.metrics.resources.count++;
        this.metrics.resources.totalSize += resource.transferSize || 0;
        
        if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
          this.metrics.resources.cached++;
        }
      });
    }

    // ネットワーク情報
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.network.connectionType = connection.effectiveType || 'unknown';
      this.metrics.network.effectiveBandwidth = connection.downlink || 0;
      this.metrics.network.rtt = connection.rtt || 0;
    }
  }

  // 継続的監視
  private startContinuousMonitoring(): void {
    setInterval(() => {
      if (this.isMonitoring) {
        this.updateRuntimeMetrics();
        this.checkThresholds();
        this.generateReport();
      }
    }, this.UPDATE_INTERVAL);
  }

  // ランタイムメトリクスの更新
  private updateRuntimeMetrics(): void {
    // メモリ使用量
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.runtime.memoryUsage = memory.usedJSHeapSize;
      this.metrics.runtime.jsHeapSize = memory.totalJSHeapSize;
    }

    // フレームレート（簡易的な実装）
    this.measureFrameRate();

    // ネットワーク状態
    this.updateNetworkMetrics();
  }

  // フレームレート測定
  private measureFrameRate(): void {
    let frames = 0;
    let lastTime = performance.now();
    
    const measure = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        this.metrics.runtime.frameRate = frames;
        frames = 0;
        lastTime = currentTime;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(measure);
      }
    };
    
    requestAnimationFrame(measure);
  }

  // ネットワークメトリクスの更新
  private updateNetworkMetrics(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.network.connectionType = connection.effectiveType || 'unknown';
      this.metrics.network.effectiveBandwidth = connection.downlink || 0;
      this.metrics.network.rtt = connection.rtt || 0;
    }
  }

  // エラートラッキングの設定
  private setupErrorTracking(): void {
    // JavaScriptエラー
    window.addEventListener('error', (event) => {
      this.metrics.errors.javascript++;
      this.addAlert({
        id: `js_error_${Date.now()}`,
        type: 'error',
        metric: 'javascriptError',
        value: 1,
        threshold: 0,
        message: `JavaScript Error: ${event.message}`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    });

    // 未処理のPromise拒否
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.javascript++;
      this.addAlert({
        id: `promise_rejection_${Date.now()}`,
        type: 'error',
        metric: 'promiseRejection',
        value: 1,
        threshold: 0,
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    });
  }

  // ネットワーク監視の設定
  private setupNetworkMonitoring(): void {
    // オフライン検出
    window.addEventListener('offline', () => {
      this.metrics.network.offlineTime = Date.now();
      this.addAlert({
        id: `offline_${Date.now()}`,
        type: 'warning',
        metric: 'networkStatus',
        value: 0,
        threshold: 1,
        message: 'Network connection lost',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    });

    window.addEventListener('online', () => {
      if (this.metrics.network.offlineTime > 0) {
        const offlineDuration = Date.now() - this.metrics.network.offlineTime;
        this.metrics.network.offlineTime = 0;
        
        // オフラインアラートを解決
        const offlineAlert = this.alerts.find(alert => 
          alert.metric === 'networkStatus' && !alert.resolved
        );
        if (offlineAlert) {
          offlineAlert.resolved = true;
        }
      }
    });
  }

  // しきい値チェック
  private checkThresholds(): void {
    // ペイントタイミング
    if (this.metrics.pageLoad.firstContentfulPaint > 2000) {
      this.addAlert({
        id: `fcp_${Date.now()}`,
        type: 'warning',
        metric: 'firstContentfulPaint',
        value: this.metrics.pageLoad.firstContentfulPaint,
        threshold: 2000,
        message: `First Contentful Paint is slow: ${this.metrics.pageLoad.firstContentfulPaint.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // LCP
    if (this.metrics.pageLoad.largestContentfulPaint > 2500) {
      this.addAlert({
        id: `lcp_${Date.now()}`,
        type: 'warning',
        metric: 'largestContentfulPaint',
        value: this.metrics.pageLoad.largestContentfulPaint,
        threshold: 2500,
        message: `Largest Contentful Paint is slow: ${this.metrics.pageLoad.largestContentfulPaint.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // メモリ使用量
    if (this.metrics.runtime.memoryUsage > 50 * 1024 * 1024) { // 50MB
      this.addAlert({
        id: `memory_${Date.now()}`,
        type: 'warning',
        metric: 'memoryUsage',
        value: this.metrics.runtime.memoryUsage,
        threshold: 50 * 1024 * 1024,
        message: `High memory usage: ${(this.metrics.runtime.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // フレームレート
    if (this.metrics.runtime.frameRate < 30 && this.metrics.runtime.frameRate > 0) {
      this.addAlert({
        id: `fps_${Date.now()}`,
        type: 'warning',
        metric: 'frameRate',
        value: this.metrics.runtime.frameRate,
        threshold: 30,
        message: `Low frame rate: ${this.metrics.runtime.frameRate}fps`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
  }

  // アラートの追加
  private addAlert(alert: PerformanceAlert): void {
    // 重複チェック
    const existingAlert = this.alerts.find(a => 
      a.metric === alert.metric && 
      !a.resolved && 
      Math.abs(a.timestamp - alert.timestamp) < 1000
    );

    if (!existingAlert) {
      this.alerts.push(alert);
      
      // アラート数の制限
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.filter(a => !a.resolved).slice(-25);
      }
    }
  }

  // レポート生成
  private generateReport(): PerformanceReport {
    const score = this.calculatePerformanceScore();
    const recommendations = this.generateRecommendations();

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      metrics: { ...this.metrics },
      alerts: [...this.alerts.filter(a => !a.resolved)],
      score,
      recommendations
    };

    // 履歴に追加
    this.metricsHistory.push(report);
    if (this.metricsHistory.length > this.HISTORY_LIMIT) {
      this.metricsHistory.shift();
    }

    return report;
  }

  // パフォーマンススコアの計算
  private calculatePerformanceScore(): number {
    let score = 100;
    
    // FCP (0-25点)
    if (this.metrics.pageLoad.firstContentfulPaint > 2000) {
      score -= Math.min(25, (this.metrics.pageLoad.firstContentfulPaint - 2000) / 100);
    }
    
    // LCP (0-25点)
    if (this.metrics.pageLoad.largestContentfulPaint > 2500) {
      score -= Math.min(25, (this.metrics.pageLoad.largestContentfulPaint - 2500) / 100);
    }
    
    // メモリ (0-20点)
    if (this.metrics.runtime.memoryUsage > 50 * 1024 * 1024) {
      score -= Math.min(20, (this.metrics.runtime.memoryUsage - 50 * 1024 * 1024) / (1024 * 1024));
    }
    
    // フレームレート (0-20点)
    if (this.metrics.runtime.frameRate < 30 && this.metrics.runtime.frameRate > 0) {
      score -= Math.min(20, (30 - this.metrics.runtime.frameRate));
    }
    
    // エラー (0-10点)
    score -= Math.min(10, this.metrics.errors.javascript * 2);
    
    return Math.max(0, Math.round(score));
  }

  // 推奨事項の生成
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.pageLoad.firstContentfulPaint > 2000) {
      recommendations.push('FCPを改善するために、CSSの最適化やクリティカルパスの削減を検討してください');
    }

    if (this.metrics.pageLoad.largestContentfulPaint > 2500) {
      recommendations.push('LCPを改善するために、画像の最適化や遅延読み込みを実装してください');
    }

    if (this.metrics.runtime.memoryUsage > 50 * 1024 * 1024) {
      recommendations.push('メモリ使用量が高いです。メモリリークのチェックとオブジェクトの解放を検討してください');
    }

    if (this.metrics.runtime.frameRate < 30 && this.metrics.runtime.frameRate > 0) {
      recommendations.push('フレームレートが低いです。アニメーションの最適化や計算の負荷軽減を検討してください');
    }

    if (this.metrics.resources.compressionRatio < 0.5) {
      recommendations.push('リソースの圧縮率が低いです。Gzip/Brotli圧縮を有効にしてください');
    }

    if (this.metrics.errors.javascript > 0) {
      recommendations.push('JavaScriptエラーが検出されました。エラーハンドリングの見直しを推奨します');
    }

    return recommendations;
  }

  // パブリックAPI
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getMetricsHistory(): PerformanceReport[] {
    return [...this.metricsHistory];
  }

  getLatestReport(): PerformanceReport | null {
    return this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1] : null;
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // カスタムメトリクスの記録
  recordCustomMetric(name: string, value: number, unit?: string): void {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`${name}_${Date.now()}`);
    }
    
    console.log(`Custom Metric - ${name}: ${value}${unit || ''}`);
  }

  // ユーザーインタラクションの測定
  measureInteraction(name: string): void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (name === 'click') {
        this.metrics.interactions.clickResponse = duration;
      } else if (name === 'scroll') {
        this.metrics.interactions.scrollPerformance = duration;
      }
      
      this.recordCustomMetric(`${name}_interaction`, duration, 'ms');
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
