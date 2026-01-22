import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeaImageGallery } from '../../components/TeaImageGallery';
import '@testing-library/jest-dom';

// IntersectionObserverのモック
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

mockIntersectionObserver.mockReturnValue({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
});
window.IntersectionObserver = mockIntersectionObserver;

// モックが画像を即座に表示するように設定
mockObserve.mockImplementation((callback: any) => {
  // 即座に交差を検出したとみなす
  setTimeout(() => {
    callback([{ isIntersecting: true }]);
  }, 0);
});

// Supabaseのモック
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      remove: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

// window.confirmのモック
const mockConfirm = jest.spyOn(window, 'confirm');
mockConfirm.mockImplementation(jest.fn(() => true));

describe('TeaImageGallery', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ];
  const mockTeaId = 'test-tea-123';
  const mockOnImageDelete = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('画像が表示されること', async () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(mockImages.length);
    });
  });

  it('オーナーの場合、削除ボタンが表示されること', () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /画像を削除/ });
    expect(deleteButtons).toHaveLength(mockImages.length);
  });

  it('オーナーでない場合、削除ボタンが表示されないこと', () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={false}
      />
    );

    const deleteButtons = screen.queryAllByRole('button', { name: /画像を削除/ });
    expect(deleteButtons).toHaveLength(0);
  });

  it('画像をクリックするとモーダルが表示されること', async () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      fireEvent.click(images[0]);
    });

    expect(screen.getByText('拡大表示')).toBeInTheDocument();
  });

  it('削除ボタンをクリックすると確認ダイアログが表示されること', () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    const deleteButton = screen.getAllByRole('button', { name: /画像を削除/ })[0];
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('この画像を削除してもよろしいですか？');
  });

  it('削除確認ダイアログでキャンセルを押した場合、削除が実行されないこと', async () => {
    // 確認ダイアログでfalseを返すようにモック
    mockConfirm.mockImplementationOnce(() => false);

    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    const deleteButton = screen.getAllByRole('button', { name: /画像を削除/ })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnImageDelete).not.toHaveBeenCalled();
    });
  });

  it('削除確認ダイアログでOKを押した場合、削除が実行されること', async () => {
    // 確認ダイアログでtrueを返すようにモック
    mockConfirm.mockImplementationOnce(() => true);

    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    const deleteButton = screen.getAllByRole('button', { name: /画像を削除/ })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnImageDelete).toHaveBeenCalledWith(mockImages[0]);
    });
  });

  it('画像に適切なaltテキストが設定されていること', async () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('alt', '品種画像 1');
      expect(images[1]).toHaveAttribute('alt', '品種画像 2');
    });
  });

  it('削除処理が失敗した場合、エラーがコンソールに出力されること', async () => {
    // エラーをモック
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // 確認ダイアログでtrueを返すようにモック
    mockConfirm.mockImplementationOnce(() => true);

    // 削除処理を失敗させる
    const mockError = new Error('Failed to delete image');
    const mockOnImageDelete = jest.fn().mockRejectedValueOnce(mockError);

    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    const deleteButton = screen.getAllByRole('button', { name: /画像を削除/ })[0];
    fireEvent.click(deleteButton);

    // 非同期処理の完了を待つ
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error deleting image:', expect.any(Error));
      expect(alertMock).toHaveBeenCalledWith('画像の削除に失敗しました');
    });
    
    // モックを元に戻す
    consoleError.mockRestore();
    alertMock.mockRestore();
  });

  it('画像がない場合、メッセージが表示されること', () => {
    render(
      <TeaImageGallery 
        images={[]} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    expect(screen.getByText('画像がアップロードされていません')).toBeInTheDocument();
  });
});
