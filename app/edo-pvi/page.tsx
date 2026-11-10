'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OdeForm, OdeFormData } from '../../components/ode/OdeForm';
import { OdeResultsView } from '../../components/ode/OdeResultsView';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import {
  solveOdePvi,
  ODE_AUTONOMOUS_PRESET,
} from '../../core/math/ode/pvi';
import { OdeCalculationResponse } from '../../core/domain/types';

export default function OdePviPage() {
  const [result, setResult] = useState<OdeCalculationResponse | null>(() => {
    return solveOdePvi({
      equationMode: 'differential',
      expressionF: ODE_AUTONOMOUS_PRESET.expressionF,
      expressionM: ODE_AUTONOMOUS_PRESET.expressionM,
      expressionN: ODE_AUTONOMOUS_PRESET.expressionN,
      x0: ODE_AUTONOMOUS_PRESET.x0,
      y0: ODE_AUTONOMOUS_PRESET.y0,
      xTarget: ODE_AUTONOMOUS_PRESET.xTarget,
      h: ODE_AUTONOMOUS_PRESET.h,
      stepAdjustmentMode: 'exact_n',
      selectedMethods: ['euler', 'heun', 'rk3', 'rk4'],
      exactExpression: ODE_AUTONOMOUS_PRESET.exactExpression,
      exactDerivationExplanation: ODE_AUTONOMOUS_PRESET.exactDerivationExplanation,
    });
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeCalculation = (data: OdeFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const response = solveOdePvi({
          equationMode: data.equationMode,
          expressionF: data.expressionF,
          expressionM: data.expressionM,
          expressionN: data.expressionN,
          x0: data.x0,
          y0: data.y0,
          xTarget: data.xTarget,
          h: data.h,
          stepAdjustmentMode: data.stepAdjustmentMode,
          selectedMethods: data.methods,
          exactExpression: data.exactExpression,
          exactDerivationExplanation: data.exactDerivationExplanation,
        });

        if (response.success) {
          setResult(response);
        } else {
          setErrorMessage(response.errorMessage || 'Error al resolver la ecuación diferencial.');
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : String(err) || 'Error inesperado durante la ejecución.'
        );
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Encabezado */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
            <span>Sesión 14</span>
            <span>•</span>
            <span>Ecuaciones Diferenciales Ordinarias</span>
          </div>
          <Link
            href="/integracion-numerica/simpson-1-3"
            className="text-xs text-foreground-muted hover:text-primary transition-colors underline decoration-dotted"
          >
            ← Ir a Simpson 1/3 (Sesión 13)
          </Link>
          <Link
            href="/integracion-numerica"
            className="text-xs text-foreground-muted hover:text-primary transition-colors underline decoration-dotted"
          >
            Panel de Integración →
          </Link>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
          Problemas de Valor Inicial (PVI)
        </h1>
        <p className="text-foreground-muted text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
          Resolución numérica y análisis comparativo de ecuaciones diferenciales ordinarias de primer orden{' '}
          <code className="text-primary font-mono font-bold">y&apos; = f(x, y)</code> o{' '}
          <code className="text-primary font-mono font-bold">M(x,y)dx + N(x,y)dy = 0</code> mediante los métodos de
          Euler, Heun (Euler Mejorado), Runge-Kutta 3 y Runge-Kutta 4.
        </p>
      </div>

      {/* Alerta de Error si ocurre */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-3 animate-shake">
          <span className="text-lg">⚠️</span>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Error en el cálculo</h4>
            <p className="text-xs">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Formulario de Entrada */}
      <OdeForm isLoading={isLoading} onSubmit={executeCalculation} />

      {/* Vista de Resultados */}
      {isLoading ? (
        <SkeletonLoader type="both" />
      ) : (
        result && result.success && <OdeResultsView result={result} />
      )}
    </div>
  );
}
