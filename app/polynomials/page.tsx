'use client';

import React, { useState, useEffect } from 'react';
import { PolynomialForm } from '../../components/PolynomialForm';
import { PolynomialResultsView } from '../../components/PolynomialResultsView';
import { PolynomialSolver } from '../../core/math/polynomialSolver';
import { IIRFilterAnalyzer } from '../../core/math/iirFilter';
import { HistoryStorage } from '../../core/utils/historyStorage';
import { PolynomialSolverResult, IIRFilterStabilityResult } from '../../core/domain/types';
import { ENGINEERING_PRESETS } from '../../core/domain/presetsData';

export default function PolynomialsPage() {
  const [result, setResult] = useState<PolynomialSolverResult | null>(null);
  const [iirResult, setIirResult] = useState<IIRFilterStabilityResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ejecutar el preset por defecto de Análisis de Estabilidad de Filtro IIR al cargar
  useEffect(() => {
    const mainIIRPreset = ENGINEERING_PRESETS[0];
    handleSolveString(
      mainIIRPreset.expression,
      mainIIRPreset.params.tolerance,
      mainIIRPreset.params.maxIterations,
      mainIIRPreset.params.decimals || 6,
      { x0: mainIIRPreset.params.x0!, x1: mainIIRPreset.params.x1!, x2: mainIIRPreset.params.x2! }
    );
  }, []);

  const handleSolveString = (
    polyStr: string,
    tolerance: number,
    maxIter: number,
    decimals: number = 6,
    seeds?: { x0: number; x1: number; x2: number }
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const solverRes = PolynomialSolver.solveFromString(polyStr, tolerance, maxIter, decimals);
      if (!solverRes.success) {
        setErrorMessage(solverRes.errorMessage || 'No se pudo resolver el polinomio.');
        setResult(null);
        setIirResult(null);
      } else {
        setResult(solverRes);

        const filterRes = IIRFilterAnalyzer.analyzeStability(
          solverRes.coefficients,
          `Filtro Caracterizado P(z) = 0`,
          tolerance
        );
        setIirResult(filterRes);

        // Guardar en el historial de localStorage
        const rootSummary = solverRes.roots.map((r) => `${r.root.re} + ${r.root.im}i`).join(', ');
        HistoryStorage.addEntry({
          methodId: 'polynomials',
          methodName: 'Método de Müller (Polinomios)',
          expression: polyStr,
          params: {
            tolerance,
            maxIterations: maxIter,
            decimals,
            x0: seeds?.x0,
            x1: seeds?.x1,
            x2: seeds?.x2,
          },
          rootSummary: rootSummary.length > 40 ? rootSummary.substring(0, 37) + '...' : rootSummary,
          iterationsCount: solverRes.roots[0]?.iterations.length,
          success: true,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado durante el procesamiento.');
      setResult(null);
      setIirResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Encabezado del Módulo */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-cyan-950 text-white rounded-2xl p-8 md:p-10 shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-9xl font-extrabold select-none p-4 font-mono">
          P(z)=0
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-cyan-500/30">
            Fase 2: Las 3 Cajitas, Defaults e Historial Persistente
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Raíces de Polinomios & Método de Müller
          </h1>
          <p className="text-zinc-300 text-base leading-relaxed">
            Plataforma avanzada para la obtención de raíces reales y complejas mediante la parábola de Müller con deflación sintética de Horner. Incluye las 3 cajitas de semillas iniciales, el preset de Análisis de Estabilidad de Filtros IIR e historial persistente.
          </p>
        </div>
      </div>

      {/* Formulario de Configuración y Presets */}
      <PolynomialForm onSolveString={handleSolveString} isLoading={isLoading} />

      {/* Mensaje de Error si aplica */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Resultados Visuales y Exportables */}
      {result && <PolynomialResultsView result={result} iirResult={iirResult} />}
    </div>
  );
}
