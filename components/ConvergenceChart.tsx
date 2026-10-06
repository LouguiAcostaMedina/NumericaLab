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
    <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4 animate-fade-in relative z-10">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <h4 className="text-md font-bold text-foreground flex items-center gap-2 tracking-tight">
          <span className="p-1.5 bg-surface-secondary rounded-md shadow-inner text-sm">📉</span>
          <span>Decaimiento del Error Relativo</span>
        </h4>
        <span className="text-xs text-foreground-muted font-mono bg-surface-secondary px-2 py-1 rounded border border-border/50">
          Eje Y: Error (%) | Eje X: Iteración
        </span>
      </div>

      <div className="h-72 w-full text-xs font-mono mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--border)"
              vertical={false}
              opacity={0.6}
            />
            <XAxis
              dataKey="iteration"
              tickLine={false}
              axisLine={false}
              stroke="var(--foreground-muted)"
              tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
              tickMargin={10}
            />
            <YAxis
              stroke="var(--foreground-muted)"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val.toPrecision(2)}%`}
              tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(18, 22, 30, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                padding: '12px 16px',
              }}
              itemStyle={{ fontWeight: '600', fontFamily: 'var(--font-mono)' }}
              labelStyle={{ fontWeight: 'bold', color: 'var(--foreground-muted)', marginBottom: '8px' }}
              formatter={(val: any) => [
                <span key="val" className="font-mono text-primary ml-2">{typeof val === 'number' ? `${val.toExponential(4)}%` : `${val}`}</span>, 
                'Error Relativo'
              ]}
              labelFormatter={(label) => `Iteración ${label}`}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend 
              verticalAlign="top" 
              height={40}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: 'var(--foreground-muted)', fontWeight: 500 }}
            />
            <Line
              type="monotone"
              dataKey="error"
              name="Error aproximado (εa)"
              stroke={stroke}
              activeDot={{ r: 7, strokeWidth: 2, stroke: 'var(--background)', fill: accent }}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)', fill: stroke }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
