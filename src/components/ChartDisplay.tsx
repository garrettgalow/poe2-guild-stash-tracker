import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { ChartData } from '../lib/types';

interface ChartDisplayProps {
  data: ChartData;
  type: 'bar' | 'line' | 'pie';
  title: string;
}

export function ChartDisplay({ data, type, title }: ChartDisplayProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, title]);

  return <canvas ref={chartRef} />;
}
