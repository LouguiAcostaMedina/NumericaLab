'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SimpsonForm, SimpsonFormData } from '../../../components/integration/SimpsonForm';
import { SimpsonResultsView } from '../../../components/integration/SimpsonResultsView';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import {
  calculateSimpsonIntegration,
  SIMPSON13_AUTONOMOUS_PRESET,
} from '../../../core/math/integration/simpson';
import { SimpsonMethodResponse } from '../../../core/domain/types';

export default function Simpson13Page() {
  const [result, setResult] = useState<SimpsonMethodResponse | null>(() => {
    return calculateSimpsonIntegration({
      methodType: 'simpson13',
      expression: SIMPSON13_AUTONOMOUS_PRESET.expression,
      a: SIMPSON13_AUTONOMOUS_PRESET.a,
      b: SIMPSON13_AUTONOMOUS_PRESET.b,
      n: SIMPSON13_AUTONOMOUS_PRESET.n,
      variableName: SIMPSON13_AUTONOMOUS_PRESET.variableName,
      exactValue: SIMPSON13_AUTONOMOUS_PRESET.exactValue,
      exactExpressionDescription: SIMPSON13_AUTONOMOUS_PRESET.exactExpressionDescription,
      isTheoreticalExact: true,
      mFicha: SIMPSON13_AUTONOMOUS_PRESET.mFicha,
      mValid: SIMPSON13_AUTONOMOUS_PRESET.mValid,
      units: SIMPSON13_AUTONOMOUS_PRESET.units,
      convergenceNValues: [2, 4, 6, 12, 24],
    });
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeCalculation = (data: SimpsonFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const response = calculateSimpsonIntegration({
          methodType: 'simpson13',
          expression: data.expression,
          a: data.a,
          b: data.b,
          n: data.n,
          variableName: data.variableName,
          exactValue: data.exactValue,
          exactExpressionDescription: data.exactExpressionDescription,
          isTheoreticalExact: data.isTheoreticalExact,
          mFicha: data.mFicha,
          mValid: data.mValid,
          units: data.units,
          convergenceNValues: [2, 4, 6, 12, 24],
          isTabular: data.isTabular,
          tabularPoints: data.tabularPoints,
        });

        if (response.success) {
          setResult(response);
        } else {
          setErrorMessage(response.errorMessage || 'Error al calcular la integración.');
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
            <span>Sesión 13</span>
            <span>•</span>
            <span>Integración Numérica</span>
          </div>
          <Link
            href="/integracion-numerica/simpson-3-8"
            className="text-xs text-foreground-muted hover:text-primary transition-colors underline decoration-dotted"
          >
            Ir a Simpson 3/8 →
          </Link>
          <Link
            href="/integracion-numerica/trapecio"
            className="text-xs text-foreground-muted hover:text-primary transition-colors underline decoration-dotted"
          >
            Ir a Trapecio (Sesión 12) →
          </Link>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
          Regla de Simpson 1/3 Compuesto
        </h1>
        <p className="text-foreground-muted text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
          Aproximación de integrales definidas mediante interpolación cuadrática por parábolas (fórmulas cerradas de Newton-Cotes de orden 2). Requiere un número <strong>par</strong> de subintervalos equiespaciados (n ≥ 2) con coeficientes [1, 4, 2, 4, ..., 2, 4, 1]. Incluye caso obligatorio de potencia eléctrica P(t).
        </p>
      </div>

      {/* Grid Principal: Formulario + Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Columna Izquierda: Formulario de Parámetros */}
        <div className="lg:col-span-1 sticky top-6">
          <SimpsonForm
            isLoading={isLoading}
            defaultMethodType="simpson13"
            onSubmit={(data) => executeCalculation(data)}
          />
        </div>

        {/* Columna Derecha: Resultados y Gráficas */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <SkeletonLoader type="both" />
          ) : (
            <>
              {/* Alerta de Error si ocurre */}
              {errorMessage && (
                <div className="bg-error/10 border border-error/30 text-error p-5 rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm">Error de Validación Matemática</h5>
                    <p className="text-xs leading-relaxed font-mono">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Vista de Resultados */}
              {result && !errorMessage && <SimpsonResultsView result={result} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
