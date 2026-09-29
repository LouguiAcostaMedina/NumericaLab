import React from 'react';
import { LagrangeResult } from '../../core/domain/types';

interface LagrangeResultsProps {
  result: LagrangeResult;
}

export function LagrangeResults({ result }: LagrangeResultsProps) {
  if (!result.success) return null;

  return (
    <div className="space-y-6">
      
      {/* 1. Datos ingresados y Nodos */}
      <section className="bg-surface rounded-xl p-5 border border-border">
        <h4 className="text-sm font-bold text-foreground mb-3">1. Nodos Utilizados</h4>
        <div className="flex flex-wrap gap-2">
          {result.points.map((p, i) => (
            <span key={i} className="px-3 py-1.5 bg-background rounded-lg border border-border text-xs font-mono text-foreground-muted">
              P{i} ({p.x}, {p.y})
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-foreground-muted">
          Grado máximo esperado del polinomio: <strong>{result.points.length - 1}</strong>
        </p>
      </section>

      {/* 2. Polinomios Base de Lagrange Lk(x) */}
      <section className="bg-surface rounded-xl p-5 border border-border">
        <h4 className="text-sm font-bold text-foreground mb-3">2. Polinomios Base de Lagrange Lk(x)</h4>
        <div className="space-y-4">
          {result.basisPolynomials.map((basis, k) => (
            <div key={k} className="p-3 bg-background border border-border rounded-lg text-sm font-mono overflow-x-auto">
              <div className="text-primary font-bold mb-1">L{k}(x) =</div>
              <div className="text-foreground-muted whitespace-nowrap mb-2">
                {basis.basisExpression}
              </div>
              <div className="text-xs text-foreground/70 border-t border-border pt-2">
                Expansión: {basis.expandedNumerator}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Polinomio Interpolador */}
      <section className="bg-surface rounded-xl p-5 border border-border">
        <h4 className="text-sm font-bold text-foreground mb-3">3. Construcción del Polinomio P{result.points.length - 1}(x)</h4>
        <div className="p-4 bg-background border border-border rounded-lg font-mono overflow-x-auto text-sm space-y-4">
          <div>
            <div className="text-primary font-bold mb-1">P{result.points.length - 1}(x) =</div>
            <div className="text-foreground-muted whitespace-nowrap">
              {result.polynomialExpression}
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <div className="text-primary font-bold mb-1">Forma Simplificada:</div>
            <div className="text-foreground font-semibold whitespace-nowrap text-base">
              P{result.points.length - 1}(x) = {result.simplifiedPolynomial}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Evaluación */}
      {result.evaluationPoint !== undefined && result.interpolatedValue !== undefined && (
        <section className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 rounded-xl p-6">
          <h4 className="text-sm font-bold text-cyan-900 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            4. Evaluación en x = {result.evaluationPoint}
          </h4>
          <div className="space-y-4 text-sm font-mono text-cyan-950 dark:text-cyan-100/80">
            <div>
              <span className="font-bold">P{result.points.length - 1}({result.evaluationPoint})</span> = {' '}
              {result.points.map((p, k) => `${p.y} * L${k}(${result.evaluationPoint})`).join(' + ')}
            </div>
            
            <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 border-t border-cyan-200 dark:border-cyan-900/30 pt-4 mt-2">
              Resultado = {result.interpolatedValue.toFixed(6).replace(/\.?0+$/, '')}
            </div>
          </div>
        </section>
      )}

      {/* 5. Verificación */}
      <section className="bg-surface-secondary rounded-xl p-5 border border-border">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span>✓</span> Verificación de Interpolación
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.verification.map((v, i) => (
            <div key={i} className={`p-3 rounded-lg border text-xs font-mono ${v.isCorrect ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'}`}>
              <div>P({v.point.x}) ≈ {v.calculated.toFixed(6).replace(/\.?0+$/, '')}</div>
              <div className="mt-1 opacity-70">Esperado: {v.point.y}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
