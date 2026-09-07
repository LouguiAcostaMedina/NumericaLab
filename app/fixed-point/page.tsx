'use client';

import React, { useState } from 'react';
import { MethodForm } from '../../components/MethodForm';
import { ResultsTable } from '../../components/ResultsTable';
import { ConvergenceChart } from '../../components/ConvergenceChart';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { calculateFixedPoint } from '../../core/math/fixedPoint';
import { FixedPointIteration, MethodResponse } from '../../core/domain/types';

export default function FixedPointPage() {
  const [result, setResult] = useState<MethodResponse<FixedPointIteration> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = (data: {
    expression: string;
    x0?: number;
    tolerance: number;
    maxIterations: number;
    decimals?: number;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    setTimeout(() => {
      try {
        const response = calculateFixedPoint(
          data.expression,
          data.x0!,
          data.tolerance,
          data.maxIterations,
          data.decimals ?? 6
        );

        if (response.success) {
          setResult(response);
        } else {
          setErrorMessage(response.errorMessage || 'Error desconocido.');
          if (response.iterations && response.iterations.length > 0) {
            setResult(response);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al ejecutar el algoritmo de Punto Fijo.');
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-100 dark:bg-purple-950/40 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900/30">
          Método Abierto
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">
          Método de Punto Fijo
        </h1>
        <p className="text-zinc-650 dark:text-zinc-450 text-sm mt-1 leading-relaxed">
          Encuentra la raíz de una ecuación reescribiéndola como $x = g(x)$ y buscando iterativamente el punto donde la curva intersecta la recta de identidad.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <MethodForm
            method="fixed-point"
            isLoading={isLoading}
            onSubmit={handleCalculate}
          />
        </div>

        {/* Results / Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <SkeletonLoader type="both" />
          ) : (
            <>
              {/* Error Alert */}
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 p-5 rounded-xl flex items-start gap-4">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm">Error en el Cálculo</h5>
                    <p className="text-xs leading-relaxed font-mono">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Success summary card */}
              {result && result.root !== undefined && (
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 text-purple-900 dark:text-purple-400 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-semibold text-purple-600 dark:text-purple-500 tracking-wider">
                      Raíz Aproximada Encontrada
                    </h4>
                    <p className="text-3xl font-extrabold font-mono text-zinc-950 dark:text-white mt-1">
                      {result.root.toFixed(8)}
                    </p>
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 bg-white dark:bg-zinc-950/50 p-3.5 rounded-lg border border-purple-100 dark:border-purple-900/20 font-mono">
                    <p><strong>Estado:</strong> {result.success ? 'Convergido' : 'Fallo/Divergencia'}</p>
                    <p><strong>Iteraciones:</strong> {result.iterations?.length}</p>
                    <p>
                      <strong>Último error:</strong>{' '}
                      {result.iterations && result.iterations.length > 0
                        ? `${result.iterations[result.iterations.length - 1].error?.toFixed(6) ?? '0.000000'}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {result && result.iterations && (
                <ResultsTable
                  type="fixed-point"
                  data={result.iterations}
                />
              )}

              {/* Convergence Chart */}
              {result && result.iterations && (
                <ConvergenceChart
                  methodType="fixed-point"
                  data={result.iterations}
                />
              )}

              {/* Info Card when empty */}
              {!result && !errorMessage && (
                <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                  <span className="text-3xl block mb-2">📊</span>
                  Ingresa los parámetros y haz clic en calcular para ver los resultados e iteraciones.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
