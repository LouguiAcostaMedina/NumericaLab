'use client';

import React, { useState } from 'react';
import { LinearSystemInput } from '../../../components/linear-systems/LinearSystemInput';
import { IterativeResultsView } from '../../../components/linear-systems/methods/IterativeResultsView';
import { validateSquareSystem } from '../../../core/math/linear-systems/validation';
import { solveJacobi } from '../../../core/math/linear-systems/iterative';
import { Matrix, Vector, IterativeResult } from '../../../core/domain/types';

export default function JacobiPage() {
  const [result, setResult] = useState<IterativeResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSolve = (
    A: Matrix, 
    B: Vector, 
    size: number, 
    x0?: Vector, 
    tolerance?: number, 
    maxIterations?: number
  ) => {
    setValidationError(null);
    setResult(null);
    setIsProcessing(true);

    setTimeout(() => {
      const validation = validateSquareSystem(A, B);
      if (!validation.isValid) {
        setValidationError(validation.message || 'Error de validación del sistema.');
        setIsProcessing(false);
        return;
      }

      const config = {
        initialVector: x0 || new Array(size).fill(0),
        tolerance: tolerance || 1e-4,
        maxIterations: maxIterations || 100
      };

      const calcResult = solveJacobi(A, B, config);
      setResult(calcResult);
      setIsProcessing(false);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-zinc-900 to-indigo-950 text-white rounded-2xl p-8 shadow-xl border border-indigo-900/30 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-9xl font-extrabold select-none p-4 tracking-tighter">
          JA
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
            Sistemas Iterativos
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Método de Jacobi
          </h1>
          <p className="text-zinc-300 text-lg leading-relaxed max-w-2xl">
            Aproxima la solución de un sistema lineal evaluando todas las componentes de la iteración <code className="bg-black/30 px-1.5 py-0.5 rounded text-indigo-200 font-mono">k+1</code> utilizando estrictamente los valores de la iteración anterior <code className="bg-black/30 px-1.5 py-0.5 rounded text-indigo-200 font-mono">k</code>. Convergencia garantizada si la matriz es estrictamente diagonal dominante.
          </p>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-900 dark:text-red-200 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <span className="font-bold">Error de Validación:</span> {validationError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <LinearSystemInput 
            onSubmit={handleSolve} 
            isLoading={isProcessing}
            title="Configuración del Método de Jacobi"
            isIterative={true}
          />
        </div>
      </div>

      {result && (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Resultados del Análisis</h2>
          <IterativeResultsView result={result} />
        </div>
      )}
    </div>
  );
}
