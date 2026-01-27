import React, { useState, useCallback, useMemo } from 'react';
import { InteractiveDashboard, ChartWidget } from '../components/dashboard/InteractiveDashboard';
import { DataAnalysisPanel } from '../components/analysis/DataAnalysisPanel';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useTeaVarieties } from '../hooks/useTeaVarieties';
import { useGrowthRecords } from '../hooks/useGrowthRecords';
import { useHealthIssues } from '../hooks/useHealthIssues';
import { AdvancedChart } from '../components/charts/AdvancedChart';
import { ChartBarIcon, FunnelIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

// 利用可能なフィールドの定義
const AVAILABLE_FIELDS = [
  { value: 'name', label: '品種名', type: 'string' as const },
  { value: 'location', label: '場所', type: 'string' as const },
  { value: 'generation', label: '世代', type: 'string' as const },
  { value: 'year', label: '年度', type: 'number' as const },
  { value: 'germinationRate', label: '発芽率', type: 'number' as const },
  { value: 'growthScore', label: '成長スコア', type: 'number' as const },
  { value: 'diseaseResistance', label: '耐病性', type: 'number' as const },
  { value: 'status', label: '状態', type: 'string' as const },
];

const DataVisualizationDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis'>('dashboard');
  const [widgets, setWidgets] = useState<ChartWidget[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // データフック
  const { teas } = useTeaVarieties();
  const { growthRecords } = useGrowthRecords();
  const { healthIssues } = useHealthIssues();

  // リアルタイムデータフック
  const {
    lastUpdate,
    isUpdating,
    error,
    aggregatedData,
    forceUpdate,
    generatePresetWidgets,
  } = useRealtimeData(teas, growthRecords, healthIssues);

  // プリセットウィジェットの初期化
  React.useEffect(() => {
    if (widgets.length === 0 && teas.length > 0) {
      const presetWidgets = generatePresetWidgets();
      setWidgets(presetWidgets);
    }
  }, [teas.length, widgets.length, generatePresetWidgets]);

  // ウィジェット操作
  const handleWidgetUpdate = useCallback((widget: ChartWidget) => {
    setWidgets(prev => prev.map(w => w.id === widget.id ? widget : w));
  }, []);

  const handleWidgetRemove = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);

  const handleWidgetAdd = useCallback((widget: Omit<ChartWidget, 'id'>) => {
    const newWidget: ChartWidget = {
      ...widget,
      id: Date.now().toString(),
    };
    setWidgets(prev => [...prev, newWidget]);
  }, []);

  // 分析用データの準備
  const analysisData = useMemo(() => {
    return teas.map(tea => ({
      ...tea,
      value: tea.growthScore, // デフォルトの分析対象
    }));
  }, [teas]);

  // タブ切り替え
  const tabs = [
    { id: 'dashboard', label: 'ダッシュボード', icon: ChartBarIcon },
    { id: 'analysis', label: 'データ分析', icon: FunnelIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  データ可視化ダッシュボード
                </h1>
                <p className="text-sm text-gray-500">
                  最終更新: {new Date(lastUpdate).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {error && (
                <div className="text-sm text-red-600">
                  エラー: {error}
                </div>
              )}
              
              <button
                onClick={forceUpdate}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
              >
                {isUpdating ? '更新中...' : '手動更新'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'dashboard' | 'analysis')}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <InteractiveDashboard
            widgets={widgets}
            onWidgetUpdate={handleWidgetUpdate}
            onWidgetRemove={handleWidgetRemove}
            onWidgetAdd={handleWidgetAdd}
          />
        )}

        {activeTab === 'analysis' && (
          <DataAnalysisPanel
            data={analysisData}
            availableFields={AVAILABLE_FIELDS}
          />
        )}
      </div>

      {/* 統計情報フッター */}
      <div className="bg-white border-t border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{aggregatedData.summary.totalTeas}</div>
              <div className="text-sm text-gray-500">品種数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{aggregatedData.summary.activeTeas}</div>
              <div className="text-sm text-gray-500">栽培中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{aggregatedData.summary.totalGrowthRecords}</div>
              <div className="text-sm text-gray-500">成長記録</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{aggregatedData.summary.totalHealthIssues}</div>
              <div className="text-sm text-gray-500">健康問題</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {aggregatedData.summary.averageGrowthScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">平均成長スコア</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {aggregatedData.summary.averageGerminationRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">平均発芽率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationDashboard;
