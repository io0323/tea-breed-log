import type { 
  AsyncFunction, 
  AsyncState, 
  ID, 
  UUID, 
  Timestamp,
  PositiveNumber,
  NonZeroNumber,
  TypeGuard
} from '../types/common';

// デバウンス関数
export function debounce<T extends any[]>(
  func: (...args: T) => void,
  wait: number
): (...args: T) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: T) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

// スロットル関数
export function throttle<T extends any[]>(
  func: (...args: T) => void,
  limit: number
): (...args: T) => void {
  let inThrottle = false;
  
  return (...args: T) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// 一度だけ実行する関数
export function once<T extends any[]>(
  func: (...args: T) => void
): (...args: T) => void {
  let called = false;
  let result: void;
  
  return (...args: T) => {
    if (!called) {
      called = true;
      result = func(...args);
    }
    return result;
  };
}

// メモ化関数
export function memoize<T extends any[], R>(
  func: (...args: T) => R,
  keyGenerator?: (...args: T) => string
): (...args: T) => R {
  const cache = new Map<string, R>();
  
  return (...args: T) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

// 非同期メモ化関数
export function memoizeAsync<T extends any[], R>(
  func: AsyncFunction<T, R>,
  keyGenerator?: (...args: T) => string
): AsyncFunction<T, R> {
  const cache = new Map<string, Promise<R>>();
  const pendingCache = new Map<string, Promise<R>>();
  
  return async (...args: T) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // すでに完了している場合
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    // 現在実行中の場合
    if (pendingCache.has(key)) {
      return pendingCache.get(key)!;
    }
    
    // 新しい実行を開始
    const promise = func(...args).then(result => {
      cache.set(key, result);
      pendingCache.delete(key);
      return result;
    }).catch(error => {
      pendingCache.delete(key);
      throw error;
    });
    
    pendingCache.set(key, promise);
    return promise;
  };
}

// リトライ関数
export async function retry<T>(
  func: AsyncFunction<[], T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await func();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
    }
  }
  
  throw lastError!;
}

// タイムアウト関数
export function timeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    })
  ]);
}

// バッチ処理関数
export async function batch<T, R>(
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

// 並列実行制限関数
export async function parallel<T, R>(
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

// 非同期状態管理
export function createAsyncState<T, E = Error>(
  initialStatus: AsyncState<T, E>['status'] = 'idle'
): {
  state: AsyncState<T, E>;
  setLoading: () => void;
  setSuccess: (data: T) => void;
  setError: (error: E) => void;
  reset: () => void;
} {
  let state: AsyncState<T, E> = {
    status: initialStatus,
    isLoading: false,
    isSuccess: false,
    isError: false,
  };
  
  const setState = (newState: Partial<AsyncState<T, E>>) => {
    state = { ...state, ...newState };
  };
  
  return {
    get state() { return state; },
    setLoading: () => setState({
      status: 'loading',
      isLoading: true,
      isSuccess: false,
      isError: false,
    }),
    setSuccess: (data: T) => setState({
      status: 'success',
      data,
      isLoading: false,
      isSuccess: true,
      isError: false,
    }),
    setError: (error: E) => setState({
      status: 'error',
      error,
      isLoading: false,
      isSuccess: false,
      isError: true,
    }),
    reset: () => setState({
      status: initialStatus,
      isLoading: false,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: undefined,
    }),
  };
}

// ID生成関数
export function generateId(): ID {
  return Math.random().toString(36).substr(2, 9) as ID;
}

export function generateUUID(): UUID {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) as UUID;
}

// タイムスタンプ関数
export function getTimestamp(): Timestamp {
  return Date.now() as Timestamp;
}

export function formatDate(timestamp: Timestamp): string {
  return new Date(timestamp).toISOString();
}

export function parseDate(dateString: string): Timestamp {
  return new Date(dateString).getTime() as Timestamp;
}

// 数値検証関数
export function isPositiveNumber(value: number): value is PositiveNumber {
  return value > 0;
}

export function isNonZeroNumber(value: number): value is NonZeroNumber {
  return value !== 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function roundToDecimals(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// 文字列ユーティリティ
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 配列ユーティリティ
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// オブジェクトユーティリティ
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function merge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
  return objects.reduce((result, obj) => ({ ...result, ...obj }), {} as T);
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// 型ガードユーティリティ
export function createTypeGuard<T>(
  predicate: (value: unknown) => boolean
): TypeGuard<T> {
  return predicate as TypeGuard<T>;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

// エラーハンドリング
export function createError(message: string, code?: string, details?: any): Error {
  const error = new Error(message);
  if (code) (error as any).code = code;
  if (details) (error as any).details = details;
  return error;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message;
  if (isString(error)) return error;
  return 'Unknown error occurred';
}

// ストレージユーティリティ
export class Storage {
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
  
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }
  
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
  
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

// イベントエミッター
export class EventEmitter {
  private events: Record<string, Function[]> = {};
  
  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  off(event: string, listener: Function): void {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }
  
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
  
  once(event: string, listener: Function): void {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }
}
