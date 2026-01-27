import { useState, useEffect, useCallback, useMemo } from 'react';
import { TeaVariety } from '../types/teaVariety';
import { GrowthRecord } from '../types/growthRecord';
import { HealthIssue } from '../types/healthStatus';
import { ChartWidget } from '../components/dashboard/InteractiveDashboard';
import { AdvancedChart, ChartData } from '../components/charts/AdvancedChart';

// データ更新イベントの型定義
export interface DataUpdateEvent {
  type: 'tea' | 'growth' | 'health';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

// リアルタイムデータフックの設定
export interface RealtimeConfig {
  enabled: boolean;
  updateInterval: number;
  maxRetries: number;
  retryDelay: number;
}

// データ集計結果の型定義
export interface AggregatedData {
  summary: {
    totalTeas: number;
    activeTeas: number;
    totalGrowthRecords: number;
    totalHealthIssues: number;
    averageGrowthScore: number;
    averageGerminationRate: number;
  };
  byLocation: Record<string, {
    count: number;
    avgGrowthScore: number;
    avgGerminationRate: number;
  }>;
  byGeneration: Record<string, {
    count: number;
    avgGrowthScore: number;
    avgGerminationRate: number;
  }>;
  byYear: Record<string, {
    count: number;
    avgGrowthScore: number;
    avgGerminationRate: number;
  }>;
  healthIssuesByType: Record<string, number>;
  healthIssuesBySeverity: Record<string, number>;
  growthTrends: Array<{
    date: string;
    avgHeight: number;
    avgLeafCount: number;
    recordCount: number;
  }>;
}

export const useRealtimeData = (
  teas: TeaVariety[],
  growthRecords: GrowthRecord[],
  healthIssues: HealthIssue[],
  config: RealtimeConfig = {
    enabled: true,
    updateInterval: 30000, // 30秒
    maxRetries: 3,
    retryDelay: 5000,
  }
) => {
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateHistory, setUpdateHistory] = useState<DataUpdateEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // データの集計（メモ化）
  const aggregatedData = useMemo((): AggregatedData => {
    const summary = {
      totalTeas: teas.length,
      activeTeas: teas.filter(t => t.status === 'active').length,
      totalGrowthRecords: growthRecords.length,
      totalHealthIssues: healthIssues.length,
      averageGrowthScore: teas.length > 0 
        ? teas.reduce((sum, tea) => sum + tea.growthScore, 0) / teas.length 
        : 0,
      averageGerminationRate: teas.length > 0 
        ? teas.reduce((sum, tea) => sum + tea.germinationRate, 0) / teas.length 
        : 0,
    };

    // 場所別集計
    const byLocation = teas.reduce((acc, tea) => {
      if (!acc[tea.location]) {
        acc[tea.location] = { count: 0, avgGrowthScore: 0, avgGerminationRate: 0 };
      }
      acc[tea.location].count++;
      acc[tea.location].avgGrowthScore += tea.growthScore;
      acc[tea.location].avgGerminationRate += tea.germinationRate;
      return acc;
    }, {} as Record<string, typeof summary & { count: number }>);

    // 平均値の計算
    Object.keys(byLocation).forEach(location => {
      const data = byLocation[location];
      data.avgGrowthScore = data.avgGrowthScore / data.count;
      data.avgGerminationRate = data.avgGerminationRate / data.count;
    });

    // 世代別集計
    const byGeneration = teas.reduce((acc, tea) => {
      if (!acc[tea.generation]) {
        acc[tea.generation] = { count: 0, avgGrowthScore: 0, avgGerminationRate: 0 };
      }
      acc[tea.generation].count++;
      acc[tea.generation].avgGrowthScore += tea.growthScore;
      acc[tea.generation].avgGerminationRate += tea.germinationRate;
      return acc;
    }, {} as Record<string, typeof summary & { count: number }>);

    Object.keys(byGeneration).forEach(generation => {
      const data = byGeneration[generation];
      data.avgGrowthScore = data.avgGrowthScore / data.count;
      data.avgGerminationRate = data.avgGerminationRate / data.count;
    });

    // 年度別集計
    const byYear = teas.reduce((acc, tea) => {
      if (!acc[tea.year.toString()]) {
        acc[tea.year.toString()] = { count: 0, avgGrowthScore: 0, avgGerminationRate: 0 };
      }
      acc[tea.year.toString()].count++;
      acc[tea.year.toString()].avgGrowthScore += tea.growthScore;
      acc[tea.year.toString()].avgGerminationRate += tea.germinationRate;
      return acc;
    }, {} as Record<string, typeof summary & { count: number }>);

    Object.keys(byYear).forEach(year => {
      const data = byYear[year];
      data.avgGrowthScore = data.avgGrowthScore / data.count;
      data.avgGerminationRate = data.avgGerminationRate / data.count;
    });

    // 健康問題のタイプ別集計
    const healthIssuesByType = healthIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 健康問題の重大度別集計
    const healthIssuesBySeverity = healthIssues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 成長トレンド
    const growthTrends = growthRecords
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc, record, index, array) => {
        const date = record.date;
        const existingIndex = acc.findIndex(item => item.date === date);
        
        if (existingIndex >= 0) {
          acc[existingIndex].avgHeight = (acc[existingIndex].avgHeight + (record.height || 0)) / 2;
          acc[existingIndex].avgLeafCount = (acc[existingIndex].avgLeafCount + (record.leafCount || 0)) / 2;
          acc[existingIndex].recordCount++;
        } else {
          acc.push({
            date,
            avgHeight: record.height || 0,
            avgLeafCount: record.leafCount || 0,
            recordCount: 1,
          });
        }
        
        return acc;
      }, [] as AggregatedData['growthTrends']);

