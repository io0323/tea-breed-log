import React, { useState, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTeaVarieties } from '../hooks/useTeaVarieties';
import { TeaFilters } from './filters/TeaFilters';
import { TeaVariety } from '../types/teaVariety';

interface TeaListProps {
  className?: string;
}

const TeaCard = memo(({ tea }: { tea: TeaVariety }) => {
  const handleCardClick = useCallback(() => {
    // カードクリック時の処理（必要に応じて実装）
  }, []);

  return (
    <Link 
      to={`/teas/${tea.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{tea.name}</h3>
          <p className="text-sm text-gray-500">第{tea.generation}世代</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          tea.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {tea.status === 'active' ? '栽培中' : '休止中'}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">場所:</span>
          <span className="font-medium">{tea.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">年度:</span>
          <span className="font-medium">{tea.year}年</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">発芽率:</span>
          <span className="font-medium">{tea.germinationRate}%</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 line-clamp-2">{tea.aroma}</p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-4 text-xs text-gray-500">
          <span>成長: {'⭐'.repeat(tea.growthScore)}</span>
          <span>耐病: {'🛡️'.repeat(tea.diseaseResistance)}</span>
        </div>
      </div>
    </Link>
  );
});

TeaCard.displayName = 'TeaCard';

export const TeaList = memo(({ className = '' }: TeaListProps) => {
  const { teaVarieties, statistics } = useTeaVarieties();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    generation: '',
    location: '',
    status: '',
    year: '',
    search: '',
  });

  // 検索とフィルタリングをメモ化
  const filteredTeas = useMemo(() => {
    return teaVarieties.filter(tea => {
      // 検索語フィルタ
      const matchesSearch = searchTerm === '' || 
        tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tea.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tea.aroma.toLowerCase().includes(searchTerm.toLowerCase());

      // その他フィルタ
      const matchesGeneration = !filters.generation || tea.generation === filters.generation;
      const matchesLocation = !filters.location || tea.location === filters.location;
      const matchesStatus = !filters.status || tea.status === filters.status;
      const matchesYear = !filters.year || tea.year.toString() === filters.year;

      return matchesSearch && matchesGeneration && matchesLocation && 
             matchesStatus && matchesYear;
    });
  }, [teaVarieties, searchTerm, filters]);

  // 検索ハンドラをメモ化
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // フィルターハンドラをメモ化
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // 年のリストをメモ化
  const years = useMemo(() => {
    return Array.from(new Set(teaVarieties.map(tea => tea.year))).sort((a, b) => b - a);
  }, [teaVarieties]);

  // 統計情報をメモ化
  const displayStatistics = useMemo(() => {
    return {
      total: teaVarieties.length,
      active: teaVarieties.filter(tea => tea.status === 'active').length,
      avgGrowthScore: (teaVarieties.reduce((sum, tea) => sum + tea.growthScore, 0) / teaVarieties.length).toFixed(1),
      avgDiseaseResistance: (teaVarieties.reduce((sum, tea) => sum + tea.diseaseResistance, 0) / teaVarieties.length).toFixed(1),
    };
  }, [teaVarieties]);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">お茶の品種一覧</h1>
            <p className="mt-2 text-gray-600">
              栽培しているお茶の品種を管理・確認できます
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
            >
              📊 ダッシュボード
            </Link>
            <Link
              to="/comparison"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
            >
              ⚖️ 品種比較
            </Link>
            <Link
              to="/teas/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-tea-dark hover:bg-tea-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
            >
            <PlusIcon className="h-5 w-5 mr-2" />
            新規登録
          </Link>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                総品種数
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {statistics.total}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                栽培中
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {displayStatistics.active}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                平均成長評価
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {displayStatistics.avgGrowthScore}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                平均耐病性
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-purple-600">
                {displayStatistics.avgDiseaseResistance}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* 検索とフィルター */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="品種名、場所、香りで検索..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-tea-dark focus:border-tea-dark sm:text-sm"
          />
        </div>
        
        <TeaFilters 
          filters={filters} 
          onFilterChange={handleFiltersChange}
          years={years}
        />
      </div>

      {/* 品種リスト */}
      {filteredTeas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">品種が見つかりません</h3>
            <p className="mt-1 text-sm text-gray-500">
              検索条件やフィルターを変更してみてください
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeas.map((tea) => (
            <TeaCard key={tea.id} tea={tea} />
          ))}
        </div>
      )}
    </div>
  );
});

TeaList.displayName = 'TeaList';
