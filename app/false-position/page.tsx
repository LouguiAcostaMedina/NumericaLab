'use client';

import React, { useState } from 'react';
import { MethodForm } from '../../components/MethodForm';
import { ResultsTable } from '../../components/ResultsTable';
import { ConvergenceChart } from '../../components/ConvergenceChart';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { calculateFalsePosition } from '../../core/math/falsePosition';
import { FalsePositionIteration, MethodResponse } from '../../core/domain/types';

export default function FalsePositionPage() {
  const [result, setResult] = useState<MethodResponse<FalsePositionIteration> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = (data: {
    expression: string;
    a?: number;
    b?: number;
    tolerance: number;
    maxIterations: number;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    setTimeout(() => {
      try {
        const response = calculateFalsePosition(
          data.expression,
          data.a!,
          data.b!,
          data.tolerance,
          data.maxIterations
        );

        if (response.success) {
          setResult(response);
        } else {
          setErrorMessage(response.errorMessage || 'Error desconocido.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al ejecutar el algoritmo de Falsa Posición.');
      } finally {
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-100 dark:bg-teal-950/40 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-900/30">
          Método Cerrado
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">
          Método de Falsa Posición
        </h1>
        <p className="text-zinc-650 dark:text-zinc-450 text-sm mt-1 leading-relaxed">
          Encuentra la raíz de una función usando una interpolación lineal entre los límites del intervalo donde cambia de signo.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <MethodForm
            method="false-position"
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
              {result && result.success && result.root !== undefined && (
                <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30 text-teal-900 dark:text-teal-400 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-semibold text-teal-600 dark:text-teal-500 tracking-wider">
                      Raíz Aproximada Encontrada
                    </h4>
                    <p className="text-3xl font-extrabold font-mono text-zinc-950 dark:text-white mt-1">
                      {result.root.toFixed(8)}
                    </p>
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 bg-white dark:bg-zinc-950/50 p-3.5 rounded-lg border border-teal-100 dark:border-teal-900/20 font-mono">
                    <p><strong>Iteraciones:</strong> {result.iterations?.length}</p>
                    <p>
                      <strong>Último error:</strong>{' '}
                      {result.iterations && result.iterations.length > 1
                        ? `${result.iterations[result.iterations.length - 1].error?.toFixed(6) ?? '0.000000'}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {result && result.iterations && (
                <ResultsTable
                  type="false-position"
                  data={result.iterations}
                />
              )}

              {/* Convergence Chart */}
              {result && result.iterations && (
                <ConvergenceChart
                  methodType="false-position"
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
