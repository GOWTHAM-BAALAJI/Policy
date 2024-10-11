import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import ReactEcharts from "echarts-for-react";
import { useDispatch, useSelector } from 'react-redux';

export default function DoughnutChart({ height = '100%', color = [], onClickSection }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingForActionCount, setWaitingForActionCount] = useState(0);

  const userToken = useSelector((state)=>{
    return state.token;//.data;
  });
  console.log("UserToken:",userToken);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/policy/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
          },
        });
        console.log(response);
        const data = await response.json();
        console.log("Data:",data);

        if (data && data.status) {
          const approvedCount = data.approved?.length ?? 0;
          const rejectedCount = data.rejected?.length ?? 0;
          const pendingCount = data.pending?.length ?? 0;
          const waitingForActionCount = data.waitingForAction?.length ?? 0;
          setApprovedCount(approvedCount || 0);
          setRejectedCount(rejectedCount || 0);
          setPendingCount(pendingCount || 0);
          setWaitingForActionCount(waitingForActionCount || 0);
          console.log('Approved:', approvedCount);
          console.log('Rejected:', rejectedCount);
          console.log('Pending:', pendingCount);
          console.log('Waiting for Action:', waitingForActionCount);
        }

        // setPsgList(formattedData);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const colors = ["#02ad2d", "#ff0303", "#fffb03", "#ff6303"];

  // Define your navigation function
  const navigateToPage = (name) => {
    if (onClickSection) {
      onClickSection(name); // Pass the clicked section back to Analytics.jsx
    }
  };

  const option = {
    legend: {
      show: true,
      itemGap: 30,
      icon: "circle",
      bottom: 20,
      textStyle: { color: theme.palette.text.secondary, fontSize: 13, fontFamily: "roboto" },
      formatter: function (name) {
        return name.split(' ').join('\n');
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
          { value: approvedCount, name: "Approved" },
          { value: rejectedCount, name: "Rejected" },
          { value: pendingCount, name: "Pending" },
          { value: waitingForActionCount, name: "Waiting for Action" }
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

  const onChartClick = (params) => {
    if (params && params.data && params.data.name) {
      navigateToPage(params.data.name); // Call navigateToPage to update state
    }
  };

  return (
    <ReactEcharts
      style={{ height: height, width: "100%" }}
      option={option}
      onEvents={{
        'click': onChartClick  // Register the click event
      }}
    />
  );
}
