"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { format } from "date-fns";

// Register Chart.js components
Chart.register(...registerables);

export default function TaskCreationTrendChart({ data }) {
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
      type: "bar",
      data: {
        labels: formattedData.map((item) => item.formattedDate),
        datasets: [
          {
            label: "Tasks Created",
            data: formattedData.map((item) => item.count),
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
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
              precision: 0,
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
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
