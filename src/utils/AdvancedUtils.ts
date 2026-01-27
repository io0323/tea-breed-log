// 高度なTypeScriptユーティリティ関数
import type { 
  AsyncFunction, 
  AsyncState, 
  ID, 
  UUID, 
  Timestamp,
  PositiveNumber,
  NonZeroNumber,
  TypeGuard,
  ApiResponse,
  PaginatedResponse,
  ValidationRule,
  ValidationResult
} from '../types/common';

// データ変換ユーティリティ
export class DataTransformer {
  // 配列の平坦化
  static flatten<T>(arr: (T | T[])[]): T[] {
    return arr.reduce<T[]>((acc, val) => {
      return acc.concat(Array.isArray(val) ? DataTransformer.flatten(val) : val);
    }, []);
  }

  // 配列のグループ化
  static groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  // 配列の一意化
  static unique<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return Array.from(new Set(array));
    }
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  // 配列のシャッフル
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 配列のチャンク分割
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // オブジェクトのマッピング
  static mapValues<T, U>(obj: Record<string, T>, mapper: (value: T, key: string) => U): Record<string, U> {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, mapper(value, key)])
    );
  }

  // オブジェクトのフィルタリング
  static filterValues<T>(obj: Record<string, T>, predicate: (value: T, key: string) => boolean): Record<string, T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => predicate(value, key))
    );
  }

  // オブジェクトのマージ（深い）
  static deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (source) {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {} as any;
          DataTransformer.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key] as any;
        }
      }
    }

    return DataTransformer.deepMerge(target, ...sources);
  }
}

