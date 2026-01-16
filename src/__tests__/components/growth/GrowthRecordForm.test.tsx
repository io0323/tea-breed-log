import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GrowthRecordForm } from '../../../../src/components/growth/GrowthRecordForm';
import { GrowthRecord } from '../../../../src/types/growthRecord';
import '@testing-library/jest-dom';

// モックデータ
const mockInitialData: Partial<GrowthRecord> = {
  id: '1',
  teaId: 'tea-1',
  date: '2025-01-15',
  height: 15.5,
  leafCount: 8,
  weather: 'sunny' as const,
  temperature: 22,
  notes: '順調に成長中',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: '2025-01-15T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
};

describe('GrowthRecordForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('新規作成フォームが正しくレンダリングされること', () => {
    render(
      <GrowthRecordForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // フォームのタイトルが表示されていること
    expect(screen.getByText('生育記録を追加')).toBeInTheDocument();
    
    // 必須フィールドが表示されていること
    expect(screen.getByLabelText('記録日 *')).toBeInTheDocument();
    expect(screen.getByLabelText('草丈 (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('葉の数')).toBeInTheDocument();
    expect(screen.getByLabelText('天気 *')).toBeInTheDocument();
    expect(screen.getByLabelText('気温 (℃)')).toBeInTheDocument();
    
    // ボタンが表示されていること
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });

  it('編集モードで初期値が正しく設定されること', () => {
    render(
      <GrowthRecordForm 
        initialData={mockInitialData}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // フォームのタイトルが編集モードになっていること
    expect(screen.getByText('生育記録を編集')).toBeInTheDocument();
    
    // 初期値が正しく設定されていること
    expect(screen.getByDisplayValue('2025-01-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('晴れ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('22')).toBeInTheDocument();
    expect(screen.getByDisplayValue('順調に成長中')).toBeInTheDocument();
  });

  it('バリデーションエラーが表示されること', async () => {
    render(
      <GrowthRecordForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // 必須フィールドを空にして送信
    const submitButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(submitButton);

    // バリデーションエラーが表示されること
    await waitFor(() => {
      expect(screen.getByText('記録日は必須です')).toBeInTheDocument();
      expect(screen.getByText('草丈は0より大きい値を入力してください')).toBeInTheDocument();
      expect(screen.getByText('葉の数は0以上の整数を入力してください')).toBeInTheDocument();
    });
  });

  it('フォーム送信が正しく行われること', async () => {
    render(
      <GrowthRecordForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // フォームに入力
    fireEvent.change(screen.getByLabelText('記録日 *'), { target: { value: '2025-01-20' } });
    fireEvent.change(screen.getByLabelText('草丈 (cm)'), { target: { value: '18.5' } });
    fireEvent.change(screen.getByLabelText('葉の数'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('天気 *'), { target: { value: 'cloudy' } });
    fireEvent.change(screen.getByLabelText('気温 (℃)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('メモ'), { target: { value: 'テストメモ' } });

    // 送信ボタンをクリック
    const submitButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(submitButton);

    // 送信データが正しいこと
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        date: '2025-01-20',
        height: 18.5,
        leafCount: 10,
        weather: 'cloudy',
        temperature: 20,
        notes: 'テストメモ',
        imageUrl: '',
      });
    });
  });

  it('キャンセルボタンが機能すること', () => {
    render(
      <GrowthRecordForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    // onCancelが呼ばれたことを確認
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('ローディング中はボタンが無効になること', () => {
    render(
      <GrowthRecordForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        isSubmitting={true}
      />
    );

    // 送信ボタンが無効になっていること
    const submitButton = screen.getByRole('button', { name: '保存' });
    expect(submitButton).toBeDisabled();
  });
});
