import React, { useState, useCallback, useMemo, memo } from 'react';
import { AdvancedChart, ChartConfig, ChartData } from './AdvancedChart';
import { FunnelIcon, ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

// チャートウィジェットの型定義
export interface ChartWidget {
  id: string;
  title: string;
  type: ChartConfig['type'];
  data: ChartData;
  config: ChartConfig;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval?: number;
  lastUpdated?: string;
}

// ダッシュボード設定の型定義
export interface DashboardConfig {
  widgets: ChartWidget[];
  layout: {
    cols: number;
    rows: number;
    gap: number;
  };
  theme: 'light' | 'dark';
  autoRefresh: boolean;
  refreshInterval: number;
}

// チャート作成ウィザードの型定義
export interface ChartWizardStep {
  id: string;
  title: string;
  description: string;
}

export const InteractiveDashboard = memo(({ 
  widgets, 
  onWidgetUpdate, 
  onWidgetRemove,
  onWidgetAdd,
  className = ''
}: {
  widgets: ChartWidget[];
  onWidgetUpdate: (widget: ChartWidget) => void;
  onWidgetRemove: (widgetId: string) => void;
  onWidgetAdd: (widget: Omit<ChartWidget, 'id'>) => void;
  className?: string;
}) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [newWidgetConfig, setNewWidgetConfig] = useState<Partial<ChartWidget>>({});

  // ウィジェットの選択
  const handleWidgetSelect = useCallback((widgetId: string) => {
    setSelectedWidget(widgetId === selectedWidget ? null : widgetId);
  }, [selectedWidget]);

  // ウィジェットの更新
  const handleWidgetConfigUpdate = useCallback((widgetId: string, updates: Partial<ChartWidget>) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      onWidgetUpdate({ ...widget, ...updates });
    }
  }, [widgets, onWidgetUpdate]);

  // ウィジェットの削除
  const handleWidgetRemove = useCallback((widgetId: string) => {
    onWidgetRemove(widgetId);
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  }, [selectedWidget, onWidgetRemove]);

  // ウィザードのステップ管理
  const wizardSteps: ChartWizardStep[] = useMemo(() => [
    {
      id: 'type',
      title: 'チャートタイプ',
      description: '表示するチャートの種類を選択してください'
    },
    {
      id: 'data',
      title: 'データソース',
      description: 'チャートに表示するデータを選択してください'
    },
    {
      id: 'config',
      title: '設定',
      description: 'チャートの詳細設定を行ってください'
    },
    {
      id: 'preview',
      title: 'プレビュー',
      description: 'チャートのプレビューを確認してください'
    }
  ], []);

  // ウィザードの次へ
  const handleWizardNext = useCallback(() => {
    if (wizardStep < wizardSteps.length - 1) {
      setWizardStep(prev => prev + 1);
    }
  }, [wizardStep, wizardSteps.length]);

  // ウィザードの前へ
  const handleWizardPrev = useCallback(() => {
    if (wizardStep > 0) {
      setWizardStep(prev => prev - 1);
    }
  }, [wizardStep]);

  // ウィザードの完了
  const handleWizardComplete = useCallback(() => {
    if (newWidgetConfig.type && newWidgetConfig.data && newWidgetConfig.config) {
      onWidgetAdd({
        title: newWidgetConfig.title || '新しいチャート',
        type: newWidgetConfig.type,
        data: newWidgetConfig.data,
        config: newWidgetConfig.config,
        position: { x: 0, y: 0, w: 6, h: 4 },
        refreshInterval: newWidgetConfig.refreshInterval,
      });
      
      // ウィザードをリセット
      setIsWizardOpen(false);
      setWizardStep(0);
      setNewWidgetConfig({});
    }
  }, [newWidgetConfig, onWidgetAdd]);

  // ウィジェットのエクスポート
  const handleWidgetExport = useCallback((widget: ChartWidget) => {
    const dataStr = JSON.stringify(widget, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-${widget.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // グリッドレイアウトの計算
  const gridLayout = useMemo(() => {
    const cols = 12; // 12列グリッド
    const rowHeight = 100;
    
    return widgets.map(widget => ({
      ...widget.position,
      i: widget.id,
      minW: 3,
      minH: 2,
    }));
  }, [widgets]);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                インタラクティブダッシュボード
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsWizardOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                チャートを追加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* ウィジェットグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${
                selectedWidget === widget.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleWidgetSelect(widget.id)}
            >
              {/* ウィジェットヘッダー */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {widget.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {widget.refreshInterval && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWidgetExport(widget);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    {selectedWidget === widget.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWidgetRemove(widget.id);
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                {widget.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    更新: {new Date(widget.lastUpdated).toLocaleString('ja-JP')}
                  </p>
                )}
              </div>

              {/* チャートコンテンツ */}
              <div className="p-4">
                <AdvancedChart
                  data={widget.data}
                  config={{
                    ...widget.config,
                    width: undefined,
                    height: 200,
                    showLegend: false,
                  }}
                />
              </div>

              {/* ウィジェットフッター */}
              {selectedWidget === widget.id && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>タイプ: {widget.type}</span>
                    <span>データ: {widget.data.data.length}件</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 空の状態 */}
          {widgets.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                チャートがありません
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                最初のチャートを追加してダッシュボードをカスタマイズしましょう
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  チャートを追加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* チャート作成ウィザード */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            {/* ウィザードヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                チャート作成ウィザード
              </h2>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* ステップインジケーター */}
            <div className="flex items-center justify-between mb-6">
              {wizardSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= wizardStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        index < wizardStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ステップコンテンツ */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">
                {wizardSteps[wizardStep].title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {wizardSteps[wizardStep].description}
              </p>

              {/* ステップに応じたコンテンツ */}
              {wizardStep === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['line', 'bar', 'area', 'pie', 'scatter', 'radar', 'treemap', 'composed'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewWidgetConfig({ ...newWidgetConfig, type: type as any })}
                      className={`p-3 border rounded-lg text-center hover:bg-gray-50 ${
                        newWidgetConfig.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-lg mb-1">
                        {type === 'line' && '📈'}
                        {type === 'bar' && '📊'}
                        {type === 'area' && '📉'}
                        {type === 'pie' && '🥧'}
                        {type === 'scatter' && '⚡'}
                        {type === 'radar' && '🎯'}
                        {type === 'treemap' && '🗺️'}
                        {type === 'composed' && '🔄'}
                      </div>
                      <div className="text-xs font-medium capitalize">{type}</div>
                    </button>
                  ))}
                </div>
              )}

              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      チャートタイトル
                    </label>
                    <input
                      type="text"
                      value={newWidgetConfig.title || ''}
                      onChange={(e) => setNewWidgetConfig({ ...newWidgetConfig, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例：品種別成長スコア"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      データソース
                    </label>
                    <select
                      value={newWidgetConfig.dataSource || ''}
                      onChange={(e) => setNewWidgetConfig({ ...newWidgetConfig, dataSource: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">選択してください</option>
                      <option value="teas">品種データ</option>
                      <option value="growth">成長記録</option>
                      <option value="health">健康問題</option>
                      <option value="custom">カスタムデータ</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      自動更新間隔（秒）
                    </label>
                    <input
                      type="number"
                      value={newWidgetConfig.refreshInterval || ''}
                      onChange={(e) => setNewWidgetConfig({ ...newWidgetConfig, refreshInterval: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例：60（1分ごと）"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showGrid"
                      checked={newWidgetConfig.config?.showGrid !== false}
                      onChange={(e) => setNewWidgetConfig({
                        ...newWidgetConfig,
                        config: { ...newWidgetConfig.config, showGrid: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showGrid" className="ml-2 text-sm text-gray-700">
                      グリッドを表示
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showLegend"
                      checked={newWidgetConfig.config?.showLegend !== false}
                      onChange={(e) => setNewWidgetConfig({
                        ...newWidgetConfig,
                        config: { ...newWidgetConfig.config, showLegend: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showLegend" className="ml-2 text-sm text-gray-700">
                      凡例を表示
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                      <ChartBarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    チャートの準備が完了しました
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {newWidgetConfig.title || '新しいチャート'}をダッシュボードに追加します
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="text-sm space-y-2">
                      <div><strong>タイプ:</strong> {newWidgetConfig.type}</div>
                      <div><strong>タイトル:</strong> {newWidgetConfig.title || '未設定'}</div>
                      <div><strong>データソース:</strong> {newWidgetConfig.dataSource || '未設定'}</div>
                      <div><strong>自動更新:</strong> {newWidgetConfig.refreshInterval ? `${newWidgetConfig.refreshInterval}秒` : 'なし'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ウィザードフッター */}
            <div className="flex items-center justify-between">
              <button
                onClick={wizardStep === 0 ? () => setIsWizardOpen(false) : handleWizardPrev}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {wizardStep === 0 ? 'キャンセル' : '前へ'}
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500">
                  {wizardStep + 1} / {wizardSteps.length}
                </div>
                {wizardStep < wizardSteps.length - 1 ? (
                  <button
                    onClick={handleWizardNext}
                    disabled={!newWidgetConfig.type && wizardStep === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ
                  </button>
                ) : (
                  <button
                    onClick={handleWizardComplete}
                    disabled={!newWidgetConfig.type || !newWidgetConfig.title}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    完了
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

InteractiveDashboard.displayName = 'InteractiveDashboard';
