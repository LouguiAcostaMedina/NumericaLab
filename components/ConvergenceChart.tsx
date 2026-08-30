'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ChartDataPoint {
  iteration: number;
  error: number;
}

interface ConvergenceChartProps {
  data: { iteration: number; error: number | null }[];
  methodType: 'bisection' | 'newton' | 'false-position' | 'fixed-point' | 'secant';
}

export function ConvergenceChart({ data, methodType }: ConvergenceChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtrar y mapear los puntos válidos (ignorar los que tienen error = null)
  const chartData: ChartDataPoint[] = data
    .filter((d) => d.error !== null && d.error !== undefined)
    .map((d) => ({
      iteration: d.iteration,
      error: d.error!,
    }));

  if (!isMounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm h-80 flex items-center justify-center">
        <div className="w-full h-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center text-zinc-500 text-sm">
        No hay suficientes iteraciones con error calculado para graficar el decaimiento.
      </div>
    );
  }

  // Configuración de colores según el método
  const getColorConfig = () => {
    switch (methodType) {
      case 'bisection':
        return { stroke: '#06b6d4', accent: '#22d3ee' }; // Cyan
      case 'false-position':
        return { stroke: '#0d9488', accent: '#14b8a6' }; // Teal
      case 'newton':
        return { stroke: '#3b82f6', accent: '#60a5fa' }; // Blue
      case 'fixed-point':
        return { stroke: '#8b5cf6', accent: '#a78bfa' }; // Purple
      case 'secant':
        return { stroke: '#6366f1', accent: '#818cf8' }; // Indigo
    }
  };

  const { stroke, accent } = getColorConfig();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span>📉</span> Decaimiento del Error Relativo
        </h4>
        <span className="text-xs text-zinc-500 font-mono">
          Eje Y: Error (%) | Eje X: Iteración
        </span>
      </div>

      <div className="h-72 w-full text-xs font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e4e4e7"
              className="dark:hidden"
            />
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              className="hidden dark:block"
            />
            <XAxis
              dataKey="iteration"
              tickLine={false}
              stroke="#71717a"
              label={{ value: 'Iteración', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              stroke="#71717a"
              tickLine={false}
              tickFormatter={(val) => `${val.toFixed(2)}%`}
              label={{ value: 'Error (%)', angle: -90, position: 'insideLeft', offset: 0 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid rgba(63, 63, 70, 0.5)',
                borderRadius: '8px',
                color: '#f4f4f5',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#a1a1aa' }}
              formatter={(val: any) => [typeof val === 'number' ? `${val.toExponential(4)}%` : `${val}`, 'Error Relativo']}
              labelFormatter={(label) => `Iteración: ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="error"
              name="Error aproximado (εa)"
              stroke={stroke}
              activeDot={{ r: 6, strokeWidth: 0, fill: accent }}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: stroke }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
