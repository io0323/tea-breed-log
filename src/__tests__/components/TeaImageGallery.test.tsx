import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeaImageGallery } from '../../components/TeaImageGallery';
import '@testing-library/jest-dom';

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

  it('画像が表示されること', () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(mockImages.length);
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('src', mockImages[index]);
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

  it('画像をクリックするとモーダルが表示されること', () => {
    render(
      <TeaImageGallery 
        images={mockImages} 
        teaId={mockTeaId}
        onImageDelete={mockOnImageDelete}
        isOwner={true}
      />
    );

    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);

    // モーダルの画像を取得
    const modalImage = screen.getByAltText('拡大表示');
    expect(modalImage).toHaveAttribute('src', mockImages[0]);
  });

  it('削除ボタンをクリックすると確認ダイアログが表示され、削除が実行されること', async () => {
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

    expect(mockConfirm).toHaveBeenCalledWith('この画像を削除してもよろしいですか？');
    
    await waitFor(() => {
      expect(mockOnImageDelete).toHaveBeenCalledWith(mockImages[0]);
    });
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
