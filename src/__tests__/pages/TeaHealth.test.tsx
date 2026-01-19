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
    solution: '薬剤散布',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
  },
];

const mockHealthStatus = 'warning' as const;

const mockHealthStats = {
  totalIssues: 1,
  openIssues: 1,
  resolvedIssues: 0,
  issueByType: { disease: 1, pest: 0, nutrition: 0, environmental: 0, other: 0 },
  issueBySeverity: { low: 0, medium: 1, high: 0 },
  recentIssues: mockHealthRecords,
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
    expect(screen.getByText('やぶきたの健康管理')).toBeInTheDocument();
    
    // 健康状態が表示されていること
    expect(screen.getByText('注意')).toBeInTheDocument();
    
    // 記録一覧が表示されていること
    expect(screen.getByText('うどんこ病を確認')).toBeInTheDocument();
  });

  it('新規記録ボタンが機能すること', async () => {
    renderComponent();
    
    // 新規記録ボタンをクリック
    fireEvent.click(screen.getByText('記録を追加'));
    
    // フォームが表示されること
    await waitFor(() => {
      expect(screen.getByText('新しい記録を追加')).toBeInTheDocument();
    });
  });

  it('記録の編集ができること', async () => {
    renderComponent();
    
    // 編集ボタンをクリック
    const editButton = screen.getByRole('button', { name: /編集/ });
    fireEvent.click(editButton);
    
    // フォームが表示され、既存のデータがセットされていること
    await waitFor(() => {
      expect(screen.getByText('記録を編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('うどんこ病を確認')).toBeInTheDocument();
    });
  });

  it('記録の削除ができること', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderComponent();
    
    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /削除/ });
    fireEvent.click(deleteButton);
    
    // 削除関数が呼ばれること
    expect(mockDeleteRecord).toHaveBeenCalledWith('1');

    confirmSpy.mockRestore();
  });

  it('お茶のデータがない場合はエラーメッセージを表示すること', () => {
    // お茶のデータが取得できない場合のモック
    mockGetTeaById.mockReturnValueOnce(null);
    
    renderComponent('999');
    
    expect(screen.getByText('お茶の品種が見つかりません')).toBeInTheDocument();
  });

  it('問題の内訳が表示されること', () => {
    renderComponent();

    expect(screen.getByText('問題の内訳')).toBeInTheDocument();
    expect(screen.getAllByText('病気')).toHaveLength(2); // 見出しと内訳の2回
    expect(screen.getAllByText('1件')).toHaveLength(2); // 内訳の2回
  });
});
