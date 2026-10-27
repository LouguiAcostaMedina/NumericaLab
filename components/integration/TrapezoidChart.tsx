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
import { TrapezoidMethodResponse } from '../../core/domain/types';

interface TrapezoidChartProps {
  result: TrapezoidMethodResponse;
}

export function TrapezoidChart({ result }: TrapezoidChartProps) {
  const { curvePoints = [], nodes = [], units } = result;
  const variableLabel = result.variableName || 't';
  const unitY = units?.rateUnit ? ` (${units.rateUnit})` : '';
  const unitX = units?.variableUnit ? ` (${units.variableUnit})` : '';

  // Preparar datos unificados ordenados para ComposedChart
  // Unimos los puntos continuos de la curva f(t) y los nodos del trapecio
  const chartData = useMemo(() => {
    if (!result.success || !nodes || nodes.length === 0) {
      return [];
    }
    const dataMap = new Map<number, {
      x: number;
      curvaReal?: number;
      trapecioPoligono?: number;
      nodoValor?: number;
      esNodo?: boolean;
    }>();

    // 1. Añadir puntos continuos de la función analítica
    curvePoints.forEach((p) => {
      const key = Math.round(p.x * 10000) / 10000;
      dataMap.set(key, {
        x: p.x,
        curvaReal: p.y,
      });
    });

    // 2. Añadir nodos del trapecio (aseguran la línea poligonal recta del trapecio)
    nodes.forEach((node) => {
      const key = Math.round(node.t * 10000) / 10000;
      const existing = dataMap.get(key) || { x: node.t };
      existing.curvaReal = node.ft;
      existing.trapecioPoligono = node.ft;
      existing.nodoValor = node.ft;
      existing.esNodo = true;
      dataMap.set(key, existing);
    });

    // 3. Interpolar linealmente el trapecioPoligono para los puntos intermedios entre nodos
    const sorted = Array.from(dataMap.values()).sort((a, b) => a.x - b.x);

    for (let i = 0; i < sorted.length; i++) {
      const pt = sorted[i];
      if (pt.trapecioPoligono === undefined) {
        // Encontrar el nodo previo y siguiente
        let prevNode = null;
        let nextNode = null;

        for (let j = 0; j < nodes.length - 1; j++) {
          if (pt.x >= nodes[j].t && pt.x <= nodes[j + 1].t) {
            prevNode = nodes[j];
            nextNode = nodes[j + 1];
            break;
          }
        }

        if (prevNode && nextNode) {
          const ratio = (pt.x - prevNode.t) / (nextNode.t - prevNode.t);
          pt.trapecioPoligono = prevNode.ft + ratio * (nextNode.ft - prevNode.ft);
        }
      }
    }

    return sorted;
  }, [curvePoints, nodes, result.success]);

  if (!result.success || chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h4 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">📈</span>
            <span>Representación Gráfica del Trapecio Compuesto</span>
          </h4>
          <p className="text-xs text-foreground-muted mt-0.5">
            Aproximación poligonal por segmentos rectilíneos secantes y suma de áreas trapezoidales
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-foreground-muted">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent"></span>
          <span>Curva Continua</span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span>
          <span>Nodos t_i</span>
        </div>
      </div>

      <div className="h-[360px] w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 25, bottom: 20, left: 15 }}
          >
            <defs>
              <linearGradient id="trapezoidFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
              tickFormatter={(val) => val.toFixed(1)}
              unit={unitX}
              stroke="var(--border)"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
              tickFormatter={(val) => val.toFixed(1)}
              unit={unitY}
              stroke="var(--border)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(18, 22, 30, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                padding: '10px 14px',
              }}
              labelStyle={{ fontWeight: 'bold', color: 'var(--foreground-muted)', marginBottom: '6px' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                if (value === undefined || value === null) return ['-', name];
                const formatted = Number(value).toFixed(6);
                if (name === 'Área Trapecios (Aproximación)') {
                  return [`${formatted} ${units?.rateUnit || ''}`, 'Aproximación Lineal'];
                }
                if (name === 'Curva Real R(t)') {
                  return [`${formatted} ${units?.rateUnit || ''}`, `f(${variableLabel})`];
                }
                if (name === 'Nodos Experimentales') {
                  return [`${formatted} ${units?.rateUnit || ''}`, `Nodo evaluado`];
                }
                return [formatted, name];
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => `${variableLabel} = ${Number(label).toFixed(4)} ${units?.variableUnit || ''}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', opacity: 0.9 }}
            />

            {/* Área bajo la aproximación de los trapecios */}
            <Area
              type="linear"
              dataKey="trapecioPoligono"
              name="Área Trapecios (Aproximación)"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#trapezoidFill)"
              isAnimationActive={false}
            />

            {/* Curva continua de la función analítica */}
            <Line
              type="monotone"
              dataKey="curvaReal"
              name={`Curva Real R(${variableLabel})`}
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />

            {/* Nodos discretos del trapecio */}
            <Scatter
              dataKey="nodoValor"
              name="Nodos Experimentales"
              fill="#f59e0b"
              shape="circle"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
