"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function TaskCompletionChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Completed", "In Progress", "To Do", "Review"],
        datasets: [
          {
            data: [data.completed, data.inProgress, data.todo, data.review],
            backgroundColor: ["#10b981", "#3b82f6", "#6b7280", "#8b5cf6"],
            borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
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

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="h-64">
      <canvas ref={chartRef} />
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Completion Rate:{" "}
          <span className="font-medium">{data.completionRate.toFixed(1)}%</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Total Tasks: <span className="font-medium">{data.total}</span>
        </p>
      </div>
    </div>
  );
}
