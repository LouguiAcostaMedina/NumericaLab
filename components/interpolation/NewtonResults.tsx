import React, { useState } from 'react';
import { NewtonInterpolationResult } from '../../core/domain/types';
import { ManualSolutionView } from '../procedures/ManualSolutionView';
import * as math from 'mathjs';

interface NewtonResultsProps {
  result: NewtonInterpolationResult;
}

function toFractionStr(num: number): string {
  if (num === undefined || isNaN(num)) return '';
  try {
    const f = math.fraction(num) as any;
    if (Number(f.d) === 1) return (Number(f.s) * Number(f.n)).toString();
    if (Number(f.d) > 10000) return num.toFixed(6).replace(/\.?0+$/, ''); 
    return `${Number(f.s) * Number(f.n)}/${Number(f.d)}`;
  } catch {
    return num.toFixed(6).replace(/\.?0+$/, '');
  }
}

export function NewtonResults({ result }: NewtonResultsProps) {
  const [showDecimals, setShowDecimals] = useState(false);
  
  if (!result.success) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Datos ingresados y Nodos */}
      <section className="bg-surface rounded-xl p-5 border border-border shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="text-primary">1.</span> Nodos Utilizados
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.points.map((p, i) => (
            <span key={i} className="px-3 py-1.5 bg-background rounded-lg border border-border text-xs font-mono text-foreground-muted shadow-sm">
              P{i} ({p.x}, {p.y})
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-foreground-muted">
          Grado máximo posible del polinomio de Newton: <strong>{result.points.length - 1}</strong>
        </p>
      </section>

      {/* 2. Tabla de Diferencias Divididas */}
      <section className="bg-surface rounded-xl p-5 border border-border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span className="text-primary">2.</span> Tabla de Diferencias Divididas
          </h4>
          <button 
            onClick={() => setShowDecimals(!showDecimals)}
            className="text-xs bg-background hover:bg-surface-secondary border border-border px-3 py-1.5 rounded-lg transition-colors font-medium text-foreground-muted hover:text-foreground"
          >
            {showDecimals ? 'Mostrar en Fracciones' : 'Mostrar en Decimales'}
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-background text-foreground-muted font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b border-border font-semibold">x_i</th>
                <th className="px-4 py-3 border-b border-border font-semibold">f[x_i]</th>
                {result.dividedDifferencesTable.slice(1).map((_, j) => (
                  <th key={j} className="px-4 py-3 border-b border-border font-semibold">
                    {j + 1}ª diff
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {result.points.map((p, i) => (
                <tr key={i} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-foreground font-semibold border-r border-border/30 bg-background/30">
                    {p.x}
                  </td>
                  {result.dividedDifferencesTable.map((col, j) => {
                    const val = col[i];
                    if (val === undefined) return <td key={j} className="px-4 py-3 border-r border-border/30"></td>;
                    
                    const displayVal = showDecimals 
                      ? val.toFixed(6).replace(/\.?0+$/, '') 
                      : toFractionStr(val);
                      
                    return (
                      <td key={j} className={`px-4 py-3 font-mono ${j === 0 ? 'text-primary font-medium' : 'text-foreground-muted'} border-r border-border/30`}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Coeficientes del Polinomio de Newton */}
      <section className="bg-surface rounded-xl p-5 border border-border shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="text-primary">3.</span> Coeficientes del Polinomio de Newton
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.coefficients.map((c, i) => {
            const args = Array.from({length: i+1}, (_, idx) => `x_${idx}`).join(',');
            return (
              <div key={i} className="p-3 bg-background rounded-lg border border-border shadow-sm">
                <div className="text-xs font-mono text-foreground-muted mb-1">
                  a_{i} = f[{args}]
                </div>
                <div className="font-mono text-lg font-bold text-primary">
                  {showDecimals ? c.toFixed(6).replace(/\.?0+$/, '') : toFractionStr(c)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Construcción del Polinomio P(x) */}
      <section className="bg-surface rounded-xl p-5 border border-border shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="text-primary">4.</span> Polinomio de Newton P{result.points.length - 1}(x)
        </h4>
        <div className="p-4 bg-background border border-border rounded-lg font-mono overflow-x-auto text-sm space-y-4 shadow-inner">
          <div>
            <div className="text-primary/80 font-bold mb-1 text-xs uppercase tracking-wider">Forma de Newton:</div>
            <div className="text-foreground-muted whitespace-nowrap">
              P{result.points.length - 1}(x) = {result.polynomialExpression}
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="text-primary/80 font-bold mb-1 text-xs uppercase tracking-wider">Forma Estándar Simplificada:</div>
            <div className="text-foreground font-semibold whitespace-nowrap text-base">
              P{result.points.length - 1}(x) = {result.simplifiedPolynomial}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Evaluación */}
      {result.evaluationPoint !== undefined && result.interpolatedValue !== undefined && (
        <section className="bg-cyan-50/80 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 rounded-xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-cyan-900 dark:text-cyan-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>5.</span> Evaluación Numérica
          </h4>
          <div className="space-y-4 text-sm font-mono text-cyan-950 dark:text-cyan-100/80">
            <div>
              <span className="font-bold">Sustituyendo x = {result.evaluationPoint} en P{result.points.length - 1}(x):</span>
            </div>
            
            <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 border-t border-cyan-200/50 dark:border-cyan-900/30 pt-4 mt-2">
              P({result.evaluationPoint}) ≈ {result.interpolatedValue.toFixed(6).replace(/\.?0+$/, '')}
            </div>
          </div>
        </section>
      )}

      {/* 6. Verificación */}
      <section className="bg-surface-secondary rounded-xl p-5 border border-border shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="text-green-600 dark:text-green-500">✓</span> Verificación de Interpolación en los Nodos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.verification.map((v, i) => (
            <div key={i} className={`p-3 rounded-lg border text-xs font-mono shadow-sm transition-colors ${v.isCorrect ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'}`}>
              <div className="font-bold">P({v.point.x}) ≈ {v.calculated.toFixed(6).replace(/\.?0+$/, '')}</div>
              <div className="mt-1 opacity-75">Esperado: {v.point.y}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Visor paso a paso detallado (Tabla de diferencias divididas) */}
      <ManualSolutionView steps={result.manualProcedure} />
    </div>
  );
}
