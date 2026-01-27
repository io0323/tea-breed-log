import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GrowthRecordList } from '../../../../src/components/growth/GrowthRecordList';
import { GrowthRecord } from '../../../../src/types/growthRecord';
import '@testing-library/jest-dom';

// モックデータ
const mockRecords: GrowthRecord[] = [
  {
    id: '1',
    teaId: 'tea-1',
    date: '2025-01-15',
    height: 15.5,
    leafCount: 8,
    weather: 'sunny',
    temperature: 22,
    notes: '順調に成長中',
    imageUrl: 'https://example.com/image1.jpg',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    teaId: 'tea-1',
    date: '2025-01-10',
    height: 12.3,
    leafCount: 6,
    weather: 'cloudy',
    temperature: 20,
    notes: '少し成長が遅い',
    imageUrl: 'https://example.com/image2.jpg',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
];

describe('GrowthRecordList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('レコードが正しく表示されること', () => {
    render(
      <GrowthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // レコードが正しい件数表示されていること
    const recordItems = screen.getAllByRole('listitem');
    expect(recordItems).toHaveLength(mockRecords.length);

    // 各レコードの内容が正しく表示されていること
    expect(screen.getByText('2025年01月15日 (水)')).toBeInTheDocument();
    expect(screen.getByText('草丈: 15.5 cm')).toBeInTheDocument();
    expect(screen.getByText('葉の数: 8枚')).toBeInTheDocument();
    expect(screen.getByText('気温: 22°C')).toBeInTheDocument();
    expect(screen.getByText('順調に成長中')).toBeInTheDocument();

    expect(screen.getByText('2025年01月10日 (金)')).toBeInTheDocument();
    expect(screen.getByText('草丈: 12.3 cm')).toBeInTheDocument();
    expect(screen.getByText('葉の数: 6枚')).toBeInTheDocument();
    expect(screen.getByText('気温: 20°C')).toBeInTheDocument();
    expect(screen.getByText('少し成長が遅い')).toBeInTheDocument();

    // 天気アイコンが正しく表示されていること
    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(screen.getByText('☁️')).toBeInTheDocument();
  });

  it('レコードがない場合に適切なメッセージが表示されること', () => {
    render(
      <GrowthRecordList 
        records={[]} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('成長記録がありません。記録を追加してください。')).toBeInTheDocument();
  });

  it('編集ボタンが機能すること', () => {
    render(
      <GrowthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // 最初のレコードの編集ボタンをクリック（アイコン要素）
    const editButtons = screen.getAllByRole('button');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockRecords[0]);
  });

  it('削除ボタンが機能すること', () => {
    // window.confirmをモック
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(
      <GrowthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // 最初のレコードの削除ボタンをクリック（アイコン要素）
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[1]); // 2番目のボタン（削除）

    // onDeleteが正しいIDで呼ばれたことを確認
    expect(mockOnDelete).toHaveBeenCalledWith(mockRecords[0].id);

    // モックを元に戻す
    window.confirm = originalConfirm;
  });

  it('isEditableがfalseの場合、編集・削除ボタンが表示されないこと', () => {
    render(
      <GrowthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
        isEditable={false}
      />
    );

    // 編集・削除ボタンが表示されないこと
    expect(screen.queryByRole('button', { name: /編集/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /削除/ })).not.toBeInTheDocument();
  });
});
