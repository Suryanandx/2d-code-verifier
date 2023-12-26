// CustomBarChart.jsx
import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const CustomBarChart = ({ data, labels, backgroundColors, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.chartInstance;
      ctx.data.labels = labels;
      ctx.data.datasets[0].data = data;
      ctx.data.datasets[0].backgroundColor = backgroundColors;
      ctx.update();
    }
  }, [data, labels, backgroundColors]);

  return <Bar data={{ labels, datasets: [{ data, backgroundColor: backgroundColors }] }} ref={chartRef} options={options} />;
};

export default CustomBarChart;