import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TeaList } from '../../components/TeaList';
import { useTeaVarieties } from '../../hooks/useTeaVarieties';
import { TeaVariety } from '../../types/teaVariety';

// Mock the hook
jest.mock('../../hooks/useTeaVarieties');

const mockUseTeaVarieties = useTeaVarieties as jest.MockedFunction<typeof useTeaVarieties>;

const mockTeaVarieties: TeaVariety[] = [
  {
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
    status: 'active',
    images: []
  },
  {
    id: '2',
    name: 'さやまかおり',
    generation: 'F2',
    location: '鹿児島県',
    year: 2023,
    germinationRate: 78,
    growthScore: 5,
    diseaseResistance: 3,
    aroma: '甘くフルーティーな香り',
    note: '香りが特徴的で高評価',
    status: 'active',
    images: []
  },
  {
    id: '3',
    name: 'ゆたかみどり',
    generation: 'F1',
    location: '宮崎県',
    year: 2022,
    germinationRate: 92,
    growthScore: 4,
    diseaseResistance: 5,
    aroma: 'まろやかで深みのある香り',
    note: '耐病性が高く栽培しやすい',
    status: 'discarded',
    images: []
  }
];

describe('TeaList', () => {
  beforeEach(() => {
    mockUseTeaVarieties.mockReturnValue({
      teaVarieties: mockTeaVarieties,
      statistics: {
        total: 3,
        active: 2,
        avgGrowthScore: '4.3',
        avgDiseaseResistance: '4.0',
      },
      addTea: jest.fn(),
      updateTea: jest.fn(),
      deleteTea: jest.fn(),
      getTeaById: jest.fn(),
      addTeaImage: jest.fn(),
      removeTeaImage: jest.fn(),
    });
  });

  it('品種一覧が正しく表示されること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    expect(screen.getByText('お茶の品種一覧')).toBeInTheDocument();
    expect(screen.getByText('総品種数')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    const activeCounts = screen.getAllByText('栽培中');
    expect(activeCounts[0]).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('やぶきた')).toBeInTheDocument();
    expect(screen.getByText('さやまかおり')).toBeInTheDocument();
    expect(screen.getByText('ゆたかみどり')).toBeInTheDocument();
  });

  it('検索機能が動作すること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('品種名、場所、香りで検索...');
    fireEvent.change(searchInput, { target: { value: 'やぶきた' } });

    expect(screen.getByText('やぶきた')).toBeInTheDocument();
    expect(screen.queryByText('さやまかおり')).not.toBeInTheDocument();
    expect(screen.queryByText('ゆたかみどり')).not.toBeInTheDocument();
  });

  it('フィルター機能が動作すること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    // 状態フィルター
    const statusFilters = screen.getAllByDisplayValue('すべて');
    fireEvent.change(statusFilters[1], { target: { name: 'status', value: 'active' } });

    expect(screen.getByText('やぶきた')).toBeInTheDocument();
    expect(screen.getByText('さやまかおり')).toBeInTheDocument();
    expect(screen.queryByText('ゆたかみどり')).not.toBeInTheDocument();
  });

  it('場所フィルターが動作すること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    const locationFilters = screen.getAllByDisplayValue('すべて');
    fireEvent.change(locationFilters[0], { target: { name: 'location', value: '静岡県' } });

    expect(screen.getByText('やぶきた')).toBeInTheDocument();
    expect(screen.queryByText('さやまかおり')).not.toBeInTheDocument();
    expect(screen.queryByText('ゆたかみどり')).not.toBeInTheDocument();
  });

  it('世代フィルターが動作すること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    const generationFilters = screen.getAllByDisplayValue('すべて');
    fireEvent.change(generationFilters[2], { target: { name: 'generation', value: 'F1' } });

    expect(screen.getByText('やぶきた')).toBeInTheDocument();
    expect(screen.getByText('ゆたかみどり')).toBeInTheDocument();
    expect(screen.queryByText('さやまかおり')).not.toBeInTheDocument();
  });

  it('年度フィルターが動作すること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    const yearFilters = screen.getAllByDisplayValue('すべて');
    fireEvent.change(yearFilters[3], { target: { name: 'year', value: '2023' } });

    expect(screen.getByText('やぶきた')).toBeInTheDocument();
    expect(screen.getByText('さやまかおり')).toBeInTheDocument();
    expect(screen.queryByText('ゆたかみどり')).not.toBeInTheDocument();
  });

  it('検索結果が空の場合にメッセージが表示されること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('品種名、場所、香りで検索...');
    fireEvent.change(searchInput, { target: { value: '存在しない品種' } });

    expect(screen.getByText('品種が見つかりません')).toBeInTheDocument();
    expect(screen.getByText('検索条件やフィルターを変更してみてください')).toBeInTheDocument();
  });

  it('統計情報が正しく表示されること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    expect(screen.getByText('平均成長評価')).toBeInTheDocument();
    expect(screen.getByText('4.3')).toBeInTheDocument();
    expect(screen.getByText('平均耐病性')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('新規登録リンクが表示されること', () => {
    render(
      <BrowserRouter>
        <TeaList />
      </BrowserRouter>
    );

    const newTeaLink = screen.getByText('新規登録');
    expect(newTeaLink).toBeInTheDocument();
    expect(newTeaLink.closest('a')).toHaveAttribute('href', '/teas/new');
  });
});
