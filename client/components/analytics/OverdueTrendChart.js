"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { format } from "date-fns";

// Register Chart.js components
Chart.register(...registerables);

export default function OverdueTrendChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Format dates for display
    const formattedData = data.map((item) => ({
      ...item,
      formattedDate: format(new Date(item.date), "MMM d"),
    }));

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: formattedData.map((item) => item.formattedDate),
        datasets: [
          {
            label: "Overdue Rate (%)",
            data: formattedData.map((item) => item.overdueRate),
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Total Tasks",
            data: formattedData.map((item) => item.total),
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value, index, values) {
                return (
                  value +
                  (this.chart.data.datasets[0].label.includes("%") ? "%" : "")
                );
              },
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const value = context.raw || 0;
                if (label.includes("%")) {
                  return `${label}: ${value.toFixed(1)}%`;
                }
                return `${label}: ${value}`;
              },
            },
          },
        },
      },
    });

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className="h-80">
      <canvas ref={chartRef} />
    </div>
  );
}
