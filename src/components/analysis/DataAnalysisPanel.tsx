import React, { useState, useCallback, useMemo, memo } from 'react';
import { FunnelIcon, AdjustmentsHorizontalIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// フィルター条件の型定義
export interface FilterCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  label: string;
}

// 分析設定の型定義
export interface AnalysisConfig {
  aggregationType: 'sum' | 'average' | 'count' | 'min' | 'max' | 'median';
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// データ分析結果の型定義
export interface AnalysisResult {
  data: any[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    median: number;
    standardDeviation: number;
  };
  groups?: Record<string, any>;
  insights: string[];
}

// フィルターコンポーネント
const DataFilter = memo(({ 
  filters, 
  onFilterAdd, 
  onFilterRemove, 
  onFilterUpdate,
  availableFields 
}: {
  filters: FilterCondition[];
  onFilterAdd: (filter: FilterCondition) => void;
  onFilterRemove: (filterId: string) => void;
  onFilterUpdate: (filterId: string, updates: Partial<FilterCondition>) => void;
  availableFields: Array<{ value: string; label: string; type: 'string' | 'number' | 'date' }>;
}) => {
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<FilterCondition>>({});

  // フィルター追加
  const handleAddFilter = useCallback(() => {
    if (newFilter.field && newFilter.operator && newFilter.value !== undefined) {
      const filter: FilterCondition = {
        id: Date.now().toString(),
        field: newFilter.field,
        operator: newFilter.operator as FilterCondition['operator'],
        value: newFilter.value,
        label: `${availableFields.find(f => f.value === newFilter.field)?.label || newFilter.field} ${getOperatorLabel(newFilter.operator as FilterCondition['operator'])} ${newFilter.value}`,
      };
      onFilterAdd(filter);
      setNewFilter({});
      setIsAddingFilter(false);
    }
  }, [newFilter, availableFields, onFilterAdd]);

  // オペレーターラベルの取得
  const getOperatorLabel = (operator: FilterCondition['operator']): string => {
    const labels = {
      equals: '＝',
      not_equals: '≠',
      contains: '含む',
      not_contains: '含まない',
      greater_than: '＞',
      less_than: '＜',
      between: '範囲',
      in: 'いずれか',
      not_in: 'いずれか以外',
    };
    return labels[operator];
  };

  // 利用可能なオペレーターの取得
  const getAvailableOperators = (fieldType: string) => {
    const stringOperators = ['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in'];
    const numberOperators = ['equals', 'not_equals', 'greater_than', 'less_than', 'between'];
    const dateOperators = ['equals', 'not_equals', 'greater_than', 'less_than', 'between'];
    
    switch (fieldType) {
      case 'string': return stringOperators;
      case 'number': return numberOperators;
      case 'date': return dateOperators;
      default: return stringOperators;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">データフィルター</h3>
        <button
          onClick={() => setIsAddingFilter(true)}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          <FunnelIcon className="h-4 w-4 mr-1" />
          フィルター追加
        </button>
      </div>

      {/* 既存フィルター */}
      <div className="space-y-2 mb-4">
        {filters.map((filter) => (
          <div key={filter.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-700">{filter.label}</span>
            <button
              onClick={() => onFilterRemove(filter.id)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
        
        {filters.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            フィルターが設定されていません
          </p>
        )}
      </div>

      {/* 新規フィルター追加 */}
      {isAddingFilter && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={newFilter.field || ''}
              onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value, operator: undefined, value: undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">フィールドを選択</option>
              {availableFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>

            {newFilter.field && (
              <select
                value={newFilter.operator || ''}
                onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as FilterCondition['operator'], value: undefined })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">条件を選択</option>
                {getAvailableOperators(
                  availableFields.find(f => f.value === newFilter.field)?.type || 'string'
                ).map((operator) => (
                  <option key={operator} value={operator}>
                    {getOperatorLabel(operator as FilterCondition['operator'])}
                  </option>
                ))}
              </select>
            )}

            {newFilter.field && newFilter.operator && (
              <input
                type={availableFields.find(f => f.value === newFilter.field)?.type === 'number' ? 'number' : 'text'}
                value={newFilter.value || ''}
                onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="値を入力"
              />
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleAddFilter}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setIsAddingFilter(false);
                  setNewFilter({});
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DataFilter.displayName = 'DataFilter';

// 分析設定コンポーネント
const AnalysisConfig = memo(({ 
  config, 
  onConfigUpdate,
  availableFields 
}: {
  config: AnalysisConfig;
  onConfigUpdate: (updates: Partial<AnalysisConfig>) => void;
  availableFields: Array<{ value: string; label: string }>;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
        <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">分析設定</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            集計方法
          </label>
          <select
            value={config.aggregationType}
            onChange={(e) => onConfigUpdate({ aggregationType: e.target.value as AnalysisConfig['aggregationType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sum">合計</option>
            <option value="average">平均</option>
            <option value="count">件数</option>
            <option value="min">最小値</option>
            <option value="max">最大値</option>
            <option value="median">中央値</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            グループ化（オプション）
          </label>
          <select
            value={config.groupBy || ''}
            onChange={(e) => onConfigUpdate({ groupBy: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">グループ化しない</option>
            {availableFields.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            並び替え
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={config.sortBy || ''}
              onChange={(e) => onConfigUpdate({ sortBy: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">並び替えなし</option>
              {availableFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            
            <select
              value={config.sortOrder || 'desc'}
              onChange={(e) => onConfigUpdate({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            表示件数
          </label>
          <input
            type="number"
            value={config.limit || ''}
            onChange={(e) => onConfigUpdate({ limit: parseInt(e.target.value) || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="全件表示"
            min="1"
          />
        </div>
      </div>
    </div>
  );
});

AnalysisConfig.displayName = 'AnalysisConfig';

// 分析結果コンポーネント
const AnalysisResults = memo(({ results }: { results: AnalysisResult | null }) => {
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">分析結果がありません</h3>
        <p className="text-gray-500">フィルターと分析設定を指定して「分析を実行」してください</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
        <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">分析結果</h3>
      </div>

      {/* サマリー統計 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{results.summary.total}</div>
          <div className="text-sm text-blue-800">総件数</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{results.summary.average.toFixed(1)}</div>
          <div className="text-sm text-green-800">平均値</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{results.summary.min}</div>
          <div className="text-sm text-yellow-800">最小値</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{results.summary.max}</div>
          <div className="text-sm text-orange-800">最大値</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{results.summary.median.toFixed(1)}</div>
          <div className="text-sm text-purple-800">中央値</div>
        </div>
        <div className="bg-pink-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">{results.summary.standardDeviation.toFixed(1)}</div>
          <div className="text-sm text-pink-800">標準偏差</div>
        </div>
      </div>

      {/* データテーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(results.data[0] || {}).map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.data.slice(0, 10).map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {results.data.length > 10 && (
          <div className="text-center py-4 text-sm text-gray-500">
            最初の10件を表示（全{results.data.length}件）
          </div>
        )}
      </div>

      {/* インサイト */}
      {results.insights.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">データインサイト</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {results.insights.map((insight, index) => (
              <li key={index}>• {insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

AnalysisResults.displayName = 'AnalysisResults';

// メインコンポーネント
export const DataAnalysisPanel = memo(({ 
  data, 
  availableFields 
}: {
  data: any[];
  availableFields: Array<{ value: string; label: string; type: 'string' | 'number' | 'date' }>;
}) => {
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    aggregationType: 'count',
    sortBy: 'value',
    sortOrder: 'desc',
  });
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // フィルター適用
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return filters.every((filter) => {
        const fieldValue = item[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'equals':
            return fieldValue === filterValue;
          case 'not_equals':
            return fieldValue !== filterValue;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'not_contains':
            return !String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'greater_than':
            return Number(fieldValue) > Number(filterValue);
          case 'less_than':
            return Number(fieldValue) < Number(filterValue);
          case 'between':
            const [min, max] = filterValue.split(',').map(Number);
            return Number(fieldValue) >= min && Number(fieldValue) <= max;
          case 'in':
            return filterValue.split(',').includes(String(fieldValue));
          case 'not_in':
            return !filterValue.split(',').includes(String(fieldValue));
          default:
            return true;
        }
      });
    });
  }, [data, filters]);

  // 分析実行
  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // 模擬的な分析処理
      await new Promise(resolve => setTimeout(resolve, 1000));

      let analyzedData = [...filteredData];
      let summary = {
        total: analyzedData.length,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        standardDeviation: 0,
      };

      // 集計処理
      if (analysisConfig.groupBy) {
        const groups = analyzedData.reduce((acc, item) => {
          const key = item[analysisConfig.groupBy!];
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {} as Record<string, any[]>);

        analyzedData = Object.entries(groups).map(([key, items]) => {
          let value = 0;
          switch (analysisConfig.aggregationType) {
            case 'count':
              value = items.length;
              break;
            case 'sum':
              value = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
              break;
            case 'average':
              value = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0) / items.length;
              break;
            case 'min':
              value = Math.min(...items.map(item => Number(item.value) || 0));
              break;
            case 'max':
              value = Math.max(...items.map(item => Number(item.value) || 0));
              break;
            case 'median':
              const sorted = items.map(item => Number(item.value) || 0).sort((a, b) => a - b);
              const mid = Math.floor(sorted.length / 2);
              value = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
              break;
          }

          return {
            [analysisConfig.groupBy!]: key,
            value,
            count: items.length,
          };
        });

        summary.total = analyzedData.length;
        const values = analyzedData.map(item => Number(item.value) || 0);
        summary.average = values.reduce((sum, val) => sum + val, 0) / values.length;
        summary.min = Math.min(...values);
        summary.max = Math.max(...values);
        summary.median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
      } else {
        // 単純な集計
        const values = analyzedData.map(item => Number(item.value) || 0);
        summary.total = values.length;
        summary.average = values.reduce((sum, val) => sum + val, 0) / values.length;
        summary.min = Math.min(...values);
        summary.max = Math.max(...values);
        summary.median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
        
        const mean = summary.average;
        summary.standardDeviation = Math.sqrt(
          values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
        );

        analyzedData = [{ value: summary[analysisConfig.aggregationType] }];
      }

      // ソート
      if (analysisConfig.sortBy) {
        analyzedData.sort((a, b) => {
          const aVal = a[analysisConfig.sortBy!];
          const bVal = b[analysisConfig.sortBy!];
          return analysisConfig.sortOrder === 'asc' 
            ? aVal - bVal 
            : bVal - aVal;
        });
      }

      // 件数制限
      if (analysisConfig.limit) {
        analyzedData = analyzedData.slice(0, analysisConfig.limit);
      }

      // インサイト生成
      const insights = [];
      if (summary.total > 0) {
        insights.push(`全${summary.total}件のデータを分析しました`);
        if (summary.standardDeviation > summary.average * 0.5) {
          insights.push('データのばらつきが大きいです');
        }
        if (summary.max > summary.average * 2) {
          insights.push('外れ値の可能性がある高い値が存在します');
        }
      }

      setAnalysisResults({
        data: analyzedData,
        summary,
        insights,
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [filteredData, analysisConfig]);

  return (
    <div className="space-y-6">
      {/* フィルターと分析設定 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataFilter
          filters={filters}
          onFilterAdd={(filter) => setFilters(prev => [...prev, filter])}
          onFilterRemove={(filterId) => setFilters(prev => prev.filter(f => f.id !== filterId))}
          onFilterUpdate={(filterId, updates) => setFilters(prev => 
            prev.map(f => f.id === filterId ? { ...f, ...updates } : f)
          )}
          availableFields={availableFields}
        />

        <AnalysisConfig
          config={analysisConfig}
          onConfigUpdate={(updates) => setAnalysisConfig(prev => ({ ...prev, ...updates }))}
          availableFields={availableFields}
        />
      </div>

      {/* 分析実行ボタン */}
      <div className="flex justify-center">
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChartBarIcon className="h-5 w-5 mr-2" />
          {isAnalyzing ? '分析中...' : '分析を実行'}
        </button>
      </div>

      {/* 分析結果 */}
      <AnalysisResults results={analysisResults} />
    </div>
  );
});

DataAnalysisPanel.displayName = 'DataAnalysisPanel';
