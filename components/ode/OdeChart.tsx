'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { OdeCalculationResponse } from '../../core/domain/types';

interface OdeChartProps {
  result: OdeCalculationResponse;
}

export function OdeChart({ result }: OdeChartProps) {
  const { results, curvePointsExact, expressionF, equationMode } = result;

  // Combinar los puntos de todos los métodos y de la curva exacta en una cuadrícula unificada por x
  const chartData = useMemo(() => {
    if (!result.success || !results) return [];

    const map = new Map<
      number,
      {
        x: number;
        exact?: number;
        euler?: number;
        heun?: number;
        rk3?: number;
        rk4?: number;
      }
    >();

    // 1. Curva analítica continua si existe
    if (curvePointsExact && curvePointsExact.length > 0) {
      curvePointsExact.forEach((pt) => {
        const key = Math.round(pt.x * 10000) / 10000;
        const entry = map.get(key) || { x: pt.x };
        entry.exact = pt.y;
        map.set(key, entry);
      });
    }

    // 2. Travesías de cada método numérico
    const methodKeys: Array<'euler' | 'heun' | 'rk3' | 'rk4'> = ['euler', 'heun', 'rk3', 'rk4'];

    methodKeys.forEach((m) => {
      const mRes = results[m];
      if (!mRes || !mRes.steps) return;

      mRes.steps.forEach((step) => {
        const key = Math.round(step.x * 10000) / 10000;
        const entry = map.get(key) || { x: step.x };
        entry[m] = step.y;
        if (step.exactValue !== undefined && entry.exact === undefined) {
          entry.exact = step.exactValue;
        }
        map.set(key, entry);

        // Si es el último paso, registrar también x_{next} y y_{next}
        if (step.step === mRes.steps.length - 1) {
          const nextX = Math.round((step.x + step.h) * 10000) / 10000;
          const nextEntry = map.get(nextX) || { x: step.x + step.h };
          nextEntry[m] = step.yNext;
          map.set(nextX, nextEntry);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.x - b.x);
  }, [result.success, results, curvePointsExact]);

  if (!result.success || chartData.length === 0) {
    return null;
  }

  const hasEuler = !!results.euler;
  const hasHeun = !!results.heun;
  const hasRk3 = !!results.rk3;
  const hasRk4 = !!results.rk4;
  const hasExact = !!curvePointsExact && curvePointsExact.length > 0;

  return (
    <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h4 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">📈</span>
            <span>Trayectorias de Solución del PVI</span>
          </h4>
          <p className="text-xs text-foreground-muted mt-0.5">
            {equationMode === 'differential'
              ? `Ecuación: M dx + N dy = 0 ⟹ y' = ${expressionF}`
              : `Ecuación: y' = ${expressionF}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {hasExact && (
            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="w-3 h-0.5 bg-emerald-500 rounded"></span>
              <span>Exacta y(x)</span>
            </span>
          )}
          {hasEuler && (
            <span className="inline-flex items-center gap-1 text-blue-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Euler</span>
            </span>
          )}
          {hasHeun && (
            <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Heun</span>
            </span>
          )}
          {hasRk3 && (
            <span className="inline-flex items-center gap-1 text-purple-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>RK3</span>
            </span>
          )}
          {hasRk4 && (
            <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>RK4</span>
            </span>
          )}
        </div>
      </div>

      <div className="h-84 sm:h-96 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 25, bottom: 25, left: 15 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="currentColor" />
            <XAxis
              dataKey="x"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(v) => Number(v).toFixed(2)}
              stroke="currentColor"
              className="text-[11px] text-foreground-muted"
              label={{
                value: 'Variable x',
                position: 'insideBottom',
                offset: -12,
                className: 'fill-foreground-muted text-[11px] font-semibold',
              }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(v) => Number(v).toFixed(3)}
              stroke="currentColor"
              className="text-[11px] text-foreground-muted"
              label={{
                value: 'y(x)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                className: 'fill-foreground-muted text-[11px] font-semibold',
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const xVal = typeof label === 'number' ? label : payload[0]?.payload?.x;
                return (
                  <div className="bg-surface/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl text-xs font-mono space-y-1.5 min-w-[200px]">
                    <div className="font-bold text-foreground border-b border-border/50 pb-1 flex justify-between">
                      <span>Punto x:</span>
                      <span className="text-primary">{Number(xVal).toFixed(4)}</span>
                    </div>
                    {payload.map((entry, idx) => {
                      if (entry.value === undefined || entry.value === null) return null;
                      const valNum = Number(entry.value);
                      let labelName = entry.name;
                      let color = entry.color;
                      if (entry.dataKey === 'exact') {
                        labelName = 'Sol. Exacta:';
                        color = '#10b981';
                      } else if (entry.dataKey === 'euler') {
                        labelName = 'Euler (O(h)):';
                        color = '#3b82f6';
                      } else if (entry.dataKey === 'heun') {
                        labelName = 'Heun (O(h²)):';
                        color = '#f59e0b';
                      } else if (entry.dataKey === 'rk3') {
                        labelName = 'RK3 (O(h³)):';
                        color = '#8b5cf6';
                      } else if (entry.dataKey === 'rk4') {
                        labelName = 'RK4 (O(h⁴)):';
                        color = '#f43f5e';
                      }
                      return (
                        <div key={idx} className="flex justify-between items-center gap-2">
                          <span style={{ color }} className="font-semibold">
                            {labelName}
                          </span>
                          <span className="text-foreground font-bold">{valNum.toFixed(7)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                if (value === 'exact') return <span className="text-emerald-500 font-semibold text-xs">Exacta y(x)</span>;
                if (value === 'euler') return <span className="text-blue-500 font-semibold text-xs">Euler</span>;
                if (value === 'heun') return <span className="text-amber-500 font-semibold text-xs">Heun</span>;
                if (value === 'rk3') return <span className="text-purple-500 font-semibold text-xs">RK3</span>;
                if (value === 'rk4') return <span className="text-rose-500 font-semibold text-xs">RK4</span>;
                return <span className="text-xs text-foreground">{value}</span>;
              }}
            />

            {/* Curva continua analítica */}
            {hasExact && (
              <Line
                type="monotone"
                dataKey="exact"
                name="exact"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Líneas discretas de los métodos con marcadores */}
            {hasEuler && (
              <Line
                type="linear"
                dataKey="euler"
                name="euler"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 1.5 }}
                isAnimationActive={false}
              />
            )}

            {hasHeun && (
              <Line
                type="linear"
                dataKey="heun"
                name="heun"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
                isAnimationActive={false}
              />
            )}

            {hasRk3 && (
              <Line
                type="linear"
                dataKey="rk3"
                name="rk3"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 1.5 }}
                isAnimationActive={false}
              />
            )}

            {hasRk4 && (
              <Line
                type="linear"
                dataKey="rk4"
                name="rk4"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 1.5 }}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
