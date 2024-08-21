// src/RealTimeChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const RealTimeChart = () => {
  const [chartData, setChartData] = useState({
    labels: [], // Time labels
    datasets: [
      {
        label: 'Dummy Data',
        data: [],
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const newData = Math.floor(Math.random() * 100);

      setChartData(prevData => {
        const updatedLabels = [...prevData.labels, now];
        const updatedData = [...prevData.datasets[0].data, newData];

        return {
          labels: updatedLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: updatedData,
            },
          ],
        };
      });
    }, 5000);

    // return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Real-Time Line Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default RealTimeChart;
