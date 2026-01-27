import React, { useMemo, useCallback, memo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ComposedChart,
} from 'recharts';

// チャートタイプの定義
export type ChartType = 
  | 'line'
  | 'area'
  | 'bar'
  | 'pie'
  | 'scatter'
  | 'radar'
  | 'treemap'
  | 'composed';

// チャートデータの型定義
export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: any;
}

export interface ChartData {
  data: ChartDataPoint[];
  colors?: string[];
}

// チャート設定の型定義
export interface ChartConfig {
  type: ChartType;
  title?: string;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animationDuration?: number;
  colors?: string[];
  xAxis?: {
    dataKey: string;
    label?: string;
    angle?: number;
  };
  yAxis?: {
    label?: string;
    domain?: [number, number];
  };
  dataKeys?: string[];
  stacked?: boolean;
  areaType?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter';
  pieRadius?: number;
  pieInnerRadius?: number;
  showDataLabels?: boolean;
}

// デフォルトカラー設定
const DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
  '#84CC16', // lime-500
];

// カスタムTooltipコンポーネント
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

// カスタムラベルコンポーネント
const CustomLabel = memo(({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
});

CustomLabel.displayName = 'CustomLabel';

// メインチャートコンポーネント
export const AdvancedChart = memo(({ data, config }: { data: ChartData; config: ChartConfig }) => {
  const colors = useMemo(() => config.colors || DEFAULT_COLORS, [config.colors]);

  // 共通のチャートプロパティ
  const commonProps = useMemo(() => ({
    width: config.width,
    height: config.height,
    data: data.data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  }), [config.width, config.height, data.data]);

  // レンダリング関数
  const renderChart = useCallback(() => {
    switch (config.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxis?.dataKey || 'name'} 
              angle={config.xAxis?.angle}
              label={{ value: config.xAxis?.label, position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              label={{ value: config.yAxis?.label, angle: -90, position: 'insideLeft' }}
              domain={config.yAxis?.domain}
            />
            {config.showTooltip !== false && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend !== false && <Legend />}
            {(config.dataKeys || ['value']).map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={config.animationDuration || 1000}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxis?.dataKey || 'name'}
              angle={config.xAxis?.angle}
              label={{ value: config.xAxis?.label, position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              label={{ value: config.yAxis?.label, angle: -90, position: 'insideLeft' }}
              domain={config.yAxis?.domain}
            />
            {config.showTooltip !== false && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend !== false && <Legend />}
            {(config.dataKeys || ['value']).map((key, index) => (
              <Area
                key={key}
                type={config.areaType || 'monotone'}
                dataKey={key}
                stackId={config.stacked ? 'stack' : undefined}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                animationDuration={config.animationDuration || 1000}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxis?.dataKey || 'name'}
              angle={config.xAxis?.angle}
              label={{ value: config.xAxis?.label, position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              label={{ value: config.yAxis?.label, angle: -90, position: 'insideLeft' }}
              domain={config.yAxis?.domain}
            />
            {config.showTooltip !== false && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend !== false && <Legend />}
            {(config.dataKeys || ['value']).map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={config.stacked ? 'stack' : undefined}
                fill={colors[index % colors.length]}
                animationDuration={config.animationDuration || 1000}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={config.showDataLabels ? <CustomLabel /> : false}
              outerRadius={config.pieRadius || 80}
              innerRadius={config.pieInnerRadius}
              fill="#8884d8"
              dataKey="value"
              animationDuration={config.animationDuration || 1000}
            >
              {data.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {config.showTooltip !== false && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend !== false && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxis?.dataKey || 'x'}
              type="number"
              label={{ value: config.xAxis?.label, position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              dataKey={config.yAxis?.dataKey || 'y'}
              type="number"
              label={{ value: config.yAxis?.label, angle: -90, position: 'insideLeft' }}
            />
            {config.showTooltip !== false && <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />}
            {config.showLegend !== false && <Legend />}
            {(config.dataKeys || ['value']).map((key, index) => (
              <Scatter
                key={key}
                name={key}
                data={data.data}
                fill={colors[index % colors.length]}
                animationDuration={config.animationDuration || 1000}
              />
            ))}
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxis?.dataKey || 'name'} />
            <PolarRadiusAxis 
              angle={90} 
              domain={config.yAxis?.domain || [0, 'auto']}
            />
            {config.showTooltip !== false && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend !== false && <Legend />}
            {(config.dataKeys || ['value']).map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                animationDuration={config.animationDuration || 1000}
              />
            ))}
          </RadarChart>
        );

      case 'treemap':
        return (
          <Treemap
            {...commonProps}
            data={data.data}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            animationDuration={config.animationDuration || 1000}
          >
            {data.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Treemap>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={config.xAxis?.dataKey || 'name'}
              angle={config.xAxis?.angle}
              label={{ value: config.xAxis?.label, position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              label={{ value: config.yAxis?.label, angle: -90, position: 'insideLeft' }}
              domain={config.yAxis?.domain}
            />
            {config.showTooltip !== false && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend !== false && <Legend />}
            {/* 動的に線、棒、エリアを組み合わせ */}
            {(config.dataKeys || ['value']).map((key, index) => {
              const chartType = data.data[0]?.[`${key}Type`] || 'line';
              switch (chartType) {
                case 'bar':
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                      animationDuration={config.animationDuration || 1000}
                    />
                  );
                case 'area':
                  return (
                    <Area
                      key={key}
                      type={config.areaType || 'monotone'}
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.6}
                      animationDuration={config.animationDuration || 1000}
                    />
                  );
                default:
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      animationDuration={config.animationDuration || 1000}
                    />
                  );
              }
            })}
          </ComposedChart>
        );

      default:
        return <div>サポートされていないチャートタイプです</div>;
    }
  }, [config, data.data, colors, commonProps]);

  return (
    <div className="w-full">
      {config.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {config.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={config.height || 300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
});

AdvancedChart.displayName = 'AdvancedChart';
