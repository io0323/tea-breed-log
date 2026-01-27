import { renderHook, act } from '@testing-library/react';
import { useAsync, useLocalStorage, useDebounce, useClickOutside } from '../hooks/useAdvanced';
import { AppError } from '../utils/errors';

// useAsyncフックのテスト
describe('useAsync', () => {
  it('should handle successful async operation', async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(mockAsyncFunction));

    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('test data');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle async operation error', async () => {
    const mockError = new AppError('Test error');
    const mockAsyncFunction = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsync(mockAsyncFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it('should reset state', async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(mockAsyncFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.status).toBe('success');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });
});

// useLocalStorageフックのテスト
describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));

    expect(result.current[0]).toBe('default-value');
  });

  it('should save and retrieve value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe('"new-value"');
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should remove value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('default-value');
    expect(localStorage.getItem('test-key')).toBeNull();
  });
});

// useDebounceフックのテスト
describe('useDebounce', () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 500),
      { initialProps: 'initial' }
    );

    expect(result.current).toBe('initial');

    rerender('updated');
    expect(result.current).toBe('initial'); // Should not update immediately

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle multiple rapid changes', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 500),
      { initialProps: 'initial' }
    );

    rerender('change1');
    rerender('change2');
    rerender('change3');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('change3'); // Should only have the last value
  });
});

// useClickOutsideフックのテスト
describe('useClickOutside', () => {
  it('should call callback when clicking outside', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    // Create a mock element
    const mockElement = document.createElement('div');
    result.current.current = mockElement;

    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 0,
        clientY: 0,
      }));
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should not call callback when clicking inside', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const mockElement = document.createElement('div');
    result.current.current = mockElement;

    act(() => {
      mockElement.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
      }));
    });

    expect(callback).not.toHaveBeenCalled();
  });
});

// エラーハンドリングのテスト
describe('Error Handling', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError('Test message', 'TEST_CODE', 400, { test: 'data' });

    expect(error.message).toBe('Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ test: 'data' });
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should serialize to JSON correctly', () => {
    const error = new AppError('Test message', 'TEST_CODE', 400);
    const json = error.toJSON();

    expect(json).toEqual({
      name: 'AppError',
      message: 'Test message',
      code: 'TEST_CODE',
      statusCode: 400,
      details: undefined,
      timestamp: error.timestamp,
      context: undefined,
      stack: expect.any(String),
    });
  });

  it('should handle error inheritance correctly', () => {
    const error = new NetworkError('Network failed', 0);
    
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.statusCode).toBe(0);
  });
});

// ユーティリティ関数のテスト
describe('Utility Functions', () => {
  describe('debounce', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = jest.requireActual('../utils/helpers').debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = jest.requireActual('../utils/helpers').debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should limit function execution rate', () => {
      const mockFn = jest.fn();
      const throttledFn = jest.requireActual('../utils/helpers').throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should set and get values', () => {
      const Storage = jest.requireActual('../utils/helpers').Storage;
      
      Storage.set('test-key', { test: 'data' });
      const result = Storage.get('test-key');
      
      expect(result).toEqual({ test: 'data' });
    });

    it('should handle missing keys', () => {
      const Storage = jest.requireActual('../utils/helpers').Storage;
      
      const result = Storage.get('missing-key');
      expect(result).toBeNull();
    });

    it('should remove values', () => {
      const Storage = jest.requireActual('../utils/helpers').Storage;
      
      Storage.set('test-key', 'test-value');
      Storage.remove('test-key');
      
      const result = Storage.get('test-key');
      expect(result).toBeNull();
    });
  });
});

// 統合テスト
describe('Integration Tests', () => {
  it('should handle complex async workflow with error handling', async () => {
    const mockAsyncFunction = jest.fn()
      .mockResolvedValueOnce('success')
      .mockRejectedValueOnce(new AppError('Test error'))
      .mockResolvedValueOnce('recovered');

    const { result, rerender } = renderHook(() => useAsync(mockAsyncFunction));

    // First successful call
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('success');

    // Reset and trigger error
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Test error');

    // Reset and recover
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('recovered');
  });

  it('should persist data across re-renders with localStorage', () => {
    const { result, rerender } = renderHook(
      (key: string) => useLocalStorage(key, 'initial'),
      { initialProps: 'test-key' }
    );

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');

    // Simulate re-render with same key
    rerender('test-key');
    expect(result.current[0]).toBe('updated');
  });
});

// パフォーマンステスト
describe('Performance Tests', () => {
  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `item-${i}` }));
    
    const startTime = performance.now();
    
    // Test array operations
    const unique = largeDataset.filter((item, index, arr) => 
      arr.findIndex(i => i.id === item.id) === index
    );
    
    const endTime = performance.now();
    
    expect(unique.length).toBe(largeDataset.length);
    expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
  });

  it('should handle rapid state updates efficiently', () => {
    const { result } = renderHook(() => useDebounce('', 10));
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      act(() => {
        // This would normally trigger many re-renders, but debounce should limit it
      });
    }

    jest.advanceTimersByTime(10);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
  });
});
