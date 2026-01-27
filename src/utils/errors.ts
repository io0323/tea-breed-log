// カスタムエラークラス
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: any,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.context = context;

    // V8スタックトレースを維持
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

// ネットワークエラー
export class NetworkError extends AppError {
  constructor(
    message: string = 'Network error occurred',
    statusCode: number = 0,
    details?: any
  ) {
    super(message, 'NETWORK_ERROR', statusCode, details);
  }
}

// APIエラー
export class ApiError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'API_ERROR',
    details?: any
  ) {
    super(message, code, statusCode, details);
  }
}

// バリデーションエラー
export class ValidationError extends AppError {
  public readonly validationErrors: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed',
    validationErrors: Record<string, string[]> = {},
    details?: any
  ) {
    super(message, 'VALIDATION_ERROR', 400, {
      validationErrors,
      ...details,
    });
    this.validationErrors = validationErrors;
  }
}

// 認証エラー
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

// 認可エラー
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

// 見つからないエラー
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

// コンフリクトエラー
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
  }
}

// レート制限エラー
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429, { retryAfter });
  }
}

// エラーハンドラークラス
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: Array<(error: AppError) => void> = [];
  private errorLog: AppError[] = [];
  private maxLogSize: number = 1000;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // エラーリスナーの追加
  addListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  // エラーリスナーの削除
  removeListener(listener: (error: AppError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  // エラーの処理
  handle(error: Error | AppError, context?: Record<string, any>): AppError {
    const appError = this.normalizeError(error, context);
    
    // エラーログに追加
    this.addToLog(appError);
    
    // リスナーに通知
    this.notifyListeners(appError);
    
    // コンソールに出力
    this.logToConsole(appError);
    
    return appError;
  }

  // エラーの正規化
  private normalizeError(error: Error | AppError, context?: Record<string, any>): AppError {
    if (error instanceof AppError) {
      if (context) {
        error.context = { ...error.context, ...context };
      }
      return error;
    }

    // 標準エラーをAppErrorに変換
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      {
        originalError: error.name,
        stack: error.stack,
      },
      context
    );
  }

  // エラーログに追加
  private addToLog(error: AppError): void {
    this.errorLog.push(error);
    
    // ログサイズの制限
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  // リスナーへの通知
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  // コンソールログ出力
  private logToConsole(error: AppError): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.toString()}`);
      console.error('Error Details:', error.toJSON());
      console.groupEnd();
    } else {
      console.error(error.toString(), error.toJSON());
    }
  }

  // エラーログの取得
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // エラーログのクリア
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // エラー統計
  getErrorStats(): {
    total: number;
    byCode: Record<string, number>;
    byStatusCode: Record<number, number>;
    recent: AppError[];
  } {
    const byCode: Record<string, number> = {};
    const byStatusCode: Record<number, number> = {};

    this.errorLog.forEach(error => {
      byCode[error.code] = (byCode[error.code] || 0) + 1;
      byStatusCode[error.statusCode] = (byStatusCode[error.statusCode] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byCode,
      byStatusCode,
      recent: this.errorLog.slice(-10),
    };
  }
}

// グローバルエラーハンドラー
export const globalErrorHandler = ErrorHandler.getInstance();

// エラーハンドリングユーティリティ
export function handleError(error: Error | AppError, context?: Record<string, any>): AppError {
  return globalErrorHandler.handle(error, context);
}

// 非同期エラーハンドリング
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: Record<string, any>
): Promise<[T | null, AppError | null]> {
  return promise
    .then<[T, null]>((data: T) => [data, null])
    .catch<[null, AppError]>((error: Error) => {
      const appError = handleError(error, context);
      return [null, appError];
    });
}

// エラーバウンドリ
export function withErrorBoundary<T extends any[], R>(
  fn: (...args: T) => R,
  errorHandler?: (error: AppError) => R | void
): (...args: T) => R {
  return (...args: T) => {
    try {
      return fn(...args);
    } catch (error) {
      const appError = handleError(error as Error);
      
      if (errorHandler) {
        return errorHandler(appError) as R;
      }
      
      throw appError;
    }
  };
}

// 非同期エラーバウンドリ
export function withAsyncErrorBoundary<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: AppError) => Promise<R> | void
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error as Error);
      
      if (errorHandler) {
        const result = await errorHandler(appError);
        if (result !== undefined) {
          return result;
        }
      }
      
      throw appError;
    }
  };
}

// リトライ機能付き非同期実行
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  backoff: number = 2,
  shouldRetry?: (error: AppError) => boolean
): Promise<T> {
  let lastError: AppError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = handleError(error as Error);
      
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

// タイムアウト付き非同期実行
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new AppError(timeoutMessage, 'TIMEOUT', 408));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// エラーレポート生成
export function generateErrorReport(errors: AppError[]): string {
  const stats = globalErrorHandler.getErrorStats();
  
  return `
Error Report
============
Generated: ${new Date().toISOString()}
Total Errors: ${stats.total}

Error Distribution by Code:
${Object.entries(stats.byCode)
  .map(([code, count]) => `  ${code}: ${count}`)
  .join('\n')}

Error Distribution by Status Code:
${Object.entries(stats.byStatusCode)
  .map(([status, count]) => `  ${status}: ${count}`)
  .join('\n')}

Recent Errors:
${stats.recent
  .map(error => `  [${error.timestamp.toISOString()}] ${error.toString()}`)
  .join('\n')}
  `.trim();
}

// エラーレポートの保存
export function saveErrorReport(): void {
  const report = generateErrorReport(globalErrorHandler.getErrorLog());
  
  try {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to save error report:', error);
  }
}

// エラーモニタリング
export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private metrics: Map<string, number> = new Map();
  private thresholds: Map<string, number> = new Map();

  private constructor() {
    // デフォルトのしきい値
    this.setThreshold('TOTAL_ERRORS', 100);
    this.setThreshold('ERROR_RATE', 0.05); // 5%
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  // しきい値の設定
  setThreshold(metric: string, value: number): void {
    this.thresholds.set(metric, value);
  }

  // メトリックの記録
  recordMetric(metric: string, value: number): void {
    this.metrics.set(metric, value);
    this.checkThresholds();
  }

  // しきい値のチェック
  private checkThresholds(): void {
    this.thresholds.forEach((threshold, metric) => {
      const value = this.metrics.get(metric) || 0;
      if (value > threshold) {
        console.warn(`🚨 Metric ${metric} exceeded threshold: ${value} > ${threshold}`);
      }
    });
  }

  // エラー率の計算
  calculateErrorRate(totalRequests: number): void {
    const totalErrors = globalErrorHandler.getErrorLog().length;
    const errorRate = totalErrors / totalRequests;
    this.recordMetric('ERROR_RATE', errorRate);
  }

  // メトリックの取得
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // メトリックのリセット
  resetMetrics(): void {
    this.metrics.clear();
  }
}

export const errorMonitor = ErrorMonitor.getInstance();
