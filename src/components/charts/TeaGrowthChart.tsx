import ReactECharts from "echarts-for-react";
import { TeaVariety } from "../../types/teaVariety";
import { memo, useMemo } from "react";

interface TeaGrowthChartProps {
  teas: TeaVariety[];
}

export const TeaGrowthChart = memo(({ teas }: TeaGrowthChartProps) => {
  // チャートオプションをメモ化
  const chartOption = useMemo(() => {
    if (teas.length === 0) {
      return null;
    }

    return {
      title: {
        text: "品種別 生育スコア比較",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
        max: 5,
      },
      yAxis: {
        type: "category",
        data: teas.map((tea) => tea.name),
        axisLabel: {
          rotate: 0,
          fontSize: 12,
        },
      },
      series: [
        {
          name: "生育スコア",
          type: "bar",
          data: teas.map((tea) => tea.growthScore),
          itemStyle: {
            color: "#059669",
          },
          label: {
            show: true,
            position: "right",
            formatter: "{c}",
          },
        },
      ],
    };
  }, [teas]);

  if (!chartOption) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <p className="text-center text-gray-500">表示するデータがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <ReactECharts 
        option={chartOption} 
        style={{ height: '400px', width: "100%" }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
});

TeaGrowthChart.displayName = 'TeaGrowthChart';
