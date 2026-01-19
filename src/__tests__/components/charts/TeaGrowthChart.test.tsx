import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeaGrowthChart } from '../../../components/charts/TeaGrowthChart';
import '@testing-library/jest-dom';

describe('TeaGrowthChart', () => {
  const mockTeas = [
    { id: '1', name: 'やぶきた', growthScore: 4 },
    { id: '2', name: 'べにふき', growthScore: 3 },
    { id: '3', name: 'おくみどり', growthScore: 5 },
  ];

  beforeEach(() => {
    // EChartsのDOMサイズ警告を抑制
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('データがある場合にコンポーネントがレンダリングされること', () => {
    const { container } = render(<TeaGrowthChart teas={mockTeas} />);
    
    // コンポーネントが存在すること
    expect(container.firstChild).toBeInTheDocument();
  });

  it('データが空の場合に適切なメッセージを表示すること', () => {
    render(<TeaGrowthChart teas={[]} />);
    
    // 空データメッセージが表示されること
    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
  });
});
