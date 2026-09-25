'use client';

import React, { useState } from 'react';
import { IterativeResult } from '../../../core/domain/types';

interface IterativeResultsViewProps {
  result: IterativeResult;
}

export function IterativeResultsView({ result }: IterativeResultsViewProps) {
  const [showFormulas, setShowFormulas] = useState(false);
  const n = result.originalA.length;

  const renderConvergenceAnalysis = () => (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-foreground">Análisis de Convergencia</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2 text-primary">1. Dominancia Diagonal Estricta (EDD)</h4>
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-secondary text-xs uppercase text-foreground-muted border-b border-border">
                <tr>
                  <th className="px-4 py-2">Fila</th>
                  <th className="px-4 py-2">|a_ii|</th>
                  <th className="px-4 py-2">Σ|a_ij| (j≠i)</th>
                  <th className="px-4 py-2">¿Cumple?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.convergenceAnalysis.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-2 font-medium">Fila {row.row + 1}</td>
                    <td className="px-4 py-2 font-mono">{row.diagonalValue}</td>
                    <td className="px-4 py-2 font-mono">{row.offDiagonalSum}</td>
                    <td className="px-4 py-2">
                      {row.satisfies ? (
                        <span className="text-green-500 font-bold">✓ Sí</span>
                      ) : (
                        <span className="text-red-500 font-bold">✗ No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`mt-2 text-sm font-medium ${result.convergenceAnalysis.convergenceGuaranteedByEDD ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {result.convergenceAnalysis.message}
          </p>
        </div>

        {result.sassenfeldAnalysis && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-sm mb-2 text-primary">2. Criterio de Sassenfeld</h4>
            <div className="bg-background border border-border rounded-lg p-4 space-y-2 text-sm">
              <div className="flex flex-wrap gap-4">
                {result.sassenfeldAnalysis.betas.map((beta, i) => (
                  <div key={i} className="font-mono bg-surface p-2 rounded border border-border">
                    β<sub className="text-[10px]">{i + 1}</sub> = {beta.toFixed(4)}
                  </div>
                ))}
              </div>
              <div className="mt-2 font-bold text-foreground">
                Max(β) = {result.sassenfeldAnalysis.betaMax.toFixed(4)}
              </div>
              <p className={`font-medium ${result.sassenfeldAnalysis.guaranteesConvergence ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {result.sassenfeldAnalysis.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFormulas = () => {
    if (!showFormulas) {
      return (
        <button
          onClick={() => setShowFormulas(true)}
          className="text-sm font-bold text-primary hover:underline"
        >
          Mostrar fórmulas iterativas despejadas
        </button>
      );
    }

    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-foreground">Fórmulas Iterativas</h3>
        <p className="text-sm text-foreground-muted">
          {result.method === 'jacobi' 
            ? 'En Jacobi, todos los valores de la nueva iteración (k+1) se calculan usando exclusivamente los valores de la iteración anterior (k).'
            : 'En Gauss-Seidel, se utilizan inmediatamente los nuevos valores (k+1) tan pronto como se calculan en la misma iteración.'}
        </p>
        <div className="bg-background border border-border rounded-lg p-4 overflow-x-auto">
          {result.originalA.map((row, i) => {
            const terms: string[] = [];
            for (let j = 0; j < n; j++) {
              if (i !== j && row[j] !== 0) {
                const sign = row[j] > 0 ? '-' : '+';
                const val = Math.abs(row[j]);
                const superscript = (result.method === 'gauss-seidel' && j < i) ? '⁽ᵏ⁺¹⁾' : '⁽ᵏ⁾';
                terms.push(`${sign} ${val}x${j + 1}${superscript}`);
              }
            }
            
            return (
              <div key={i} className="font-mono text-sm whitespace-nowrap mb-2 last:mb-0">
                x{i + 1}⁽ᵏ⁺¹⁾ = ( {result.originalB[i]} {terms.join(' ')} ) / {row[i]}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTable = () => (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-foreground flex justify-between items-center">
        <span>Historial de Iteraciones</span>
        <span className="text-xs font-normal text-foreground-muted bg-background px-2 py-1 rounded border border-border">
          Mostrando {result.iterationCount} iteraciones
        </span>
      </h3>
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm text-center">
          <thead className="bg-surface-secondary text-xs uppercase text-foreground-muted border-b border-border">
            <tr>
              <th className="px-3 py-2 border-r border-border">k</th>
              {Array.from({ length: n }).map((_, i) => (
                <th key={i} className="px-3 py-2 border-r border-border font-mono">x{i + 1}</th>
              ))}
              <th className="px-3 py-2">Error Relativo Máx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.iterations.map((iter) => (
              <tr key={iter.iteration} className="hover:bg-surface-secondary/50">
                <td className="px-3 py-2 border-r border-border font-bold bg-background/50">
                  {iter.iteration}
                </td>
                {iter.x.map((val, i) => (
                  <td key={i} className="px-3 py-2 border-r border-border font-mono">
                    {val.toFixed(6)}
                  </td>
                ))}
                <td className="px-3 py-2 font-mono text-amber-600 dark:text-amber-400">
                  {iter.iteration === 0 ? '—' : iter.maxRelativeError.toExponential(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStatus = () => {
    let statusColor = 'text-gray-500';
    let statusText = '';
    
    switch (result.status) {
      case 'converged':
        statusColor = 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        statusText = '✓ Convergió exitosamente';
        break;
      case 'max_iterations':
        statusColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        statusText = '⚠ Máximo de iteraciones alcanzado';
        break;
      case 'numerical_error':
      case 'zero_diagonal':
        statusColor = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        statusText = '✗ Error numérico o condición inválida';
        break;
    }

    return (
      <div className={`p-4 rounded-xl border ${statusColor} space-y-2`}>
        <div className="font-bold text-lg">{statusText}</div>
        {result.errorMessage && (
          <div className="text-sm opacity-90 font-medium">
            {result.errorMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in mt-6">
      {renderStatus()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderConvergenceAnalysis()}
          {renderFormulas()}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-foreground">Solución Final</h3>
          
          <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm space-y-2">
            {result.solution.map((val, i) => (
              <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="font-bold text-primary">x{i + 1}</span>
                <span>{val.toFixed(6)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-surface-secondary rounded p-3 text-center border border-border">
              <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1">Error Final</div>
              <div className="font-mono text-sm">{result.finalError.toExponential(4)}</div>
            </div>
            <div className="bg-surface-secondary rounded p-3 text-center border border-border">
              <div className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1">Residuo Máx ||AX-B||∞</div>
              <div className="font-mono text-sm">{result.finalResidual.toExponential(4)}</div>
            </div>
          </div>
          
          <div className="text-xs text-foreground-muted mt-4 border-t border-border pt-4">
            <div><strong>Tolerancia usada:</strong> {result.config.tolerance.toExponential(2)}</div>
            <div><strong>Vector inicial x⁽⁰⁾:</strong> [{result.config.initialVector.join(', ')}]</div>
          </div>
        </div>
      </div>

      {renderTable()}
    </div>
  );
}
