import { render, screen, fireEvent } from '@testing-library/react';
import { HealthRecordList } from '../../../../src/components/health/HealthRecordList';
import { HealthIssue } from '../../../../src/types/healthRecord';
import '@testing-library/jest-dom';

// モックデータ
const mockRecords: HealthIssue[] = [
  {
    id: '1',
    teaId: 'tea-1',
    date: '2025-01-15',
    type: 'disease' as const,
    severity: 'high' as const,
    description: 'うどんこ病を確認',
    status: 'open' as const,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    teaId: 'tea-1',
    date: '2025-01-10',
    type: 'pest' as const,
    severity: 'medium' as const,
    description: 'アブラムシを確認',
    status: 'in_progress' as const,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-12T00:00:00.000Z',
  },
  {
    id: '3',
    teaId: 'tea-1',
    date: '2025-01-05',
    type: 'nutrition' as const,
    severity: 'low' as const,
    description: '葉の色が薄い',
    status: 'resolved' as const,
    createdAt: '2025-01-05T00:00:00.000Z',
    updatedAt: '2025-01-08T00:00:00.000Z',
  },
];

describe('HealthRecordList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // window.confirmをモック
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    return () => {
      window.confirm = originalConfirm;
    };
  });

  it('レコードが正しく表示されること', () => {
    render(
      <HealthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // レコードが正しい件数表示されていること
    const recordItems = screen.getAllByRole('listitem');
    expect(recordItems).toHaveLength(mockRecords.length);

    // 各レコードの内容が正しく表示されていること
    expect(screen.getByText('うどんこ病を確認')).toBeInTheDocument();
    expect(screen.getByText('アブラムシを確認')).toBeInTheDocument();
    expect(screen.getByText('葉の色が薄い')).toBeInTheDocument();

    // ステータスが正しく表示されていること
    expect(screen.getByText('未対応')).toBeInTheDocument();
    expect(screen.getByText('対応中')).toBeInTheDocument();
    expect(screen.getByText('解決済み')).toBeInTheDocument();
  });

  it('レコードがない場合に適切なメッセージが表示されること', () => {
    render(
      <HealthRecordList 
        records={[]} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // テキストが分割されているため、部分一致で確認
    expect(screen.getByText((text, element) => text.includes('健康記録がありません'))).toBeInTheDocument();
  });

  it('編集ボタンが機能すること', () => {
    render(
      <HealthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // 最初のレコードの編集ボタンをクリック
    const editButtons = screen.getAllByRole('button', { name: /編集/ });
    fireEvent.click(editButtons[0]);

    // onEditが正しい引数で呼ばれたことを確認
    expect(mockOnEdit).toHaveBeenCalledWith(mockRecords[0]);
  });

  it('削除ボタンが機能すること', () => {
    render(
      <HealthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // 最初のレコードの削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
    fireEvent.click(deleteButtons[0]);

    // onDeleteが正しいIDで呼ばれたことを確認
    expect(mockOnDelete).toHaveBeenCalledWith(mockRecords[0].id);
  });

  it('isEditableがfalseの場合、編集・削除ボタンが表示されないこと', () => {
    render(
      <HealthRecordList 
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

  it('日付が正しい形式で表示されること', () => {
    render(
      <HealthRecordList 
        records={mockRecords} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    // 日付が「yyyy年MM月dd日 (E)」形式で表示されていることを確認
    expect(screen.getByText('2025年01月15日 (水)')).toBeInTheDocument();
    expect(screen.getByText('2025年01月10日 (金)')).toBeInTheDocument();
    expect(screen.getByText('2025年01月05日 (日)')).toBeInTheDocument();
  });
});
