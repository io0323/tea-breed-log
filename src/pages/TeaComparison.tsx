import React, { useState, useMemo, useCallback, memo } from 'react';
import { useTeaVarieties } from '../hooks/useTeaVarieties';
import { TeaVariety } from '../types/teaVariety';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ComparisonItem {
  tea: TeaVariety;
  id: string;
}

interface ComparisonMetrics {
  growthScore: number;
  germinationRate: number;
  diseaseResistance: number;
}

export const TeaComparison = memo(() => {
  const { teaVarieties } = useTeaVarieties();
  const [selectedTeas, setSelectedTeas] = useState<ComparisonItem[]>([]);
  const [availableTeas, setAvailableTeas] = useState<TeaVariety[]>([]);

  // 利用可能な品種リスト（メモ化）
  useMemo(() => {
    const selectedIds = new Set(selectedTeas.map(item => item.tea.id));
    const available = teaVarieties.filter(tea => !selectedIds.has(tea.id));
    setAvailableTeas(available);
  }, [teaVarieties, selectedTeas]);

  // 品種を比較リストに追加（メモ化）
  const handleAddTea = useCallback((tea: TeaVariety) => {
    if (selectedTeas.length >= 4) {
      alert('最大4品種まで比較できます');
      return;
    }

    const newItem: ComparisonItem = {
      tea,
      id: `${tea.id}-${Date.now()}`,
    };

    setSelectedTeas(prev => [...prev, newItem]);
  }, [selectedTeas.length]);

  // 品種を比較リストから削除（メモ化）
  const handleRemoveTea = useCallback((id: string) => {
    setSelectedTeas(prev => prev.filter(item => item.id !== id));
  }, []);

  // 比較メトリクスの計算（メモ化）
  const comparisonMetrics = useMemo((): Record<string, ComparisonMetrics> => {
    const metrics: Record<string, ComparisonMetrics> = {};
    
    selectedTeas.forEach(item => {
      metrics[item.tea.id] = {
        growthScore: item.tea.growthScore,
        germinationRate: item.tea.germinationRate,
        diseaseResistance: item.tea.diseaseResistance,
      };
    });

    return metrics;
  }, [selectedTeas]);

  // 優れている品種の判定（メモ化）
  const bestPerformers = useMemo(() => {
    if (selectedTeas.length === 0) return null;

    const metrics = Object.values(comparisonMetrics);
    const avgGrowthScore = metrics.reduce((sum, m) => sum + m.growthScore, 0) / metrics.length;
    const avgGerminationRate = metrics.reduce((sum, m) => sum + m.germinationRate, 0) / metrics.length;
    const avgDiseaseResistance = metrics.reduce((sum, m) => sum + m.diseaseResistance, 0) / metrics.length;

    return {
      growthScore: selectedTeas.find(item => item.tea.growthScore >= avgGrowthScore),
      germinationRate: selectedTeas.find(item => item.tea.germinationRate >= avgGerminationRate),
      diseaseResistance: selectedTeas.find(item => item.tea.diseaseResistance >= avgDiseaseResistance),
    };
  }, [selectedTeas, comparisonMetrics]);

  // 全クリア（メモ化）
  const handleClearAll = useCallback(() => {
    setSelectedTeas([]);
  }, []);

  if (selectedTeas.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">品種比較</h1>
        
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">品種比較を開始</h2>
            <p className="text-gray-600 mb-6">
              最大4品種まで選択して詳細な比較を行うことができます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teaVarieties.slice(0, 6).map(tea => (
              <div
                key={tea.id}
                onClick={() => handleAddTea(tea)}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-tea-dark hover:bg-tea-light transition-colors"
              >
                <h3 className="font-medium text-gray-900">{tea.name}</h3>
                <p className="text-sm text-gray-500">第{tea.generation}世代 • {tea.location}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span>成長スコア: {tea.growthScore}</span>
                  <span>発芽率: {tea.germinationRate}%</span>
                </div>
              </div>
            ))}
          </div>

          {teaVarieties.length > 6 && (
            <div className="mt-4">
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
                onChange={(e) => {
                  const tea = teaVarieties.find(t => t.id === e.target.value);
                  if (tea) handleAddTea(tea);
                }}
                value=""
              >
                <option value="">他の品種を選択...</option>
                {teaVarieties.slice(6).map(tea => (
                  <option key={tea.id} value={tea.id}>
                    {tea.name} - 第{tea.generation}世代
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">品種比較</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            全クリア
          </button>
          {selectedTeas.length < 4 && availableTeas.length > 0 && (
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
              onChange={(e) => {
                const tea = availableTeas.find(t => t.id === e.target.value);
                if (tea) handleAddTea(tea);
                e.target.value = '';
              }}
              value=""
            >
              <option value="">品種を追加...</option>
              {availableTeas.map(tea => (
                <option key={tea.id} value={tea.id}>
                  {tea.name} - 第{tea.generation}世代
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 比較カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {selectedTeas.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow relative">
            <button
              onClick={() => handleRemoveTea(item.id)}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <XMarkIcon className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.tea.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                第{item.tea.generation}世代 • {item.tea.location}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">成長スコア</span>
                  <span className={`font-medium ${
                    bestPerformers?.growthScore?.id === item.id ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {item.tea.growthScore}
                    {bestPerformers?.growthScore?.id === item.id && ' ⭐'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">発芽率</span>
                  <span className={`font-medium ${
                    bestPerformers?.germinationRate?.id === item.id ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {item.tea.germinationRate}%
                    {bestPerformers?.germinationRate?.id === item.id && ' ⭐'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">耐病性</span>
                  <span className={`font-medium ${
                    bestPerformers?.diseaseResistance?.id === item.id ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {item.tea.diseaseResistance}
                    {bestPerformers?.diseaseResistance?.id === item.id && ' ⭐'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">状態</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.tea.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.tea.status === 'active' ? '栽培中' : '休止中'}
                  </span>
                </div>
              </div>
              
              {item.tea.aroma && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">香り</p>
                  <p className="text-sm text-gray-900">{item.tea.aroma}</p>
                </div>
              )}
              
              {item.tea.note && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">備考</p>
                  <p className="text-sm text-gray-900">{item.tea.note}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 詳細比較テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">詳細比較</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  項目
                </th>
                {selectedTeas.map(item => (
                  <th key={item.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {item.tea.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  成長スコア
                </td>
                {selectedTeas.map(item => (
                  <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span>{item.tea.growthScore}</span>
                      {bestPerformers?.growthScore?.id === item.id && (
                        <span className="ml-2 text-green-600">⭐</span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-tea-dark h-2 rounded-full" 
                        style={{ width: `${(item.tea.growthScore / 5) * 100}%` }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  発芽率
                </td>
                {selectedTeas.map(item => (
                  <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span>{item.tea.germinationRate}%</span>
                      {bestPerformers?.germinationRate?.id === item.id && (
                        <span className="ml-2 text-green-600">⭐</span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${item.tea.germinationRate}%` }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  耐病性
                </td>
                {selectedTeas.map(item => (
                  <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span>{item.tea.diseaseResistance}</span>
                      {bestPerformers?.diseaseResistance?.id === item.id && (
                        <span className="ml-2 text-green-600">⭐</span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(item.tea.diseaseResistance / 5) * 100}%` }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  世代
                </td>
                {selectedTeas.map(item => (
                  <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    第{item.tea.generation}世代
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  場所
                </td>
                {selectedTeas.map(item => (
                  <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tea.location}
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  年度
                </td>
                {selectedTeas.map(item => (
                  <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tea.year}年
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  状態
                </td>
                {selectedTeas.map(item => (
                  <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.tea.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.tea.status === 'active' ? '栽培中' : '休止中'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">⭐ マーク:</span> 各項目で平均値以上の性能を示している品種
        </p>
      </div>
    </div>
  );
});

TeaComparison.displayName = 'TeaComparison';
