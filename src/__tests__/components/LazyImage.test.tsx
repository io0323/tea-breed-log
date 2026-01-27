import { render, screen, waitFor } from '@testing-library/react';
import { LazyImage } from '../components/LazyImage';

// IntersectionObserverのモック
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LazyImage', () => {
  const mockOnLoad = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render placeholder initially', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        className="test-class"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/placeholder.jpg');
  });

  it('should show loading skeleton initially', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
      />
    );

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should load actual image when in viewport', async () => {
    let callback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((cb) => {
      callback = cb;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        onLoad={mockOnLoad}
      />
    );

    // Simulate image entering viewport
    const mockEntry = {
      isIntersecting: true,
      target: screen.getByAltText('Test image'),
    } as IntersectionObserverEntry;

    callback!([mockEntry]);

    await waitFor(() => {
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src', 'test-image.jpg');
    });
  });

  it('should call onLoad when image loads successfully', async () => {
    let callback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((cb) => {
      callback = cb;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        onLoad={mockOnLoad}
      />
    );

    const mockEntry = {
      isIntersecting: true,
      target: screen.getByAltText('Test image'),
    } as IntersectionObserverEntry;

    callback!([mockEntry]);

    const img = screen.getByAltText('Test image');
    
    // Simulate image load
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(mockOnLoad).toHaveBeenCalled();
    });
  });

  it('should show error state when image fails to load', async () => {
    let callback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((cb) => {
      callback = cb;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    render(
      <LazyImage
        src="invalid-image.jpg"
        alt="Test image"
        onError={mockOnError}
      />
    );

    const mockEntry = {
      isIntersecting: true,
      target: screen.getByAltText('Test image'),
    } as IntersectionObserverEntry;

    callback!([mockEntry]);

    const img = screen.getByAltText('Test image');
    
    // Simulate image error
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('読み込み失敗')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  it('should apply custom className', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('custom-class');
  });

  it('should use custom placeholder', () => {
    render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
        placeholder="/custom-placeholder.jpg"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('src', '/custom-placeholder.jpg');
  });

  it('should cleanup observer on unmount', () => {
    const mockDisconnect = jest.fn();
    
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: mockDisconnect,
    });

    const { unmount } = render(
      <LazyImage
        src="test-image.jpg"
        alt="Test image"
      />
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
