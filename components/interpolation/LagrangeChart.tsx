import React from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { LagrangeResult } from '../../core/domain/types';

interface LagrangeChartProps {
  result: LagrangeResult;
}

export function LagrangeChart({ result }: LagrangeChartProps) {
  if (!result.success) return null;

  // Preparar datos para Recharts
  // Necesitamos un arreglo unificado para X, pero como tenemos una curva continua
  // y puntos discretos, podemos trazar la curva como linea y los puntos como scatter.

  // Formato para ComposedChart:
  // [{ x: val, curva: yVal, nodo: yVal (solo si es nodo), evaluado: yVal (solo si es evaluado) }]
  
  const dataMap = new Map<number, any>();

  // 1. Agregar puntos de la curva
  result.curvePoints.forEach(p => {
    dataMap.set(p.x, { x: p.x, curva: p.y });
  });

  // 2. Agregar nodos (si no están exactamente en las muestras, se insertan)
  result.points.forEach(p => {
    const existing = dataMap.get(p.x) || { x: p.x };
    existing.curva = p.y; // asegurar continuidad
    existing.nodo = p.y;
    dataMap.set(p.x, existing);
  });

  // 3. Agregar punto evaluado
  if (result.evaluationPoint !== undefined && result.interpolatedValue !== undefined) {
    const xEval = result.evaluationPoint;
    const existing = dataMap.get(xEval) || { x: xEval };
    existing.curva = result.interpolatedValue;
    existing.evaluado = result.interpolatedValue;
    dataMap.set(xEval, existing);
  }

  // Ordenar por x
  const chartData = Array.from(dataMap.values()).sort((a, b) => a.x - b.x);

  return (
    <div className="bg-surface rounded-xl p-5 border border-border h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['auto', 'auto']}
            name="X"
            tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
            tickFormatter={(val) => val.toFixed(1)}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
            itemStyle={{ color: 'var(--color-foreground)' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => Number(value).toFixed(4)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(label: any) => `x = ${Number(label).toFixed(4)}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', opacity: 0.9 }} />
          
          <Line 
            type="monotone" 
            dataKey="curva" 
            name={`P${result.points.length - 1}(x)`} 
            stroke="#0ea5e9" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
          
          <Scatter 
            dataKey="nodo" 
            name="Nodos Experimentales" 
            fill="#f59e0b" 
            line={false}
            shape="circle"
          />

          {result.evaluationPoint !== undefined && (
            <Scatter 
              dataKey="evaluado" 
              name={`Evaluación x=${result.evaluationPoint}`} 
              fill="#ef4444" 
              line={false}
              shape="star"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
