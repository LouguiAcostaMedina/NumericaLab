'use client';

import React, { useState, useEffect } from 'react';
import { TrapezoidForm, TrapezoidFormData } from '../../../components/integration/TrapezoidForm';
import { TrapezoidResultsView } from '../../../components/integration/TrapezoidResultsView';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import {
  calculateTrapezoidIntegration,
  DOCENTE_CASE_PRESET,
} from '../../../core/math/integration/trapezoid';
import { TrapezoidMethodResponse } from '../../../core/domain/types';

export default function TrapezoidIntegrationPage() {
  const [result, setResult] = useState<TrapezoidMethodResponse | null>(() => {
    return calculateTrapezoidIntegration({
      expression: DOCENTE_CASE_PRESET.expression,
      a: DOCENTE_CASE_PRESET.a,
      b: DOCENTE_CASE_PRESET.b,
      n: DOCENTE_CASE_PRESET.n,
      variableName: DOCENTE_CASE_PRESET.variableName,
      exactValue: DOCENTE_CASE_PRESET.exactValue,
      exactExpressionDescription: DOCENTE_CASE_PRESET.exactExpressionDescription,
      isTheoreticalExact: true,
      units: DOCENTE_CASE_PRESET.units,
      convergenceNValues: [4, 10, 50, 100, 1000],
    });
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeCalculation = (data: TrapezoidFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const response = calculateTrapezoidIntegration({
          expression: data.expression,
          a: data.a,
          b: data.b,
          n: data.n,
          variableName: data.variableName,
          exactValue: data.exactValue,
          exactExpressionDescription: data.exactExpressionDescription,
          isTheoreticalExact: data.isTheoreticalExact,
          units: data.units,
          convergenceNValues: [4, 10, 50, 100, 1000],
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-3">
          <span>Sesión 12</span>
          <span>•</span>
          <span>Integración Numérica</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
          Regla del Trapecio Compuesto
        </h1>
        <p className="text-foreground-muted text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
          Aproximación numérica de integrales definidas mediante la partición del intervalo en subintervalos equiespaciados, interpolación lineal por segmentos secantes y suma de áreas de trapecios (esquema cerrado de Newton-Cotes de orden 1).
        </p>
      </div>

      {/* Grid Principal: Formulario + Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Columna Izquierda: Formulario de Parámetros */}
        <div className="lg:col-span-1 sticky top-6">
          <TrapezoidForm
            isLoading={isLoading}
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
              {result && !errorMessage && <TrapezoidResultsView result={result} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
