import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TeaDetails } from '../../pages/TeaDetails';
import { useTeaVarieties } from '../../hooks/useTeaVarieties';
import { useAuth } from '../../contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('../../hooks/useTeaVarieties');
jest.mock('../../contexts/AuthContext');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
}));

const mockUseTeaVarieties = useTeaVarieties as jest.MockedFunction<typeof useTeaVarieties>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockTea = {
  id: '1',
  name: 'やぶきた',
  generation: 'F1',
  location: '静岡県',
  year: 2023,
  germinationRate: 85,
  growthScore: 4,
  diseaseResistance: 4,
  aroma: '爽やかで上品な香り',
  note: '生育が良く、収量も安定している',
  status: 'active' as const,
  images: ['https://example.com/image1.jpg']
};

describe('TeaDetails', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockUseTeaVarieties.mockReturnValue({
      teaVarieties: [],
      statistics: {
        total: 1,
        active: 1,
        avgGrowthScore: '4.0',
        avgDiseaseResistance: '4.0',
      },
      addTea: jest.fn(),
      updateTea: jest.fn(),
      deleteTea: jest.fn(),
      getTeaById: jest.fn().mockReturnValue(mockTea),
      addTeaImage: jest.fn(),
      removeTeaImage: jest.fn(),
    });

    mockUseAuth.mockReturnValue({
      session: null,
      user: { 
        id: 'user1',
        app_metadata: {},
        user_metadata: {},
        aud: [],
        created_at: ''
      } as any,
      signOut: jest.fn(),
    });
  });

  it('品種詳細が正しく表示されること', () => {
    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    expect(screen.getByText('やぶきた(F1)')).toBeInTheDocument();
    expect(screen.getByText('静岡県')).toBeInTheDocument();
    expect(screen.getByText('2023年')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('爽やかで上品な香り')).toBeInTheDocument();
    expect(screen.getByText('生育が良く、収量も安定している')).toBeInTheDocument();
  });

  it('編集・削除ボタンが表示されること', () => {
    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    expect(screen.getByText('編集')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  it('削除確認ダイアログが表示されること', () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const mockDeleteTea = mockUseTeaVarieties().deleteTea;

    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith('この品種を削除してもよろしいですか？');
    expect(mockDeleteTea).toHaveBeenCalledWith('1');
  });

  it('画像アップロードセクションが表示されること', () => {
    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    expect(screen.getByText('画像を追加')).toBeInTheDocument();
  });

  it('画像ギャラリーが表示されること', () => {
    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    expect(screen.getByText('画像ギャラリー')).toBeInTheDocument();
  });

  it('一覧に戻るボタンが動作すること', () => {
    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    const backButton = screen.getByText('一覧に戻る');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('品種が存在しない場合にエラーメッセージが表示されること', () => {
    mockUseTeaVarieties.mockReturnValue({
      teaVarieties: [],
      statistics: {
        total: 0,
        active: 0,
        avgGrowthScore: '0.0',
        avgDiseaseResistance: '0.0',
      },
      addTea: jest.fn(),
      updateTea: jest.fn(),
      deleteTea: jest.fn(),
      getTeaById: jest.fn().mockReturnValue(undefined),
      addTeaImage: jest.fn(),
      removeTeaImage: jest.fn(),
    });

    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    expect(screen.getByText('品種が見つかりませんでした')).toBeInTheDocument();
  });

  it('未ログインユーザーの場合に編集・削除ボタンが表示されないこと', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      user: null,
      signOut: jest.fn(),
    });

    render(
      <BrowserRouter>
        <TeaDetails />
      </BrowserRouter>
    );

    expect(screen.queryByText('編集')).not.toBeInTheDocument();
    expect(screen.queryByText('削除')).not.toBeInTheDocument();
  });
});
