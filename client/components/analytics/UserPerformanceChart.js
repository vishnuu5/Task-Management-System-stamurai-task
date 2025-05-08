"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function UserPerformanceChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Sort data by completion rate
    const sortedData = [...data].sort(
      (a, b) => b.completionRate - a.completionRate
    );

    // Limit to top 10 users
    const limitedData = sortedData.slice(0, 10);

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: limitedData.map((item) => item.user.name),
        datasets: [
          {
            label: "Completion Rate (%)",
            data: limitedData.map((item) => item.completionRate),
            backgroundColor: "#3b82f6",
            borderColor: "#2563eb",
            borderWidth: 1,
          },
          {
            label: "Tasks Assigned",
            data: limitedData.map((item) => item.total),
            backgroundColor: "#6b7280",
            borderColor: "#4b5563",
            borderWidth: 1,
          },
          {
            label: "Tasks Completed",
            data: limitedData.map((item) => item.completed),
            backgroundColor: "#10b981",
            borderColor: "#059669",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              callback: function (value) {
                const label = this.getLabelForValue(value);
                return label.length > 10
                  ? label.substring(0, 10) + "..."
                  : label;
              },
            },
          },
          y: {
            beginAtZero: true,
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
                if (label === "Completion Rate (%)") {
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
    <div className="h-96">
      <canvas ref={chartRef} />
    </div>
  );
}
