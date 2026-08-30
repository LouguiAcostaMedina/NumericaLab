'use client';

import React, { useState } from 'react';
import { MethodForm } from '../../components/MethodForm';
import { ResultsTable } from '../../components/ResultsTable';
import { ConvergenceChart } from '../../components/ConvergenceChart';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { calculateNewtonRaphson } from '../../core/math/newton';
import { MathParser } from '../../core/math/MathParser';
import { NewtonIteration, MethodResponse } from '../../core/domain/types';

export default function NewtonPage() {
  const [result, setResult] = useState<MethodResponse<NewtonIteration> | null>(null);
  const [derivative, setDerivative] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = (data: {
    expression: string;
    x0?: number;
    tolerance: number;
    maxIterations: number;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    setDerivative(null);

    // Timeout ficticio muy pequeño para simular carga y dar fluidez visual a la UI
    setTimeout(() => {
      try {
        // Obtener derivada simbólica para mostrar al usuario
        const deriv = MathParser.derivative(data.expression, 'x');
        setDerivative(deriv);

        const response = calculateNewtonRaphson(
          data.expression,
          data.x0!,
          data.tolerance,
          data.maxIterations
        );

        if (response.success) {
          setResult(response);
        } else {
          setErrorMessage(response.errorMessage || 'Error desconocido.');
          // Si el cálculo falló a mitad, puede contener algunas iteraciones que queremos mostrar
          if (response.iterations && response.iterations.length > 0) {
            setResult(response);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al ejecutar el algoritmo de Newton-Raphson.');
      } finally {
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/30">
          Método Abierto
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">
          Método de Newton-Raphson
        </h1>
        <p className="text-zinc-650 dark:text-zinc-450 text-sm mt-1 leading-relaxed">
          Método abierto de convergencia rápida que utiliza el valor de la derivada para estimar la siguiente aproximación de la raíz.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <MethodForm
            method="newton"
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
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-900 dark:text-blue-400 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-semibold text-blue-600 dark:text-blue-500 tracking-wider">
                      Raíz Aproximada Encontrada
                    </h4>
                    <p className="text-3xl font-extrabold font-mono text-zinc-950 dark:text-white mt-1">
                      {result.root.toFixed(8)}
                    </p>
                    {derivative && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
                        Derivada calculada: <code className="bg-white dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-950 text-blue-600 dark:text-blue-400">{derivative}</code>
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 bg-white dark:bg-zinc-950/50 p-3.5 rounded-lg border border-blue-100 dark:border-blue-900/20 font-mono">
                    <p><strong>Estado:</strong> {result.success ? 'Convergido' : 'Fallo'}</p>
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
                  type="newton"
                  data={result.iterations}
                />
              )}

              {/* Convergence Chart */}
              {result && result.iterations && (
                <ConvergenceChart
                  methodType="newton"
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
