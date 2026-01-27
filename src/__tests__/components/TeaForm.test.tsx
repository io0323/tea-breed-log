import { render, screen, fireEvent } from '@testing-library/react';
import { TeaForm } from '../../components/TeaForm';
import { TeaVariety } from '../../types/teaVariety';
import '@testing-library/jest-dom';

describe('TeaForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const mockTeaData: TeaVariety = {
    id: '1',
    name: 'テスト品種',
    generation: 'F2',
    location: 'テスト農園',
    year: 2023,
    germinationRate: 85,
    growthScore: 4,
    diseaseResistance: 3,
    aroma: 'フルーティー',
    note: 'テストメモ',
    status: 'active',
    images: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('新規作成時にフォームが正しく初期化されること', () => {
    render(<TeaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText('品種名')).toHaveValue('');
    expect(screen.getByLabelText('世代')).toHaveValue('F1');
    expect(screen.getByLabelText('栽培地')).toHaveValue('');
    expect(screen.getByLabelText(/発芽率/)).toHaveValue(0);
    expect(screen.getByLabelText(/生育スコア/)).toHaveValue(0);
    expect(screen.getByLabelText(/耐病性/)).toHaveValue(0);
    expect(screen.getByLabelText('香気特徴')).toHaveValue('');
    expect(screen.getByLabelText('メモ')).toHaveValue('');
    expect(screen.getByText('追加')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('編集時にフォームが初期データで初期化されること', () => {
    render(
      <TeaForm 
        initialData={mockTeaData} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByLabelText('品種名')).toHaveValue(mockTeaData.name);
    expect(screen.getByLabelText('世代')).toHaveValue(mockTeaData.generation);
    expect(screen.getByLabelText('栽培地')).toHaveValue(mockTeaData.location);
    expect(screen.getByLabelText(/発芽率/)).toHaveValue(mockTeaData.germinationRate);
    expect(screen.getByLabelText(/生育スコア/)).toHaveValue(mockTeaData.growthScore);
    expect(screen.getByLabelText(/耐病性/)).toHaveValue(mockTeaData.diseaseResistance);
    expect(screen.getByLabelText('香気特徴')).toHaveValue(mockTeaData.aroma);
    expect(screen.getByLabelText('メモ')).toHaveValue(mockTeaData.note);
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('フォームの入力が正しく処理されること', () => {
    render(<TeaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('品種名'), { target: { value: '新しい品種' } });
    fireEvent.change(screen.getByLabelText('世代'), { target: { value: 'F3' } });
    fireEvent.change(screen.getByLabelText(/発芽率/), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText(/生育スコア/), { target: { value: '5' } });

    expect(screen.getByLabelText('品種名')).toHaveValue('新しい品種');
    expect(screen.getByLabelText('世代')).toHaveValue('F3');
    expect(screen.getByLabelText(/発芽率/)).toHaveValue(90);
    expect(screen.getByLabelText(/生育スコア/)).toHaveValue(5);
  });

  it('フォーム送信時に正しいデータが送信されること', async () => {
    render(<TeaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('品種名'), { target: { value: 'テスト品種' } });
    fireEvent.change(screen.getByLabelText('栽培地'), { target: { value: 'テスト農園' } });
    fireEvent.change(screen.getByLabelText(/発芽率/), { target: { value: '85' } });
    // 必須項目を入力
    fireEvent.change(screen.getByLabelText('品種名'), { target: { value: 'テスト品種' } });
    fireEvent.change(screen.getByLabelText('栽培地'), { target: { value: 'テスト農園' } });
    fireEvent.change(screen.getByLabelText('年'), { target: { value: '2024' } });
    fireEvent.change(screen.getByLabelText(/発芽率/), { target: { value: '85' } });
    fireEvent.change(screen.getByLabelText(/生育スコア/), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/耐病性/), { target: { value: '4' } });
    
    // フォーム送信
    fireEvent.click(screen.getByRole('button', { name: '追加' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'テスト品種',
      generation: 'F1',
      location: 'テスト農園',
      year: 2024,
      germinationRate: 85,
      growthScore: 3,
      diseaseResistance: 4,
      aroma: '',
      note: '',
      status: 'active',
      images: []
    });
  });

  it('キャンセルボタンが機能すること', () => {
    render(<TeaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('キャンセル'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('数値フィールドが正しく処理されること', () => {
    render(<TeaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const numberFields = [
      { label: '発芽率', name: 'germinationRate', value: '85' },
      { label: '生育スコア', name: 'growthScore', value: '4' },
      { label: '耐病性', name: 'diseaseResistance', value: '3' },
    ];

    numberFields.forEach(({ label, value }) => {
      const input = screen.getByLabelText(new RegExp(label));
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(Number(value));
    });
  });
});
