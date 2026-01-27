import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeaVarieties } from '../hooks/useTeaVarieties';
import { useNotifications } from '../hooks/useNotifications';
import { AdvancedChart } from './charts/AdvancedChart';
import { ChartBarIcon, PlusCircleIcon, EyeIcon, ChartPieIcon } from '@heroicons/react/24/outline';

const TeaList = () => {
  const navigate = useNavigate();
  const { teas, loading } = useTeaVarieties();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeas, setSelectedTeas] = useState<string[]>([]);

  // フィルタリングされた品種
  const filteredTeas = useMemo(() => {
    if (!searchQuery) return teas;
    
    const query = searchQuery.toLowerCase();
    return teas.filter(tea => 
      tea.name.toLowerCase().includes(query) ||
      tea.location.toLowerCase().includes(query) ||
      tea.generation.toLowerCase().includes(query) ||
      tea.aroma.toLowerCase().includes(query)
    );
  }, [teas, searchQuery]);

  // 統計データ
  const statistics = useMemo(() => {
    const total = teas.length;
    const active = teas.filter(t => t.status === 'active').length;
    const avgGrowthScore = total > 0 ? teas.reduce((sum, tea) => sum + tea.growthScore, 0) / total : 0;
    const avgGerminationRate = total > 0 ? teas.reduce((sum, tea) => sum + tea.germinationRate, 0) / total : 0;

    return { total, active, avgGrowthScore, avgGerminationRate };
  }, [teas]);

  // チャートデータ
  const chartData = useMemo(() => {
    const locationData = teas.reduce((acc, tea) => {
      acc[tea.location] = (acc[tea.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationData).map(([location, count]) => ({
      name: location,
      value: count,
    }));
  }, [teas]);

  // 品種選択
  const handleTeaSelect = useCallback((teaId: string) => {
    setSelectedTeas(prev => 
      prev.includes(teaId) 
        ? prev.filter(id => id !== teaId)
        : [...prev, teaId]
    );
  }, []);

  // 詳細ページへ移動
  const handleViewDetails = useCallback((teaId: string) => {
    navigate(`/teas/${teaId}`);
  }, [navigate]);

  // 比較ページへ移動
  const handleCompare = useCallback(() => {
    if (selectedTeas.length >= 2) {
      navigate(`/comparison?teas=${selectedTeas.join(',')}`);
    } else {
      addNotification({
        type: 'warning',
        title: '比較対象が不足しています',
        message: '比較するには2つ以上の品種を選択してください',
        priority: 'medium',
      });
    }
  }, [selectedTeas, navigate, addNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">お茶の品種一覧</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                ダッシュボード
              </button>
              
              <button
                onClick={() => navigate('/data-visualization')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
              >
                <ChartPieIcon className="h-4 w-4 mr-2" />
                データ可視化
              </button>
              
              <button
                onClick={() => navigate('/teas/new')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                新規登録
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">総品種数</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <PlusCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">栽培中</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <ChartPieIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">平均成長スコア</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.avgGrowthScore.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">平均発芽率</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.avgGerminationRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 検索とフィルター */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="品種名、場所、世代、香りで検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="ml-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedTeas.length}件選択中
              </span>
              
              {selectedTeas.length >= 2 && (
                <button
                  onClick={handleCompare}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  比較する
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 品種リスト */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  品種一覧 ({filteredTeas.length}件)
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredTeas.map((tea) => (
                  <div key={tea.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedTeas.includes(tea.id)}
                          onChange={() => handleTeaSelect(tea.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{tea.name}</h3>
                          <p className="text-sm text-gray-500">
                            {tea.location} - 第{tea.generation}世代 ({tea.year}年)
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>成長スコア: {tea.growthScore}</span>
                            <span>発芽率: {tea.germinationRate}%</span>
                            <span>耐病性: {tea.diseaseResistance}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tea.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tea.status === 'active' ? '栽培中' : '休止中'}
                        </span>
                        
                        <button
                          onClick={() => handleViewDetails(tea.id)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          詳細
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredTeas.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">品種が見つかりません</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* チャート */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">場所別品種数</h3>
              <AdvancedChart
                data={{ data: chartData }}
                config={{
                  type: 'pie',
                  pieRadius: 80,
                  showDataLabels: true,
                  showLegend: true,
                  showTooltip: true,
                  animationDuration: 1000,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeaList;
