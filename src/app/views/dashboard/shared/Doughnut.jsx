import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import ReactEcharts from "echarts-for-react";
import { useDispatch, useSelector } from 'react-redux';

export default function DoughnutChart({ height = '100%', color = [], onClickSection }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);

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
        const response = await fetch('http://localhost:3000/policy/user/count', {
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
          const approvedCount = data.approved;
          const rejectedCount = data.rejected;
          const pendingCount = data.pending;
          const waitingForActionCount = data.waitingForAction;
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

  const getSeriesData = () => {
    const data = [
      { value: approvedCount, name: "Approved" },
      { value: rejectedCount, name: "Rejected" },
      { value: pendingCount, name: "Pending" },
      { value: waitingForActionCount, name: "Waiting for Action" },
    ];
  
    return data.map((item, index) => ({
      ...item,
      itemStyle: {
        // Keep the original color but apply shadow and pop-out effect for the selected section
        color: colors[index],
        shadowBlur: item.name === selectedSection ? 15 : 0, // Pop-out effect with shadow for the selected section
        shadowOffsetX: 0,
        shadowColor: item.name === selectedSection ? "rgba(0, 0, 0, 0.8)" : "none", // Shadow only for the selected
        opacity: selectedSection && item.name !== selectedSection ? 0.6 : 1,  // Blur (reduce opacity) for unselected sections
      },
      // Add radius changes for the pop-out effect
      selected: item.name === selectedSection,  // Mark the section as selected
      selectedOffset: item.name === selectedSection ? 10 : 0,  // Pop out the selected section
    }));
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
        name: "Dashboard",
        type: "pie",
        radius: ["40%", "72.55%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: false,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          normal: {
            show: true,
            position: 'center',
            textStyle: { color: theme.palette.text.secondary, fontSize: 14, fontFamily: "roboto" },
            formatter: selectedSection ? `{b} \n{c} (${selectedSection})` : "Dashboard",
          },
          emphasis: {
            show: true,
            position: 'inside',
            formatter: "{b} \n{c} ({d}%)", // Show section details inside the slice when clicked
            textStyle: { fontSize: "14", fontWeight: "bold", color: 'black' },
          },
        },
        labelLine: { normal: { show: false } },
        data: getSeriesData(),
        itemStyle: {
          color: function (params) {
            return colors[params.dataIndex];
          },
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  };

  const onChartClick = (params) => {
    if (params && params.data && params.data.name) {
      setSelectedSection(params.data.name);
      const clickedSection = params.data.name;
      onClickSection(clickedSection);
    }
    const selectedData = option.series[0].data.find(item => item.name === params.data.name);

    if (selectedData) {
      option.series[0].label.normal = {
        show: true,
        position: 'center',
        formatter: "Dashboard",
        textStyle: { fontSize: 14, fontWeight: 'bold', color: theme.palette.text.secondary }
      };

      option.series[0].label.emphasis = {
        show: true,
        position: 'inside',  // Keep the info inside the section when clicked (same as hover position)
        formatter: "{b} \n{c} ({d}%)", // Show section's details on click (name, value, and percentage)
        textStyle: { fontSize: "14", fontWeight: "bold", color: 'black' }
      };

      // Ensure that emphasis remains on the clicked section (highlighting and shadow)
      selectedData.selected = true;
    }
    option.series[0].data = getSeriesData();
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
