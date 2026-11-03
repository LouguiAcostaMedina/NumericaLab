'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SimpsonForm, SimpsonFormData } from '../../../components/integration/SimpsonForm';
import { SimpsonResultsView } from '../../../components/integration/SimpsonResultsView';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import {
  calculateSimpsonIntegration,
  SIMPSON38_TABULAR_PRESET,
} from '../../../core/math/integration/simpson';
import { SimpsonMethodResponse } from '../../../core/domain/types';

export default function Simpson38Page() {
  const [result, setResult] = useState<SimpsonMethodResponse | null>(() => {
    return calculateSimpsonIntegration({
      methodType: 'simpson38',
      isTabular: true,
      tabularPoints: SIMPSON38_TABULAR_PRESET.points,
      a: SIMPSON38_TABULAR_PRESET.a,
      b: SIMPSON38_TABULAR_PRESET.b,
      n: SIMPSON38_TABULAR_PRESET.n,
      variableName: SIMPSON38_TABULAR_PRESET.variableName,
      units: SIMPSON38_TABULAR_PRESET.units,
      exactValue: SIMPSON38_TABULAR_PRESET.expectedArea,
      exactExpressionDescription:
        'A = 78.9375 \\text{ m}^2 \\quad (\\text{Referencia Guía Teórica})',
      isTheoreticalExact: true,
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
          methodType: 'simpson38',
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
          convergenceNValues: [3, 6, 9, 12, 24],
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
            href="/integracion-numerica/simpson-1-3"
            className="text-xs text-foreground-muted hover:text-primary transition-colors underline decoration-dotted"
          >
            Ir a Simpson 1/3 →
          </Link>
          <Link
            href="/integracion-numerica/trapecio"
            className="text-xs text-foreground-muted hover:text-primary transition-colors underline decoration-dotted"
          >
            Ir a Trapecio (Sesión 12) →
          </Link>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
          Regla de Simpson 3/8 (Simple y Compuesto)
        </h1>
        <p className="text-foreground-muted text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
          Aproximación de integrales definidas e integración de datos tabulados mediante polinomios cúbicos de tercer orden (esquema cerrado de Newton-Cotes de grado 3). Exige que el número de subintervalos n sea un <strong>múltiplo de 3</strong> con coeficientes [1, 3, 3, 2, 3, 3, 2, ..., 1].
        </p>
      </div>

      {/* Grid Principal: Formulario + Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Columna Izquierda: Formulario de Parámetros */}
        <div className="lg:col-span-1 sticky top-6">
          <SimpsonForm
            isLoading={isLoading}
            defaultMethodType="simpson38"
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
