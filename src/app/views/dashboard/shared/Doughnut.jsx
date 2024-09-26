import { useTheme } from "@mui/material/styles";
import ReactEcharts from "echarts-for-react";

export default function DoughnutChart({ height = '100%', color = [] }) {
  const theme = useTheme();

  const colors = ["#02ad2d", "#ff0303", "#fffb03", "#ff6303"];

  const option = {
    legend: {
      show: true,
      itemGap: 20,
      icon: "circle",
      bottom: 20,
      textStyle: { color: theme.palette.text.secondary, fontSize: 13, fontFamily: "roboto" },
      formatter: function (name) {
        return name.split(' ').join('\n'); // Splitting to two lines if needed
      }
    },
    tooltip: { show: false, trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },
    xAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],
    yAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],
    series: [
      {
        name: "Policy Dashboard",
        type: "pie",
        radius: ["40%", "72.55%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: false,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          normal: {
            show: false,
            position: 'center',
            textStyle: { color: theme.palette.text.secondary, fontSize: 13, fontFamily: "roboto" },
            formatter: "{a}"
          },
          emphasis: {
            show: true,
            textStyle: { fontSize: "14", fontWeight: "bold", color: 'black' },
            position: 'inside',
            formatter: "{b} \n{c} ({d}%)"
          }
        },
        labelLine: { normal: { show: false } },
        data: [
          { value: 7, name: "Approved" },
          { value: 1, name: "Rejected" },
          { value: 4, name: "Approval pending" },
          { value: 2, name: "Review raised" }
        ],
        itemStyle: {
          color: function (params) {
            return colors[params.dataIndex];
          },
          emphasis: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" }
        }
      }
    ]
  };

  return <ReactEcharts style={{ height: height, width: "100%" }} option={{ ...option }} />;
}
