import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeaHealth } from '../../pages/TeaHealth';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// モック
jest.mock('../../hooks/useTeaVarieties');
jest.mock('../../hooks/useHealthRecords');

// モックデータ
const mockTea = {
  id: '1',
  name: 'やぶきた',
  generation: 'F1',
  growthScore: 4,
  diseaseResistance: 3,
  status: 'active' as const,
};

const mockHealthRecords = [
  {
    id: '1',
    teaId: '1',
    date: '2025-01-15',
    type: 'disease' as const,
    severity: 'medium' as const,
    description: 'うどんこ病を確認',
    status: 'open' as const,
    treatment: '薬剤散布',
    notes: '経過観察中',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
    resolvedAt: null,
  },
];

const mockHealthStatus = {
  status: 'warning' as const,
  message: '健康状態に注意が必要です',
  issues: ['うどんこ病を確認'],
};

const mockHealthStats = {
  totalIssues: 1,
  openIssues: 1,
  resolvedIssues: 0,
  issueTypes: { disease: 1, pest: 0, nutrition: 0, environmental: 0, other: 0 },
};

// モックの実装
const mockGetTeaById = jest.fn().mockReturnValue(mockTea);
const mockAddRecord = jest.fn();
const mockUpdateRecord = jest.fn();
const mockDeleteRecord = jest.fn();

// モックのセットアップ
beforeEach(() => {
  require('../../hooks/useTeaVarieties').useTeaVarieties = jest.fn(() => ({
    getTeaById: mockGetTeaById,
  }));

  require('../../hooks/useHealthRecords').useHealthRecords = jest.fn(() => ({
    records: mockHealthRecords,
    healthStatus: mockHealthStatus,
    healthStats: mockHealthStats,
    addRecord: mockAddRecord,
    updateRecord: mockUpdateRecord,
    deleteRecord: mockDeleteRecord,
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (id = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/teas/${id}/health`]}>
      <Routes>
        <Route path="/teas/:id/health" element={<TeaHealth />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TeaHealth', () => {
  it('コンポーネントが正しくレンダリングされること', () => {
    renderComponent();
    
    // ヘッダーが表示されていること
    expect(screen.getByText('やぶきたの健康状態')).toBeInTheDocument();
    
    // 健康状態が表示されていること
    expect(screen.getByText('健康状態に注意が必要です')).toBeInTheDocument();
    
    // 記録一覧が表示されていること
    expect(screen.getByText('うどんこ病を確認')).toBeInTheDocument();
  });

  it('新規記録ボタンが機能すること', async () => {
    renderComponent();
    
    // 新規記録ボタンをクリック
    fireEvent.click(screen.getByText('記録を追加'));
    
    // フォームが表示されること
    await waitFor(() => {
      expect(screen.getByText('健康記録を追加')).toBeInTheDocument();
    });
  });

  it('記録の編集ができること', async () => {
    renderComponent();
    
    // 編集ボタンをクリック
    const editButton = screen.getByRole('button', { name: /編集/ });
    fireEvent.click(editButton);
    
    // フォームが表示され、既存のデータがセットされていること
    await waitFor(() => {
      expect(screen.getByText('健康記録を編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('うどんこ病を確認')).toBeInTheDocument();
    });
  });

  it('記録の削除ができること', async () => {
    renderComponent();
    
    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /削除/ });
    fireEvent.click(deleteButton);
    
    // 確認ダイアログが表示されること
    expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
    
    // 削除を確定
    const confirmButton = screen.getByRole('button', { name: '削除' });
    fireEvent.click(confirmButton);
    
    // 削除関数が呼ばれること
    expect(mockDeleteRecord).toHaveBeenCalledWith('1');
  });

  it('お茶のデータがない場合はエラーメッセージを表示すること', () => {
    // お茶のデータが取得できない場合のモック
    mockGetTeaById.mockReturnValueOnce(null);
    
    renderComponent('999');
    
    expect(screen.getByText('お茶のデータが見つかりません')).toBeInTheDocument();
  });

  it('タブ切り替えが機能すること', () => {
    renderComponent();
    
    // 統計タブをクリック
    fireEvent.click(screen.getByText('統計'));
    
    // 統計情報が表示されること
    expect(screen.getByText('問題の種類別割合')).toBeInTheDocument();
    
    // 記録一覧タブをクリック
    fireEvent.click(screen.getByText('記録一覧'));
    
    // 記録一覧が表示されること
    expect(screen.getByText('うどんこ病を確認')).toBeInTheDocument();
  });
});
