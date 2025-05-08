"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function PriorityDistributionChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Map priorities to colors
    const priorityColors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
    };

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map(
          (item) =>
            item.priority.charAt(0).toUpperCase() + item.priority.slice(1)
        ),
        datasets: [
          {
            data: data.map((item) => item.count),
            backgroundColor: data.map((item) => priorityColors[item.priority]),
            borderColor: "#ffffff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
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
    <div className="h-64">
      <canvas ref={chartRef} />
    </div>
  );
}
