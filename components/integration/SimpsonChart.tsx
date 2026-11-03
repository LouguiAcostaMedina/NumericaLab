'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SimpsonMethodResponse } from '../../core/domain/types';

interface SimpsonChartProps {
  result: SimpsonMethodResponse;
}

export function SimpsonChart({ result }: SimpsonChartProps) {
  const { curvePoints = [], nodes = [], units, methodType } = result;
  const variableLabel = result.variableName || 't';
  const unitY = units?.rateUnit ? ` (${units.rateUnit})` : '';
  const unitX = units?.variableUnit ? ` (${units.variableUnit})` : '';

  // Preparar datos unificados ordenados para ComposedChart
  const chartData = useMemo(() => {
    if (!result.success || !nodes || nodes.length === 0) {
      return [];
    }
    const dataMap = new Map<
      number,
      {
        x: number;
        curvaReal?: number;
        nodoValor?: number;
        esNodo?: boolean;
        coeficiente?: number;
      }
    >();

    // 1. Añadir puntos continuos de la función analítica
    curvePoints.forEach((p) => {
      const key = Math.round(p.x * 10000) / 10000;
      dataMap.set(key, {
        x: p.x,
        curvaReal: p.y,
      });
    });

    // 2. Añadir nodos evaluados
    nodes.forEach((node) => {
      const key = Math.round(node.t * 10000) / 10000;
      const existing = dataMap.get(key) || { x: node.t };
      existing.curvaReal = node.ft;
      existing.nodoValor = node.ft;
      existing.esNodo = true;
      existing.coeficiente = node.coefficient;
      dataMap.set(key, existing);
    });

    return Array.from(dataMap.values()).sort((a, b) => a.x - b.x);
  }, [curvePoints, nodes, result.success]);

  if (!result.success || chartData.length === 0) {
    return null;
  }

  const methodName =
    methodType === 'simpson13' ? 'Simpson 1/3 Compuesto' : 'Simpson 3/8 Compuesto';

  return (
    <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h4 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">📈</span>
            <span>Representación Gráfica ({methodName})</span>
          </h4>
          <p className="text-xs text-foreground-muted mt-0.5">
            Curva de la función integrada f({variableLabel}) y nodos discretos con sus factores ponderados
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <span className="w-3 h-0.5 bg-primary rounded-full"></span>
            <span>f({variableLabel})</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-accent font-semibold">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            <span>Nodos ({nodes.length})</span>
          </span>
        </div>
      </div>

      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <defs>
              <linearGradient id="simpsonAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-border/40"
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(val) => Number(val).toFixed(2).replace(/\.?0+$/, '')}
              stroke="currentColor"
              className="text-foreground-muted text-[11px]"
              label={{
                value: `${variableLabel}${unitX}`,
                position: 'insideBottom',
                offset: -12,
                className: 'fill-foreground-muted text-xs font-medium',
              }}
            />
            <YAxis
              type="number"
              stroke="currentColor"
              className="text-foreground-muted text-[11px]"
              domain={['auto', 'auto']}
              label={{
                value: `f(${variableLabel})${unitY}`,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                className: 'fill-foreground-muted text-xs font-medium',
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-44">
                    <p className="font-bold text-foreground border-b border-border/40 pb-1 flex items-center justify-between">
                      <span>{variableLabel} = {Number(d.x).toFixed(4).replace(/\.?0+$/, '')} {units?.variableUnit || ''}</span>
                      {d.esNodo && (
                        <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[10px] font-mono">
                          Coef: {d.coeficiente}
                        </span>
                      )}
                    </p>
                    <p className="text-foreground-muted font-mono flex items-center justify-between">
                      <span>f({variableLabel}):</span>
                      <span className="font-bold text-foreground">
                        {d.curvaReal !== undefined ? d.curvaReal.toFixed(6) : '—'} {units?.rateUnit || ''}
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

            {/* Área bajo la curva */}
            <Area
              name="Área de Integración"
              type="monotone"
              dataKey="curvaReal"
              fill="url(#simpsonAreaGradient)"
              stroke="none"
              isAnimationActive={false}
            />

            {/* Curva continua real f(t) */}
            <Line
              name={`Función f(${variableLabel})`}
              type="monotone"
              dataKey="curvaReal"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />

            {/* Puntos destacados de los nodos */}
            <Scatter
              name="Nodos Ponderados"
              dataKey="nodoValor"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={1.5}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
