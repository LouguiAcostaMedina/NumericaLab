'use client';

import React from 'react';
import { PolynomialSolverResult, IIRFilterStabilityResult } from '../core/domain/types';
import { ComplexUtils } from '../core/math/complexUtils';
import { EducationalNarrator } from '../core/math/educationalNarrator';
import { ExportUtils } from '../core/utils/exportUtils';
import { ComplexZPlaneChart } from './ComplexZPlaneChart';
import { EducationalModePanel } from './EducationalModePanel';
import { EducationalTooltip } from './EducationalTooltip';

interface PolynomialResultsViewProps {
  result: PolynomialSolverResult;
  iirResult?: IIRFilterStabilityResult | null;
}

export const PolynomialResultsView: React.FC<PolynomialResultsViewProps> = ({
  result,
  iirResult,
}) => {
  const narrative = EducationalNarrator.narratePolynomialSolution(result, iirResult);

  const handleExportPDF = () => {
    ExportUtils.exportPolynomialToPDF(result, iirResult);
  };

  const handleExportExcel = () => {
    ExportUtils.exportPolynomialToExcel(result);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner de Estabilidad IIR con badges traducidos */}
      {iirResult && (
        <div
          className={`p-6 rounded-xl border shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            iirResult.stabilityStatus === 'ESTABLE'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : iirResult.stabilityStatus === 'MARGINALMENTE_ESTABLE'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              : 'bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200'
          }`}
        >
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {iirResult.stabilityStatus === 'ESTABLE'
                  ? '✅'
                  : iirResult.stabilityStatus === 'MARGINALMENTE_ESTABLE'
                  ? '⚠️'
                  : '🚫'}
              </span>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Diagnóstico de Estabilidad IIR:
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-white/60 dark:bg-black/40 border border-current">
                  {iirResult.stabilityStatus === 'ESTABLE'
                    ? 'ESTABLE / DENTRO DEL CÍRCULO UNITARIO'
                    : iirResult.stabilityStatus === 'MARGINALMENTE_ESTABLE'
                    ? 'MARGINAL / EN EL BORDE |z| = 1'
                    : 'INESTABLE / FUERA DEL CÍRCULO UNITARIO'}
                </span>
              </h3>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{iirResult.summary}</p>
          </div>

          <div className="flex flex-col items-end text-xs font-mono bg-white/50 dark:bg-black/30 p-3 rounded-lg border border-black/5 self-stretch justify-center">
            <span className="font-bold">Módulo del Polo Máximo:</span>
            <span className="text-base font-extrabold">|z|_max = {iirResult.maxMagnitude.toFixed(4)}</span>
            <span className="text-[10px] opacity-75">Criterio: |z| &lt; 1.0</span>
          </div>
        </div>
      )}

      {/* Botonera de Exportación Versátil (PDF, Excel, CSV) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-bold text-zinc-900 dark:text-white">📄 Generador de Reportes Académicos:</span> Exporta el análisis analítico, la tabla de convergencia y los gráficos.
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <span>📕</span> Exportar Reporte PDF Estructurado
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <span>📊</span> Exportar Datos Crudos Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Panel de Modo Educativo: Narrativa Paso a Paso */}
      <EducationalModePanel narrative={narrative} />

      {/* Delimitación Teórica y Acotación con Tooltips Educativos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Regla de los Signos de Descartes */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>🔀</span>
              <EducationalTooltip
                term="Regla de los Signos de Descartes"
                explanation="Teorema que determina el número máximo de raíces reales positivas y negativas de un polinomio analizando las variaciones de signo de sus coeficientes P(x) y P(-x)."
              />
            </h4>
          </div>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
              <span>Variaciones en P(z):</span>
              <span className="font-bold text-zinc-900 dark:text-white">{result.descartes.signChangesP} cambio(s)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
              <span>Variaciones en P(-z):</span>
              <span className="font-bold text-zinc-900 dark:text-white">{result.descartes.signChangesPNeg} cambio(s)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
              <span>Máx. Raíces Reales Positivas:</span>
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                {result.descartes.maxPositiveRoots} (Posibles: {result.descartes.positiveRootsPossibilities.join(', ')})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
              <span>Máx. Raíces Reales Negativas:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {result.descartes.maxNegativeRoots} (Posibles: {result.descartes.negativeRootsPossibilities.join(', ')})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Mín. Raíces Complejas Esperadas:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {result.descartes.minComplexRoots} raíces / pares conjugados
              </span>
            </div>
          </div>
        </div>

        {/* Cotas de Lagrange y Cauchy */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>📏</span>
              <EducationalTooltip
                term="Cotas de Lagrange & Cauchy"
                explanation="Fórmulas que establecen el radio máximo del círculo en el plano complejo dentro del cual se garantiza que residen absolutamente todas las raíces del polinomio."
              />
            </h4>
          </div>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
              <span>Cota Sup. Lagrange Real (+):</span>
              <span className="font-mono text-zinc-900 dark:text-white">B_+ = {result.lagrange.lagrangeUpperReal}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
              <span>Cota Inf. Lagrange Real (-):</span>
              <span className="font-mono text-zinc-900 dark:text-white">B_- = {result.lagrange.lagrangeLowerReal}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/50">
              <span>Radio Global de Cauchy:</span>
              <span className="font-mono text-purple-600 dark:text-purple-400">R_Cauchy = {result.lagrange.cauchyRadius}</span>
            </div>
            <div className="flex justify-between py-1 bg-purple-500/10 p-2 rounded">
              <span className="font-bold">Región Confinada (|z| ≤ B):</span>
              <span className="font-mono font-extrabold text-purple-700 dark:text-purple-300">
                B = {result.lagrange.globalBound}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Interactivo de Plano Z Complejo (Fase 3) */}
      <ComplexZPlaneChart
        roots={result.roots}
        lagrange={result.lagrange}
        isIIRMode={!!iirResult}
        filterName={iirResult?.filterName}
      />

      {/* Tabla General de Raíces Polinómicas por Müller & Deflación */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              Raíces Complejas Halladas
              <EducationalTooltip
                term="Método de Müller"
                explanation="Método iterativo que ajusta una parábola cuadrática a través de 3 puntos para encontrar raíces tanto reales como complejas, utilizando deflación sintética de Horner para hallar las n raíces."
              />
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Grado n = {result.degree} | Polinomio: <code className="font-mono">{result.polynomialString}</code>
            </p>
          </div>
          <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded text-zinc-600 dark:text-zinc-300">
            {result.executionTimeMs} ms
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase font-mono font-bold">
              <tr>
                <th className="px-4 py-3">Índice</th>
                <th className="px-4 py-3">Raíz Hallada z_k (Forma Rectangular)</th>
                <th className="px-4 py-3">Módulo de la Raíz (|z_k|)</th>
                <th className="px-4 py-3">Iteraciones</th>
                <th className="px-4 py-3">Error Relativo Final %</th>
                <th className="px-4 py-3">Diagnóstico Círculo Unitario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
              {result.roots.map((r) => {
                const finalError = r.iterations.length > 0 ? r.iterations[r.iterations.length - 1].error : 0;
                const isInsideCircle = r.magnitude < 1.0;

                return (
                  <tr key={r.rootIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">z_{r.rootIndex}</td>
                    <td className="px-4 py-3 font-bold text-cyan-600 dark:text-cyan-400">
                      {ComplexUtils.format(r.root, 6)}
                    </td>
                    <td className="px-4 py-3 font-semibold">{r.magnitude}</td>
                    <td className="px-4 py-3">{r.iterations.length} pass(es)</td>
                    <td className="px-4 py-3 text-blue-600 dark:text-blue-400">
                      {finalError !== null ? `${finalError.toFixed(6)}%` : '0.000000%'}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          isInsideCircle
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                        }`}
                      >
                        {isInsideCircle ? 'ESTABLE (|z| < 1)' : 'INESTABLE (|z| ≥ 1)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
