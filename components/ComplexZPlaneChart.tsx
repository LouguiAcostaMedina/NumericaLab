'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PolynomialRoot, LagrangeBoundResult, MullerIteration } from '../core/domain/types';
import { ComplexUtils } from '../core/math/complexUtils';
import { PrecisionUtils } from '../core/math/precisionUtils';

interface ComplexZPlaneChartProps {
  roots: PolynomialRoot[];
  lagrange: LagrangeBoundResult;
  isIIRMode?: boolean;
  filterName?: string;
}

export const ComplexZPlaneChart: React.FC<ComplexZPlaneChartProps> = ({
  roots,
  lagrange,
  isIIRMode = false,
  filterName,
}) => {
  const [activeTab, setActiveTab] = useState<'zplane' | 'convergence' | 'table'>('zplane');
  const [selectedRootIndex, setSelectedRootIndex] = useState<number>(1);

  // Estados para la Línea de Tiempo Iterativa (Time-Travel Slider & Media Controls)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeedMs, setPlaySpeedMs] = useState<number>(800);

  // Raíz seleccionada para visualización detallada
  const selectedRoot = roots.find((r) => r.rootIndex === selectedRootIndex) || roots[0];
  const maxSteps = selectedRoot?.iterations.length || 1;

  // Reset de la línea de tiempo al cambiar la raíz elegida
  useEffect(() => {
    setCurrentStepIndex(maxSteps);
    setIsPlaying(false);
  }, [selectedRootIndex, maxSteps]);

  // Motor de Reproducción Automática de la Línea de Tiempo (Play/Pause)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return maxSteps;
          }
          return prev + 1;
        });
      }, playSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps, playSpeedMs]);

  if (!selectedRoot) return null;

  // Iteraciones visibles hasta la posición del slider (Línea de tiempo)
  const visibleIterations: MullerIteration[] = selectedRoot.iterations.slice(0, currentStepIndex);
  const currentIter: MullerIteration | undefined = visibleIterations[visibleIterations.length - 1];

  // Cálculo dinámico del límite de los ejes Re e Im en el plano SVG
  const allPointsMags = [
    1.2,
    lagrange.globalBound || 1.2,
    ...roots.map((r) => r.magnitude),
    ...selectedRoot.iterations.flatMap((it) => [
      ComplexUtils.abs(it.z0),
      ComplexUtils.abs(it.z1),
      ComplexUtils.abs(it.z2),
      ComplexUtils.abs(it.z3),
    ]),
  ];
  const maxAxisBound = Math.min(10, Math.max(1.5, ...allPointsMags.filter((m) => !isNaN(m) && isFinite(m))));

  // Verificar si la iteración actual dio un "Salto al Plano Complejo" (Im(z) != 0 partiendo de semillas reales)
  const isComplexJump = currentIter && Math.abs(currentIter.z3.im) > 1e-6;

  // Datos para la curva de convergencia (Iteración vs Error Ea %)
  const convergenceData = selectedRoot.iterations.map((it) => ({
    iteration: it.iteration,
    error: it.error !== null ? Number(it.error.toFixed(6)) : 0,
    residuomagnitude: Number(ComplexUtils.abs(it.fz3).toExponential(3)),
    z3Formatted: PrecisionUtils.formatComplex(it.z3, 4),
  }));

  // Handlers para controles multimedia
  const handleFirstStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(1);
  };
  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(1, prev - 1));
  };
  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(maxSteps, prev + 1));
  };
  const handleLastStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(maxSteps);
  };
  const handleTogglePlay = () => {
    if (currentStepIndex >= maxSteps) {
      setCurrentStepIndex(1);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Encabezado y Selector de Pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>🎯</span>
            {isIIRMode ? `Diagrama Z: ${filterName || 'Filtro Digital IIR'}` : 'Motor de Visualización en Plano Complejo Z'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Plano Z interactivo con Círculo Unitario ($|z|=1$), Cota de Lagrange ($B={lagrange.globalBound}$) y trazado paso a paso.
          </p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('zplane')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'zplane'
                ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            ⭕ Plano Complejo Z
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('convergence')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'convergence'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            📈 Convergencia ($E_a$)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'table'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            📋 Tabla Iteraciones
          </button>
        </div>
      </div>

      {/* Selector de Raíz Activa para Análisis Iterativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
        <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <span>🔍</span> Raíz Polinómica en Inspección:
        </span>

        <div className="flex items-center gap-2">
          <select
            value={selectedRootIndex}
            onChange={(e) => setSelectedRootIndex(Number(e.target.value))}
            className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-1 text-zinc-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            {roots.map((r) => (
              <option key={r.rootIndex} value={r.rootIndex}>
                Raíz z_{r.rootIndex} = {PrecisionUtils.formatComplex(r.root, 4)} (|z| = {r.magnitude})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VISTA 1: Plano Complejo Z Interactivo con SVG + Timeline Slider */}
      {activeTab === 'zplane' && (
        <div className="space-y-5">
          {/* Alerta de Salto al Plano Complejo */}
          {isComplexJump && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 animate-pulse">
              <span>✨</span>
              <span>
                <strong>Salto al Plano Complejo Detectado:</strong> En la iteración {currentStepIndex}, el algoritmo de Müller generó un discriminante complejo D = √(b² - 4ac), abandonando el eje real hacia z = {PrecisionUtils.formatComplex(currentIter.z3, 4)}.
              </span>
            </div>
          )}

          {/* Lienzo SVG Interactivo del Plano Z */}
          <div className="relative w-full h-[420px] bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-zinc-800 shadow-inner">
            <svg viewBox="-120 -120 240 240" className="w-full h-full">
              {/* Rejilla Polar de Referencia */}
              <circle cx="0" cy="0" r="100" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2,2" />
              <circle cx="0" cy="0" r="75" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2,2" />
              <circle cx="0" cy="0" r="50" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2,2" />
              <circle cx="0" cy="0" r="25" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* 1. Círculo Unitario |z| = 1 (CRÍTICO PARA INGENIERÍA IIR) */}
              <circle
                cx="0"
                cy="0"
                r={(1.0 / maxAxisBound) * 100}
                fill="rgba(16, 185, 129, 0.06)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray={isIIRMode ? 'none' : '4,4'}
              />
              <text
                x={(1.0 / maxAxisBound) * 100 + 3}
                y="-3"
                fill="#10b981"
                fontSize="5.5"
                fontWeight="bold"
              >
                |z| = 1.0 (Región de Estabilidad IIR)
              </text>

              {/* 2. Disco de Cota de Lagrange |z| <= B */}
              {lagrange.globalBound > 0 && lagrange.globalBound !== 1 && (
                <>
                  <circle
                    cx="0"
                    cy="0"
                    r={Math.min(100, (lagrange.globalBound / maxAxisBound) * 100)}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <text
                    x="3"
                    y={-Math.min(95, (lagrange.globalBound / maxAxisBound) * 100) - 2}
                    fill="#c084fc"
                    fontSize="5"
                  >
                    Cota Lagrange B = {lagrange.globalBound}
                  </text>
                </>
              )}

              {/* Ejes Cartesianos Re(z) e Im(z) */}
              <line x1="-110" y1="0" x2="110" y2="0" stroke="#52525b" strokeWidth="1" />
              <line x1="0" y1="-110" x2="0" y2="110" stroke="#52525b" strokeWidth="1" />

              <text x="98" y="-4" fill="#a1a1aa" fontSize="6" fontWeight="bold">Re(z)</text>
              <text x="4" y="-98" fill="#a1a1aa" fontSize="6" fontWeight="bold">Im(z)</text>

              {/* 3. Trazado de Trayectoria Iterativa en el Plano Complejo */}
              {visibleIterations.length > 0 && (
                <polyline
                  points={visibleIterations
                    .map((it) => `${(it.z3.re / maxAxisBound) * 100},${-(it.z3.im / maxAxisBound) * 100}`)
                    .join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                  opacity="0.8"
                />
              )}

              {/* Puntos Intermedios de Iteración */}
              {visibleIterations.map((it, idx) => {
                const cx = (it.z3.re / maxAxisBound) * 100;
                const cy = -(it.z3.im / maxAxisBound) * 100;
                const isCurrent = idx === visibleIterations.length - 1;

                return (
                  <g key={it.iteration} className="group cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isCurrent ? '5' : '3'}
                      fill={isCurrent ? '#38bdf8' : '#3b82f6'}
                      stroke={isCurrent ? '#ffffff' : '#1e3a8a'}
                      strokeWidth={isCurrent ? '1.5' : '0.5'}
                      className={isCurrent ? 'animate-bounce' : ''}
                    />

                    {/* Tooltip Nativo en SVG al hacer Hover sobre el Punto */}
                    <title>
                      {`Iteración ${it.iteration}: z = ${PrecisionUtils.formatComplex(it.z3, 4)}\n|z| = ${ComplexUtils.abs(it.z3).toFixed(4)}\n|f(z)| = ${ComplexUtils.abs(it.fz3).toExponential(3)}\nError = ${it.error !== null ? it.error.toFixed(6) + '%' : 'N/A'}`}
                    </title>
                  </g>
                );
              })}

              {/* Raíces Finales Encontradas (Todas las raíces del polinomio) */}
              {roots.map((r) => {
                const cx = (r.root.re / maxAxisBound) * 100;
                const cy = -(r.root.im / maxAxisBound) * 100;
                const isStableColor = r.magnitude < 1.0 ? '#10b981' : '#ef4444';
                const isSelected = r.rootIndex === selectedRootIndex;

                return (
                  <g key={r.rootIndex} className="cursor-pointer group">
                    <circle cx={cx} cy={cy} r={isSelected ? '7' : '5'} fill={isStableColor} opacity="0.3" />
                    {isIIRMode ? (
                      <>
                        <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke={isStableColor} strokeWidth="2" />
                        <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} stroke={isStableColor} strokeWidth="2" />
                      </>
                    ) : (
                      <circle cx={cx} cy={cy} r="4" fill={isStableColor} stroke="#ffffff" strokeWidth="1.2" />
                    )}

                    <text x={cx + 5} y={cy - 3} fill="#ffffff" fontSize="5.5" fontWeight="bold">
                      z_{r.rootIndex}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 4. LÍNEA DE TIEMPO ITERATIVA (Time-Travel Slider & Controles Multimedia) */}
          <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>⏯️</span> Línea de Tiempo de Iteraciones (Müller Paso a Paso):
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                  Paso {currentStepIndex} de {maxSteps}
                </span>

                {/* Control de Velocidad */}
                <select
                  value={playSpeedMs}
                  onChange={(e) => setPlaySpeedMs(Number(e.target.value))}
                  className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-[11px] rounded px-2 py-0.5 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value={1500}>0.5x (Lento)</option>
                  <option value={800}>1x (Normal)</option>
                  <option value={400}>2x (Rápido)</option>
                </select>
              </div>
            </div>

            {/* Slider / Range Control */}
            <input
              type="range"
              min={1}
              max={maxSteps}
              value={currentStepIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentStepIndex(Number(e.target.value));
              }}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />

            {/* Botonera de Controles Multimedia */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleFirstStep}
                className="px-3 py-1 text-xs rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition-all cursor-pointer"
                title="Ir al inicio (Paso 1)"
              >
                ⏮ Inicio
              </button>

              <button
                type="button"
                onClick={handlePrevStep}
                className="px-3 py-1 text-xs rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition-all cursor-pointer"
                title="Paso Anterior"
              >
                ◀ Anterior
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={`px-5 py-1.5 text-xs font-bold rounded-lg text-white transition-all cursor-pointer shadow-sm ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 ring-2 ring-amber-400/40'
                    : 'bg-cyan-600 hover:bg-cyan-500 ring-2 ring-cyan-500/40'
                }`}
              >
                {isPlaying ? '⏸ Pausa' : '▶ Reproducir Animación'}
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-3 py-1 text-xs rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition-all cursor-pointer"
                title="Paso Siguiente"
              >
                Siguiente ▶
              </button>

              <button
                type="button"
                onClick={handleLastStep}
                className="px-3 py-1 text-xs rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition-all cursor-pointer"
                title="Ir al final"
              >
                Fin ⏭
              </button>
            </div>

            {/* Inspección Numérica del Paso Actual */}
            {currentIter && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono">
                <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Aproximación z₃:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {PrecisionUtils.formatComplex(currentIter.z3, 6)}
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Módulo |z₃|:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {ComplexUtils.abs(currentIter.z3).toFixed(6)}
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Residuo |f(z₃)|:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {ComplexUtils.abs(currentIter.fz3).toExponential(3)}
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Error Relativo Eₐ%:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {currentIter.error !== null ? `${currentIter.error.toFixed(6)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: Gráfico de Convergencia del Error relative Ea % */}
      {activeTab === 'convergence' && (
        <div className="space-y-4">
          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={convergenceData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis
                  dataKey="iteration"
                  stroke="#9ca3af"
                  fontSize={12}
                  label={{ value: 'Número de Iteración (Müller)', position: 'insideBottom', offset: -12, fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  unit="%"
                  label={{ value: 'Error Relativo % (Ea)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Error Relativo (Ea)']}
                  labelFormatter={(label) => `Iteración ${label}`}
                />
                <Legend verticalAlign="top" height={36} />
                <ReferenceLine y={0.0001} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Tolerancia Epsilon', fill: '#10b981', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="error"
                  name={`Error Relativo (%) Raíz z_${selectedRootIndex}`}
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#06b6d4' }}
                  activeDot={{ r: 6, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 p-3 rounded-lg text-xs leading-relaxed">
            💡 <strong>Conclusión Algorítmica:</strong> El Método de Müller muestra convergencia cuadrática/superlineal ($\approx 1.84$). El error relativo $E_a$ decae de forma acelerada alcanzando la tolerancia requerida en solo {selectedRoot.iterations.length} iteraciones.
          </div>
        </div>
      )}

      {/* VISTA 3: Tabla Numérica Compleja de Iteraciones */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <table className="w-full text-xs text-left text-zinc-600 dark:text-zinc-300">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-mono font-bold">
                <tr>
                  <th className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">Iter</th>
                  <th className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">z0</th>
                  <th className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">z1</th>
                  <th className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">z2</th>
                  <th className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">z3 (NUEVA APROX)</th>
                  <th className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">|f(z3)|</th>
                  <th className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">Error (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                {selectedRoot.iterations.map((it) => (
                  <tr key={it.iteration} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-3 py-2 font-bold">{it.iteration}</td>
                    <td className="px-3 py-2">{PrecisionUtils.formatComplex(it.z0, 3)}</td>
                    <td className="px-3 py-2">{PrecisionUtils.formatComplex(it.z1, 3)}</td>
                    <td className="px-3 py-2">{PrecisionUtils.formatComplex(it.z2, 3)}</td>
                    <td className="px-3 py-2 font-semibold text-cyan-600 dark:text-cyan-400">
                      {PrecisionUtils.formatComplex(it.z3, 4)}
                    </td>
                    <td className="px-3 py-2">{ComplexUtils.abs(it.fz3).toExponential(3)}</td>
                    <td className="px-3 py-2 font-bold text-blue-600 dark:text-blue-400">
                      {it.error !== null ? `${it.error.toFixed(6)}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
