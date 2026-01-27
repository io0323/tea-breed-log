import { render, screen } from '@testing-library/react';
import { HealthRecordForm } from '../../../components/health/HealthRecordForm';
import { format } from 'date-fns';
import '@testing-library/jest-dom';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const initialData = {
  id: '1',
  teaId: 'tea-1',
  date: '2025-01-13',
  type: 'disease' as const,
  severity: 'medium' as const,
  description: 'テストの健康記録',
  status: 'open' as const,
  treatment: 'テスト治療',
  notes: 'テストメモ',
  createdAt: '2025-01-13T00:00:00.000Z',
  updatedAt: '2025-01-13T00:00:00.000Z',
  resolvedAt: null,
};

describe('HealthRecordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('新規作成時にフォームが正しく初期化されること', () => {
    render(
      <HealthRecordForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // デフォルト値の確認
    expect(screen.getByLabelText(/記録日/)).toHaveValue(
      format(new Date(), 'yyyy-MM-dd')
    );
    expect(screen.getByLabelText(/状態/)).toHaveValue('open');
    expect(screen.getByLabelText(/深刻度/)).toHaveValue('medium');
    expect(screen.getByLabelText(/詳細/)).toHaveValue('');
  });

  it('編集時にフォームが初期データで初期化されること', () => {
    render(
      <HealthRecordForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    expect(screen.getByLabelText(/記録日/)).toHaveValue(initialData.date);
    expect(screen.getByLabelText(/種類/)).toHaveValue(initialData.type);
    expect(screen.getByLabelText(/深刻度/)).toHaveValue(initialData.severity);
    expect(screen.getByLabelText(/詳細/)).toHaveValue(initialData.description);
    expect(screen.getByLabelText(/状態/)).toHaveValue(initialData.status);
    expect(screen.getByLabelText(/治療内容/)).toHaveValue(initialData.treatment);
    expect(screen.getByLabelText(/メモ/)).toHaveValue(initialData.notes);
  });
});