    return {
      summary,
      byLocation,
      byGeneration,
      byYear,
      healthIssuesByType,
      healthIssuesBySeverity,
      growthTrends,
    };
  }, [teas, growthRecords, healthIssues]);

  // データ更新イベントの記録
  const recordUpdateEvent = useCallback((event: DataUpdateEvent) => {
    setUpdateHistory(prev => [event, ...prev.slice(0, 99)]); // 最新100件を保持
    setLastUpdate(event.timestamp);
    setRetryCount(0);
    setError(null);
  }, []);

  // 手動データ更新
  const forceUpdate = useCallback(async () => {
    if (!config.enabled) return;

    setIsUpdating(true);
    setError(null);

    try {
      // ここで実際のデータ更新ロジックを実装
      // 例：APIコール、データベース同期など
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬処理

      const event: DataUpdateEvent = {
        type: 'tea',
        action: 'update',
        data: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      };

      recordUpdateEvent(event);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データ更新に失敗しました';
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsUpdating(false);
    }
  }, [config.enabled, recordUpdateEvent]);

  // 自動更新の設定
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(() => {
      if (!isUpdating && retryCount < config.maxRetries) {
        forceUpdate();
      }
    }, config.updateInterval);

    return () => clearInterval(interval);
  }, [config.enabled, config.updateInterval, isUpdating, retryCount, config.maxRetries, forceUpdate]);

  // リトライ処理
  useEffect(() => {
    if (error && retryCount < config.maxRetries) {
      const timeout = setTimeout(() => {
        forceUpdate();
      }, config.retryDelay);

      return () => clearTimeout(timeout);
    }
  }, [error, retryCount, config.maxRetries, config.retryDelay, forceUpdate]);

  // チャートデータの生成
  const generateChartData = useCallback((
    dataType: 'summary' | 'location' | 'generation' | 'year' | 'health' | 'growth'
  ): ChartData => {
    switch (dataType) {
      case 'summary':
        return {
          data: [
            { name: '品種数', value: aggregatedData.summary.totalTeas },
            { name: '栽培中', value: aggregatedData.summary.activeTeas },
            { name: '成長記録', value: aggregatedData.summary.totalGrowthRecords },
            { name: '健康問題', value: aggregatedData.summary.totalHealthIssues },
          ],
        };

      case 'location':
        return {
          data: Object.entries(aggregatedData.byLocation).map(([location, data]) => ({
            name: location,
            value: data.count,
            avgGrowthScore: data.avgGrowthScore,
            avgGerminationRate: data.avgGerminationRate,
          })),
        };

      case 'generation':
        return {
          data: Object.entries(aggregatedData.byGeneration).map(([generation, data]) => ({
            name: `第${generation}世代`,
            value: data.count,
            avgGrowthScore: data.avgGrowthScore,
            avgGerminationRate: data.avgGerminationRate,
          })),
        };

      case 'year':
        return {
          data: Object.entries(aggregatedData.byYear)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([year, data]) => ({
              name: `${year}年`,
              value: data.count,
              avgGrowthScore: data.avgGrowthScore,
              avgGerminationRate: data.avgGerminationRate,
            })),
        };

      case 'health':
        return {
          data: [
            ...Object.entries(aggregatedData.healthIssuesByType).map(([type, count]) => ({
              name: type === 'disease' ? '病気' : type === 'pest' ? '害虫' : type === 'environmental' ? '環境' : 'その他',
              value: count,
              category: 'type',
            })),
            ...Object.entries(aggregatedData.healthIssuesBySeverity).map(([severity, count]) => ({
              name: severity === 'low' ? '低' : severity === 'medium' ? '中' : severity === 'high' ? '高' : '緊急',
              value: count,
              category: 'severity',
            })),
          ],
        };

      case 'growth':
        return {
          data: aggregatedData.growthTrends.slice(-30).map(trend => ({
            name: new Date(trend.date).toLocaleDateString('ja-JP'),
            avgHeight: trend.avgHeight,
            avgLeafCount: trend.avgLeafCount,
            recordCount: trend.recordCount,
          })),
        };

      default:
        return { data: [] };
    }
  }, [aggregatedData]);

  // プリセットチャートの生成
  const generatePresetWidgets = useCallback((): ChartWidget[] => {
    const baseConfig = {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      animationDuration: 1000,
    };

    return [
      {
        id: 'summary-pie',
        title: 'データ概要',
        type: 'pie',
        data: generateChartData('summary'),
        config: {
          ...baseConfig,
          pieRadius: 80,
          showDataLabels: true,
        },
        position: { x: 0, y: 0, w: 4, h: 4 },
        refreshInterval: 60000,
        lastUpdated,
      },
      {
        id: 'location-bar',
        title: '場所別品種数',
        type: 'bar',
        data: generateChartData('location'),
        config: {
          ...baseConfig,
          xAxis: { dataKey: 'name', label: '場所' },
          yAxis: { label: '品種数' },
          dataKeys: ['value'],
        },
        position: { x: 4, y: 0, w: 4, h: 4 },
        refreshInterval: 60000,
        lastUpdated,
      },
      {
        id: 'growth-trend',
        title: '成長トレンド',
        type: 'line',
        data: generateChartData('growth'),
        config: {
          ...baseConfig,
          xAxis: { dataKey: 'name', label: '日付', angle: -45 },
          yAxis: { label: '平均値' },
          dataKeys: ['avgHeight', 'avgLeafCount'],
        },
        position: { x: 8, y: 0, w: 4, h: 4 },
        refreshInterval: 60000,
        lastUpdated,
      },
      {
        id: 'generation-radar',
        title: '世代別特性',
        type: 'radar',
        data: generateChartData('generation'),
        config: {
          ...baseConfig,
          xAxis: { dataKey: 'name' },
          yAxis: { domain: [0, 100] },
          dataKeys: ['avgGrowthScore', 'avgGerminationRate'],
        },
        position: { x: 0, y: 4, w: 6, h: 4 },
        refreshInterval: 60000,
        lastUpdated,
      },
      {
        id: 'health-issues',
        title: '健康問題分布',
        type: 'composed',
        data: generateChartData('health'),
        config: {
          ...baseConfig,
          xAxis: { dataKey: 'name', angle: -45 },
          yAxis: { label: '件数' },
          dataKeys: ['value'],
        },
        position: { x: 6, y: 4, w: 6, h: 4 },
        refreshInterval: 60000,
        lastUpdated,
      },
    ];
  }, [generateChartData, lastUpdate]);

  return {
    lastUpdate,
    isUpdating,
    error,
    retryCount,
    updateHistory,
    aggregatedData,
    forceUpdate,
    generateChartData,
    generatePresetWidgets,
  };
};
