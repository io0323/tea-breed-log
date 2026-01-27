// 基本的なユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 配列関連の型
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
export type ArrayToUnion<T> = T extends Array<infer U> ? U : never;
export type NonEmptyArray<T> = [T, ...T[]];
export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [...R, T]>;

// 関数関連の型
export type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;
export type SyncFunction<T extends any[] = any[], R = any> = (...args: T) => R;
export type AnyFunction<T extends any[] = any[], R = any> = SyncFunction<T, R> | AsyncFunction<T, R>;
export type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
export type FunctionParameters<T> = T extends (...args: infer P) => any ? P : never;

// オブジェクト関連の型
export type ObjectKeys<T> = keyof T;
export type ObjectValues<T> = T[keyof T];
export type ObjectEntries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
export type PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
export type OmitByValue<T, V> = { [K in keyof T as T[K] extends V ? never : K]: T[K] };

// 文字列関連の型
export type StringLiteralUnion<T> = T | (string & {});
export type Capitalize<T extends string> = T extends `${infer F}${infer R}` 
  ? `${Uppercase<F>}${R}` 
  : T;
export type Uncapitalize<T extends string> = T extends `${infer F}${infer R}` 
  ? `${Lowercase<F>}${R}` 
  : T;
export type CamelCase<T extends string> = T extends `${infer P1}_${infer P2}${infer P3}`
  ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
  : T;
export type KebabCase<T extends string> = T extends `${infer C}${infer R}`
  ? C extends Uppercase<C>
    ? `_${Lowercase<C>}${KebabCase<R>}`
    : `${C}${KebabCase<R>}`
  : T;

// 数値関連の型
export type PositiveNumber = number & { readonly __brand: 'PositiveNumber' };
export type NegativeNumber = number & { readonly __brand: 'NegativeNumber' };
export type NonZeroNumber = number & { readonly __brand: 'NonZeroNumber' };
export type Integer = number & { readonly __brand: 'Integer' };
export type Float = number & { readonly __brand: 'Float' };

// ID関連の型
export type ID = string & { readonly __brand: 'ID' };
export type UUID = string & { readonly __brand: 'UUID' };
export type Timestamp = number & { readonly __brand: 'Timestamp' };

// 状態関連の型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type AsyncState<T, E = Error> = {
  status: LoadingState;
  data?: T;
  error?: E;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

// イベント関連の型
export type EventHandler<T = Event> = (event: T) => void;
export type EventHandlerWithPayload<T, P = any> = (event: T, payload: P) => void;
export type CustomEvent<T = any> = Event & { detail: T };

// API関連の型
export type ApiResponse<T = any> = {
  data: T;
  message: string;
  status: number;
  success: boolean;
};

export type ApiError = {
  message: string;
  status: number;
  code?: string;
  details?: any;
};

export type PaginationParams = {
  page: number;
  limit: number;
  offset?: number;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}>;

// フォーム関連の型
export type FormField<T = any> = {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
};

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

export type FormValidation<T> = {
  [K in keyof T]?: (value: T[K]) => string | undefined;
};

// テーマ関連の型
export type Theme = 'light' | 'dark' | 'auto';
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';

// データベース関連の型
export type DatabaseField = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json';
  nullable: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  defaultValue?: any;
};

export type DatabaseSchema = Record<string, DatabaseField>;

// 設定関連の型
export type ConfigValue = string | number | boolean | null | undefined;
export type ConfigSchema = Record<string, {
  type: 'string' | 'number' | 'boolean';
  default: ConfigValue;
  description?: string;
  validation?: (value: ConfigValue) => boolean | string;
}>;

// ログ関連の型
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
};

// キャッシュ関連の型
export type CacheKey = string;
export type CacheValue = any;
export type CacheOptions = {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
};

// バリデーション関連の型
export type ValidationRule<T = any> = {
  validate: (value: T) => boolean | string;
  message?: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// パーミッション関連の型
export type Permission = string;
export type Role = string;
export type UserPermissions = Record<Permission, boolean>;
export type UserRole = {
  role: Role;
  permissions: Permission[];
};

// 国際化関連の型
export type Locale = string;
export type TranslationKey = string;
export type Translations = Record<Locale, Record<TranslationKey, string>>;

// モニタリング関連の型
export type MetricName = string;
export type MetricValue = number;
export type MetricTags = Record<string, string>;
export type Metric = {
  name: MetricName;
  value: MetricValue;
  tags?: MetricTags;
  timestamp: number;
};

// 型ガード
export type TypeGuard<T> = (value: unknown) => value is T;

// 型コンストラクタ
export type TypeConstructor<T> = new (...args: any[]) => T;

// 型マッピング
export type TypeMapping<T> = {
  [K in keyof T]: {
    type: string;
    optional: boolean;
    nullable: boolean;
  };
};

// 条件付き型
export type If<C extends boolean, T, F> = C extends true ? T : F;
export type Not<T extends boolean> = T extends true ? false : true;
export type And<A extends boolean, B extends boolean> = A extends true ? B : false;
export type Or<A extends boolean, B extends boolean> = A extends true ? true : B;

// 型推論ヘルパー
export type InferType<T> = T extends (...args: any[]) => infer R ? R : never;
export type InferPromise<T> = T extends Promise<infer U> ? U : never;
export type InferArray<T> = T extends (infer U)[] ? U : never;

// 型ユーティリティ
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Last<T extends any[]> = T extends [...any, infer L] ? L : never;
export type First<T extends any[]> = T extends [infer F, ...any] ? F : never;
export type Tail<T extends any[]> = T extends [any, ...infer R] ? R : [];
export type Head<T extends any[]> = T extends [infer H, ...any] ? H : never;

// 型チェック
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type IsUnknown<T> = IsNever<T> extends true ? false : IsAny<T> extends true ? false : unknown extends T ? true : false;

// 型変換
export type Stringify<T> = T extends string | number | boolean ? `${T}` : T extends object ? { [K in keyof T]: Stringify<T[K]> } : never;
export type Numberify<T> = T extends `${infer N}` ? N extends `${number}` ? number : never : T;
export type Booleanify<T> = T extends 'true' ? true : T extends 'false' ? false : T;
