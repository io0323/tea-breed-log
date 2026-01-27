import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AsyncState, AsyncFunction, ID, Timestamp, TypeGuard } from '../types/common';
import { debounce, throttle, retry, timeout, createAsyncState, Storage, EventEmitter } from '../utils/helpers';

// 非同期状態管理フック
export function useAsync<T, E = Error>(
  asyncFunction: AsyncFunction<[], T>,
  dependencies: any[] = []
): AsyncState<T, E> & {
  execute: () => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<AsyncState<T, E>>({
    status: 'idle',
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(async () => {
    setState({ status: 'loading', isLoading: true, isSuccess: false, isError: false });
    
    try {
      const data = await asyncFunction();
      setState({ 
        status: 'success', 
        data, 
        isLoading: false, 
        isSuccess: true, 
        isError: false 
      });
    } catch (error) {
      setState({ 
        status: 'error', 
        error: error as E, 
        isLoading: false, 
        isSuccess: false, 
        isError: true 
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ 
      status: 'idle', 
      isLoading: false, 
      isSuccess: false, 
      isError: false,
      data: undefined,
      error: undefined,
    });
  }, []);

  useEffect(() => {
    execute();
  }, dependencies);

  return { ...state, execute, reset };
}

// ローカルストレージフック
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options || {};

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = Storage.get(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      Storage.set(key, valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      Storage.remove(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// セッションストレージフック
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// デバウンスフック
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// スロットルフック
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// ウィンドウサイズフック
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// メディアクエリフック
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// オンラインステータスフック
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// クリックアウトサイドフック
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}

// キーボードショートカットフック
export function useKeyboard(
  key: string,
  action: (event: KeyboardEvent) => void,
  options?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    preventDefault?: boolean;
  }
): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const {
        ctrl = false,
        shift = false,
        alt = false,
        preventDefault: shouldPreventDefault = true,
      } = options || {};

      if (
        event.key === key &&
        (ctrl ? event.ctrlKey : !event.ctrlKey) &&
        (shift ? event.shiftKey : !event.shiftKey) &&
        (alt ? event.altKey : !event.altKey)
      ) {
        if (shouldPreventDefault) {
          event.preventDefault();
        }
        action(event);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, action, options]);
}

// コピーtoクリップボードフック
export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
      setIsCopied(false);
    }
  }, []);

  return [isCopied, copyToClipboard];
}

// タイマーフック
export function useTimer(initialTime: number = 0): {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  set: (time: number) => void;
} {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    pause();
    setTime(initialTime);
  }, [pause, initialTime]);

  const set = useCallback((newTime: number) => {
    setTime(newTime);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { time, isRunning, start, pause, reset, set };
}

// 無限スクロールフック
export function useInfiniteScroll(
  hasMore: boolean,
  loadMore: () => void,
  options?: {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
  }
): React.RefObject<HTMLDivElement> {
  const { threshold = 0.8, root = null, rootMargin = '0px' } = options || {};
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasMore, loadMore, threshold, root, rootMargin]);

  return ref;
}

// フォーム状態管理フック
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validation?: (values: T) => Record<keyof T, string>
): {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  setTouchedAll: () => void;
  reset: () => void;
  validate: () => boolean;
} {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
  }, []);

  const setTouchedAll = useCallback(() => {
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);
  }, [values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validate = useCallback(() => {
    if (!validation) return true;

    const newErrors = validation(values);
    setErrors(newErrors);
    setTouchedAll();

    return Object.keys(newErrors).length === 0;
  }, [validation, values, setTouchedAll]);

  const isValid = useMemo(() => {
    if (!validation) return true;
    const validationErrors = validation(values);
    return Object.keys(validationErrors).length === 0;
  }, [validation, values]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    setTouchedAll,
    reset,
    validate,
  };
}

// イベントエミッターフック
export function useEventEmitter<T extends Record<string, any[]>>() {
  const emitterRef = useRef<EventEmitter>(new EventEmitter());

  const on = useCallback((event: keyof T, listener: (...args: any[]) => void) => {
    emitterRef.current.on(event as string, listener);
  }, []);

  const off = useCallback((event: keyof T, listener: (...args: any[]) => void) => {
    emitterRef.current.off(event as string, listener);
  }, []);

  const emit = useCallback((event: keyof T, ...args: any[]) => {
    emitterRef.current.emit(event as string, ...args);
  }, []);

  const once = useCallback((event: keyof T, listener: (...args: any[]) => void) => {
    emitterRef.current.once(event as string, listener);
  }, []);

  return { on, off, emit, once };
}

// 前回の値を追跡するフック
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// マウント状態フック
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

// ページングフック
export function usePagination(
  totalItems: number,
  itemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
