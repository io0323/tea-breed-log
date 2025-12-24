import ReactECharts from "echarts-for-react";
import { TeaVariety } from "../../types/teaVariety";

interface TeaGrowthChartProps {
  teas: TeaVariety[];
}

export const TeaGrowthChart = ({ teas }: TeaGrowthChartProps) => {
  const option = {
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
          color: "#2C4A32",
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
        },
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <ReactECharts
        option={option}
        style={{ height: "400px", width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
};
