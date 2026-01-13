import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeaGrowthChart } from '../../../components/charts/TeaGrowthChart';
import { TeaVariety } from '../../../types/teaVariety';
import '@testing-library/jest-dom';

describe('TeaGrowthChart', () => {
  const mockTeas: TeaVariety[] = [
    {
      id: '1',
      name: 'やぶきた',
      generation: 'F1',
      location: '静岡県',
      year: 2023,
      germinationRate: 90,
      growthScore: 4,
      diseaseResistance: 3,
      aroma: '爽やか',
      note: 'テストメモ1',
      status: 'active',
      images: [],
    },
    {
      id: '2',
      name: 'さやまかおり',
      generation: 'F2',
      location: '鹿児島県',
      year: 2023,
      germinationRate: 85,
      growthScore: 5,
      diseaseResistance: 4,
      aroma: '甘い',
      note: 'テストメモ2',
      status: 'active',
      images: [],
    },
  ];

  it('コンポーネントが正しくレンダリングされること', () => {
    render(<TeaGrowthChart teas={mockTeas} />);
    
    // タイトルが表示されていること
    expect(screen.getByText('品種別 生育スコア比較')).toBeInTheDocument();
    
    // チャートコンテナが表示されていること
    const chart = screen.getByRole('img', { name: /chart/i });
    expect(chart).toBeInTheDocument();
  });

  it('データが正しく表示されること', () => {
    render(<TeaGrowthChart teas={mockTeas} />);
    
    // 各品種名が表示されていること
    mockTeas.forEach(tea => {
      expect(screen.getByText(tea.name)).toBeInTheDocument();
    });
  });

  it('データが空の場合に適切なメッセージを表示すること', () => {
    render(<TeaGrowthChart teas={[]} />);
    
    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
  });
});
