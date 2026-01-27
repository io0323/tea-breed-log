import React, { useState, useMemo, useCallback, memo } from 'react';
import { useTeaVarieties } from '../hooks/useTeaVarieties';
import { useGrowthRecords } from '../hooks/useGrowthRecords';
import { useHealthIssues } from '../hooks/useHealthIssues';
import { TeaGrowthChart } from '../components/charts/TeaGrowthChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalTeas: number;
  activeTeas: number;
  averageGrowthScore: number;
  totalGrowthRecords: number;
  totalHealthIssues: number;
  averageGerminationRate: number;
}

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

export const Dashboard = memo(() => {
  const { teaVarieties } = useTeaVarieties();
  const { records } = useGrowthRecords();
  const { issues } = useHealthIssues();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30days' | '90days' | '1year'>('all');

  // 統計データの計算（メモ化）
  const stats = useMemo((): DashboardStats => {
    const activeTeas = teaVarieties.filter(tea => tea.status === 'active');
    const averageGrowthScore = teaVarieties.reduce((sum, tea) => sum + tea.growthScore, 0) / teaVarieties.length || 0;
    const averageGerminationRate = teaVarieties.reduce((sum, tea) => sum + tea.germinationRate, 0) / teaVarieties.length || 0;

    return {
      totalTeas: teaVarieties.length,
      activeTeas: activeTeas.length,
      averageGrowthScore: Math.round(averageGrowthScore * 10) / 10,
      totalGrowthRecords: records.length,
      totalHealthIssues: issues.length,
      averageGerminationRate: Math.round(averageGerminationRate * 10) / 10,
    };
  }, [teaVarieties, records, issues]);

  // 場所別データ（メモ化）
  const locationData = useMemo(() => {
    const locationCount = teaVarieties.reduce((acc, tea) => {
      acc[tea.location] = (acc[tea.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCount).map(([location, count]) => ({
      location,
      count,
    }));
  }, [teaVarieties]);

  // 世代別データ（メモ化）
  const generationData = useMemo(() => {
    const generationCount = teaVarieties.reduce((acc, tea) => {
      acc[tea.generation] = (acc[tea.generation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(generationCount).map(([generation, count]) => ({
      generation,
      count,
    }));
  }, [teaVarieties]);

  // 成長スコア分布（メモ化）
  const growthScoreDistribution = useMemo(() => {
    const distribution = [0, 0, 0, 0, 0]; // 1-5のスコア
    teaVarieties.forEach(tea => {
      distribution[tea.growthScore - 1]++;
    });

    return distribution.map((count, index) => ({
      score: `${index + 1}点`,
      count,
    }));
  }, [teaVarieties]);

  // 期間フィルターハンドラ（メモ化）
  const handlePeriodChange = useCallback((period: typeof selectedPeriod) => {
    setSelectedPeriod(period);
  }, []);

  // 健康問題タイプ別データ（メモ化）
  const healthIssueTypes = useMemo(() => {
    const typeCount = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      type: type === 'disease' ? '病気' : 
            type === 'pest' ? '害虫' : 
            type === 'nutrition' ? '栄養' : 
            type === 'environmental' ? '環境' : 'その他',
      count,
    }));
  }, [issues]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">データ分析ダッシュボード</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.target.value as typeof selectedPeriod)}
          className="rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
        >
          <option value="all">全期間</option>
          <option value="30days">過去30日</option>
          <option value="90days">過去90日</option>
          <option value="1year">過去1年</option>
        </select>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">総品種数</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTeas}</p>
          <p className="text-sm text-green-600">うち {stats.activeTeas} 件が栽培中</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">平均成長スコア</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.averageGrowthScore}</p>
          <p className="text-sm text-gray-500">5点満点中</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">平均発芽率</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.averageGerminationRate}%</p>
          <p className="text-sm text-gray-500">全品種平均</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">成長記録</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalGrowthRecords}</p>
          <p className="text-sm text-gray-500">総記録数</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">健康問題</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalHealthIssues}</p>
          <p className="text-sm text-gray-500">総問題数</p>
        </div>
      </div>

      {/* チャートエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 場所別分布 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">場所別品種分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ location, percent }) => `${location} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 世代別分布 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">世代別分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="generation" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 成長スコア分布 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">成長スコア分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthScoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 健康問題タイプ */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">健康問題タイプ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={healthIssueTypes}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
              >
                {healthIssueTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 成長スコア比較 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">品種別成長スコア比較</h3>
        <TeaGrowthChart teas={teaVarieties} />
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