// バリデーションユーティリティ
export class Validator {
  // 文字列バリデーション
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  static isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  static isURL(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  static isPhoneNumber(value: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  }

  static isStrongPassword(value: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    return value.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  // 数値バリデーション
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  static isInteger(value: unknown): value is number {
    return Number.isInteger(value);
  }

  static isPositiveNumber(value: unknown): value is PositiveNumber {
    return typeof value === 'number' && value > 0;
  }

  static isNonZeroNumber(value: unknown): value is NonZeroNumber {
    return typeof value === 'number' && value !== 0;
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // 日付バリデーション
  static isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  static isFutureDate(value: Date): boolean {
    return value.getTime() > Date.now();
  }

  static isPastDate(value: Date): boolean {
    return value.getTime() < Date.now();
  }

  static isValidAge(value: number): boolean {
    return value >= 0 && value <= 150;
  }

  // 配列バリデーション
  static isArray<T>(value: unknown, guard?: TypeGuard<T>): value is T[] {
    if (!Array.isArray(value)) return false;
    if (guard) {
      return value.every(guard);
    }
    return true;
  }

  static isNonEmptyArray<T>(value: unknown): value is T[] {
    return Array.isArray(value) && value.length > 0;
  }

  static hasLength<T>(value: T[], length: number): boolean {
    return Array.isArray(value) && value.length === length;
  }

  // オブジェクトバリデーション
  static isObject(value: unknown): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static hasProperty<T extends Record<string, any>, K extends string>(
    value: unknown,
    key: K
  ): value is T & Record<K, any> {
    return Validator.isObject(value) && key in value;
  }

  static hasProperties<T extends Record<string, any>>(
    value: unknown,
    keys: (keyof T)[]
  ): value is T {
    return Validator.isObject(value) && keys.every(key => key in value);
  }

  // 総合バリデーション
  static validate<T>(value: unknown, rules: ValidationRule<T>[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const result = rule.validate(value);
      if (result !== true) {
        errors.push(result);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static createRule<T>(
    validate: (value: T) => boolean | string,
    message?: string
  ): ValidationRule<T> {
    return {
      validate: (value: T) => {
        const result = validate(value);
        if (result === true) return true;
        return message || (typeof result === 'string' ? result : 'Validation failed');
      },
    };
  }
}

// フォーマットユーティリティ
export class Formatter {
  // 文字列フォーマット
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static camelCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  }

  static kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  static snakeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // 数値フォーマット
  static formatNumber(num: number, decimals: number = 2): string {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  static formatCurrency(num: number, currency: string = 'JPY'): string {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
    }).format(num);
  }

  static formatPercentage(num: number, decimals: number = 1): string {
    return `${(num * 100).toFixed(decimals)}%`;
  }

  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // 日付フォーマット
  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    return `${seconds}秒前`;
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }
}

// ID生成ユーティリティ
export class IdGenerator {
  static generateId(): ID {
    return Math.random().toString(36).substr(2, 9) as ID;
  }

  static generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) as UUID;
  }

  static generateTimestamp(): Timestamp {
    return Date.now() as Timestamp;
  }

  static generateShortId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// 非同期処理ユーティリティ
export class AsyncUtils {
  // 非同期処理のバッチ化
  static async batch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    delay: number = 0
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
      
      if (delay > 0 && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  // 非同期処理の並列実行（同時実行数制限）
  static async parallel<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    const executing: Promise<void>[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const promise = processor(items[i]).then(result => {
        results[i] = result;
      });
      
      executing.push(promise);
      
      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
    
    await Promise.all(executing);
    return results;
  }

  // 非同期処理のリトライ
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    backoff: number = 2,
    shouldRetry?: (error: Error) => boolean
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        if (shouldRetry && !shouldRetry(lastError)) {
          throw lastError;
        }
        
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(backoff, attempt - 1))
        );
      }
    }
    
    throw lastError!;
  }

  // 非同期処理のタイムアウト
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string = 'Operation timed out'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // 非同期処理のデバウンス
  static debounce<T extends any[]>(
    fn: (...args: T) => Promise<any>,
    delay: number
  ): (...args: T) => Promise<any> {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastResolve: ((value: any) => void) | null = null;
    let lastReject: ((error: any) => void) | null = null;

    return (...args: T) => {
      return new Promise((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (lastReject) {
          lastReject(new Error('Debounced'));
        }

        lastResolve = resolve;
        lastReject = reject;

        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args);
            if (lastResolve) {
              lastResolve(result);
            }
          } catch (error) {
            if (lastReject) {
              lastReject(error);
            }
          }
        }, delay);
      });
    };
  }

  // 非同期処理のスロットル
  static throttle<T extends any[]>(
    fn: (...args: T) => Promise<any>,
    limit: number
  ): (...args: T) => Promise<any> {
    let inThrottle = false;
    let lastPromise: Promise<any> | null = null;

    return (...args: T) => {
      if (inThrottle) {
        return lastPromise || Promise.reject(new Error('Throttled'));
      }

      inThrottle = true;
      lastPromise = fn(...args);

      setTimeout(() => {
        inThrottle = false;
      }, limit);

      return lastPromise;
    };
  }
}

// パフォーマンス監視ユーティリティ
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`Timer '${name}' not found`);
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.timers.delete(name);
    return duration;
  }

  static measure<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      return fn();
    } finally {
      this.endTimer(name);
    }
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    try {
      return await fn();
    } finally {
      this.endTimer(name);
    }
  }

  static getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }
    return { used: 0, total: 0, percentage: 0 };
  }
}

// ローカルストレージユーティリティ
export class StorageManager {
  private static prefix = 'app_';

  static set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serializedValue);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  static getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          const actualKey = key.replace(this.prefix, '');
          result[actualKey] = JSON.parse(value);
        }
      });
    } catch (error) {
      console.error('Failed to get all localStorage items:', error);
    }
    return result;
  }
}

// イベントエミッター
export class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }
  }

  once(event: string, listener: Function): void {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// 数学的ユーティリティ
export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  static randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static roundToDecimals(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  static isPowerOfTwo(value: number): boolean {
    return value > 0 && (value & (value - 1)) === 0;
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  static factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  static fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  static isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    
    return true;
  }
}
