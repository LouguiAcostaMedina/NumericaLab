'use client';

import React, { useState } from 'react';
import { LinearSystemInput } from '../../../components/linear-systems/LinearSystemInput';
import { DoolittleResultsView } from '../../../components/linear-systems/methods/DoolittleResultsView';
import { validateSquareSystem } from '../../../core/math/linear-systems/validation';
import { solveDoolittle, solveWithLU } from '../../../core/math/linear-systems/doolittle';
import { Matrix, Vector, DoolittleResult } from '../../../core/domain/types';

export default function DoolittlePage() {
  const [result, setResult] = useState<DoolittleResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSolve = (A: Matrix, B: Vector, size: number) => {
    setValidationError(null);
    setResult(null);
    setIsProcessing(true);

    // Pequeño timeout para permitir que React actualice el UI (loading state)
    setTimeout(() => {
      const validation = validateSquareSystem(A, B);
      if (!validation.isValid) {
        setValidationError(validation.message || 'Error de validación del sistema.');
        setIsProcessing(false);
        return;
      }

      const calcResult = solveDoolittle(A, B);
      setResult(calcResult);
      setIsProcessing(false);
    }, 100);
  };

  const handleSolveNewB = (newB: Vector) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      if (!result || !result.success || !result.factorization) {
        setIsProcessing(false);
        return;
      }

      // Validar dimensiones de nuevo B
      if (newB.length !== result.originalA.length) {
        setValidationError(`El nuevo vector B debe tener longitud ${result.originalA.length}`);
        setIsProcessing(false);
        return;
      }

      // Reutilizar L y U para resolver
      const newSolution = solveWithLU(
        result.factorization.L, 
        result.factorization.U, 
        newB, 
        result.originalA
      );

      setResult({
        ...result,
        originalB: newB,
        solution: newSolution
      });
      setIsProcessing(false);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-zinc-900 to-blue-950 text-white rounded-2xl p-8 shadow-xl border border-blue-900/30 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-9xl font-extrabold select-none p-4">
          LU
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">
            Sistemas de Ecuaciones Lineales
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Factorización LU (Doolittle)
          </h1>
          <p className="text-zinc-300 text-lg leading-relaxed max-w-2xl">
            Resuelve el sistema <code className="bg-black/30 px-1.5 py-0.5 rounded text-blue-200 font-mono">AX = B</code> factorizando la matriz <code className="bg-black/30 px-1.5 py-0.5 rounded text-blue-200 font-mono">A</code> en el producto de una matriz triangular inferior <code className="bg-black/30 px-1.5 py-0.5 rounded text-blue-200 font-mono">L</code> y una matriz triangular superior <code className="bg-black/30 px-1.5 py-0.5 rounded text-blue-200 font-mono">U</code>.
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
            title="Configuración del Sistema Lineal"
          />
        </div>
      </div>

      {result && (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Procedimiento de Resolución</h2>
          <DoolittleResultsView result={result} onSolveNewB={handleSolveNewB} />
        </div>
      )}
    </div>
  );
}
