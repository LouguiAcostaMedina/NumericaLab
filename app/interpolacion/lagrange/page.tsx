'use client';

import React, { useState } from 'react';
import { LagrangeInput } from '../../../components/interpolation/LagrangeInput';
import { LagrangeResults } from '../../../components/interpolation/LagrangeResults';
import { LagrangeChart } from '../../../components/interpolation/LagrangeChart';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { calculateLagrange } from '../../../core/math/interpolation/lagrange';
import { LagrangeResult } from '../../../core/domain/types';

export default function LagrangePage() {
  const [result, setResult] = useState<LagrangeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = (points: { x: number; y: number }[], xEval?: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    setTimeout(() => {
      try {
        const response = calculateLagrange(points, xEval);

        if (response.success) {
          setResult(response);
          // Verificar si xEval está dentro del intervalo (extrapolación vs interpolación)
          if (xEval !== undefined) {
            const minX = Math.min(...points.map(p => p.x));
            const maxX = Math.max(...points.map(p => p.x));
            if (xEval < minX || xEval > maxX) {
              // Agregar advertencia de extrapolación en los mensajes, o manejar en UI
            }
          }
        } else {
          setErrorMessage(response.errorMessage || 'Error desconocido.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al ejecutar la interpolación de Lagrange.');
      } finally {
        setIsLoading(false);
      }
    }, 200); // Simulando carga para UX
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Encabezado */}
      <div>
        <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-100 dark:bg-sky-950/40 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-900/30">
          Interpolación
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-3">
          Interpolación de Lagrange
        </h1>
        <p className="text-zinc-650 dark:text-zinc-450 text-sm mt-1 leading-relaxed">
          Construye un polinomio que pasa exactamente por un conjunto de puntos y permite estimar valores intermedios sin necesidad de resolver sistemas de ecuaciones complejas.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Columna de Formulario */}
        <div className="lg:col-span-1">
          <LagrangeInput isLoading={isLoading} onSubmit={handleCalculate} />
        </div>

        {/* Columna de Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <SkeletonLoader type="both" />
          ) : (
            <>
              {/* Alerta de Error */}
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 p-5 rounded-xl flex items-start gap-4 shadow-sm">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm">Error de Validación</h5>
                    <p className="text-xs leading-relaxed font-mono">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Advertencia de extrapolación */}
              {result && result.evaluationPoint !== undefined && (
                (() => {
                  const xEval = result.evaluationPoint;
                  const minX = Math.min(...result.points.map(p => p.x));
                  const maxX = Math.max(...result.points.map(p => p.x));
                  if (xEval < minX || xEval > maxX) {
                    return (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 text-yellow-800 dark:text-yellow-400 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                        <span className="text-xl mt-0.5">💡</span>
                        <p className="text-sm leading-relaxed">
                          <strong>Advertencia:</strong> el punto solicitado (x={xEval}) se encuentra fuera del intervalo de los datos [{minX}, {maxX}]. El resultado corresponde a una extrapolación y puede ser menos confiable.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-800 dark:text-green-400 p-3 rounded-xl flex items-start gap-3 shadow-sm text-sm">
                      <span className="text-lg">✓</span>
                      <p className="leading-relaxed">
                        Interpolación dentro del intervalo de datos [{minX}, {maxX}].
                      </p>
                    </div>
                  );
                })()
              )}

              {/* Gráfica de Interpolación */}
              {result && (
                <LagrangeChart result={result} />
              )}

              {/* Procedimiento Matemático Detallado */}
              {result && (
                <LagrangeResults result={result} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
