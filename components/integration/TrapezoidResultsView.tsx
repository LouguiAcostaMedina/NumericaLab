'use client';

import React, { useState } from 'react';
import {
  TrapezoidMethodResponse,
  TrapezoidNode,
  ConvergenceAnalysisRow,
} from '../../core/domain/types';
import { TrapezoidChart } from './TrapezoidChart';
import { ManualSolutionView } from '../procedures/ManualSolutionView';
import * as XLSX from 'xlsx';

interface TrapezoidResultsViewProps {
  result: TrapezoidMethodResponse;
}

export function TrapezoidResultsView({ result }: TrapezoidResultsViewProps) {
  const [selectedDecimals, setSelectedDecimals] = useState<number>(6);

  if (!result.success) {
    return null;
  }

  const {
    a,
    b,
    n,
    h,
    Tn,
    nodes,
    units,
    manualProcedure,
    convergenceTable,
    exactReference,
    variableName = 't',
  } = result;

  const unitRate = units?.rateUnit || '';
  const unitIntegral = units?.integralUnit || '';
  const unitVar = units?.variableUnit || '';

  // Calcular métricas de error si existe valor de referencia exacto
  const exactD = exactReference?.value;
  const hasExact = exactD !== undefined && Number.isFinite(exactD);
  const absoluteError = hasExact ? Math.abs(exactD - Tn) : null;
  const percentError = hasExact && exactD !== 0 ? (100 * absoluteError!) / Math.abs(exactD) : null;

  // Exportar datos a Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Hoja de Nodos
    const nodesData = nodes.map((node: TrapezoidNode) => ({
      i: node.i,
      [`Nodo ${variableName}_i`]: node.t,
      [`f(${variableName}_i)`]: node.ft,
      Coeficiente: node.coefficient,
      'Peso Trapezoidal (wi)': node.weight,
      'Contribución Ponderada': node.termContribution,
    }));
    const wsNodes = XLSX.utils.json_to_sheet(nodesData);
    XLSX.utils.book_append_sheet(wb, wsNodes, 'Nodos Trapecio');

    // 2. Hoja de Convergencia (si existe)
    if (convergenceTable && convergenceTable.length > 0) {
      const convData = convergenceTable.map((row: ConvergenceAnalysisRow) => ({
        n: row.n,
        h: row.h,
        [`T_n (${unitIntegral || 'Unidades'})`]: row.Tn,
        [`Error Absoluto (${unitIntegral || 'Unidades'})`]: row.absoluteError ?? 'N/A',
        'Error Porcentual (%)': row.relativeErrorPercent ?? 'N/A',
      }));
      const wsConv = XLSX.utils.json_to_sheet(convData);
      XLSX.utils.book_append_sheet(wb, wsConv, 'Análisis Convergencia');
    }

    XLSX.writeFile(wb, `trapecio_compuesto_n${n}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Tarjetas de Resumen Métrico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Resultado Tn */}
        <div className="bg-surface/90 border border-primary/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-primary/20 transition-all"></div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
            Resultado Integral T_{n}
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
            {Tn.toFixed(selectedDecimals)}
          </div>
          <div className="text-xs text-foreground-muted mt-1 font-medium flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
              {unitIntegral || 'unidades'}
            </span>
            <span>(n = {n})</span>
          </div>
        </div>

        {/* Tamaño de Paso h */}
        <div className="bg-surface/90 border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-1">
            Ancho Subintervalo (h)
          </span>
          <div className="text-2xl font-extrabold text-foreground font-mono tracking-tight">
            {h.toFixed(selectedDecimals > 6 ? 6 : selectedDecimals)}
          </div>
          <div className="text-xs text-foreground-muted mt-1">
            h = ({b} - {a}) / {n} {unitVar}
          </div>
        </div>

        {/* Error Absoluto Real */}
        <div className="bg-surface/90 border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-1">
            Error Absoluto Real |D - T_n|
          </span>
          {hasExact && absoluteError !== null ? (
            <>
              <div className="text-2xl font-extrabold text-foreground font-mono tracking-tight">
                {absoluteError.toFixed(selectedDecimals)}
              </div>
              <div className="text-xs text-accent mt-1 font-medium">
                {unitIntegral || 'unidades'}
              </div>
            </>
          ) : (
            <div className="text-xs text-foreground-muted mt-2">
              Sin valor exacto provisto
            </div>
          )}
        </div>

        {/* Error Porcentual Relativo */}
        <div className="bg-surface/90 border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-1">
            Error Porcentual (ε_p)
          </span>
          {hasExact && percentError !== null ? (
            <>
              <div className="text-2xl font-extrabold text-amber-500 font-mono tracking-tight">
                {percentError.toFixed(selectedDecimals > 6 ? 6 : selectedDecimals)}%
              </div>
              <div className="text-xs text-foreground-muted mt-1">
                Relativo al valor real D
              </div>
            </>
          ) : (
            <div className="text-xs text-foreground-muted mt-2">
              Sin valor exacto provisto
            </div>
          )}
        </div>
      </div>

      {/* 2. Tarjeta Conceptual: Explicación y Contexto Teórico */}
      <div className="bg-gradient-to-br from-surface to-surface-secondary border border-border rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">💡</span>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">
              Fundamento Conceptual del Trapecio Compuesto
            </h3>
            <p className="text-sm text-foreground-muted leading-relaxed">
              En lugar de integrar directamente la curva continua, se divide el intervalo{' '}
              <strong className="text-foreground">[{a}, {b}] {unitVar}</strong> en{' '}
              <strong className="text-foreground">{n} subintervalos</strong> de ancho constante{' '}
              <strong className="text-foreground">h = {h.toFixed(4)} {unitVar}</strong>. En cada subintervalo se aproxima la función mediante un segmento de recta secante que une los extremos contiguos y se calcula el área del trapecio bajo la recta. La integral total es la suma de las áreas de todos los trapecios.
            </p>
          </div>
        </div>

        <div className="p-4 bg-background/60 border border-border/60 rounded-xl space-y-2 text-xs text-foreground-muted">
          <p className="font-bold text-foreground flex items-center gap-1.5">
            <span>📚</span>
            <span>Relación con las Fórmulas de Newton-Cotes</span>
          </p>
          <p className="leading-relaxed">
            La <strong>Regla del Trapecio Simple</strong> es la fórmula cerrada de Newton-Cotes de <strong>orden 1</strong> (polinomio interpolante de grado 1 que conecta 2 puntos). El <strong>Trapecio Compuesto</strong> generaliza esta idea aplicando la regla simple a subintervalos sucesivos, lo que otorga peso 0.5 a los extremos y peso 1.0 a los nodos compartidos interiores, con un orden de convergencia global cuadrático <code className="bg-surface px-1 py-0.5 rounded text-accent">O(h²)</code>.
          </p>
          <p className="text-[11px] text-foreground-muted/80 italic">
            Nota de alcance: Las fórmulas de orden superior como Simpson 1/3 (orden 2 con parábolas), Simpson 3/8 (orden 3) y la integración por rectángulos pertenecen a la misma familia teórica pero no forman parte de este módulo.
          </p>
        </div>
      </div>

      {/* 3. Gráfica Interactiva */}
      <TrapezoidChart result={result} />

      {/* 4. Tabla de Nodos Evaluados */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">🔢</span>
              <span>Tabla de Nodos y Ponderación Trapezoidal</span>
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Evaluación en los {nodes.length} nodos {variableName}_i y factores de peso para el cálculo de T_{n}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
              <span>Decimales:</span>
              <select
                value={selectedDecimals}
                onChange={(e) => setSelectedDecimals(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={4}>4 dec.</option>
                <option value={6}>6 dec.</option>
                <option value={8}>8 dec.</option>
                <option value={12}>12 dec.</option>
              </select>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg bg-surface-secondary text-foreground hover:bg-border/60 transition-colors border border-border/60 text-xs font-medium flex items-center gap-1.5"
            >
              <span>📊</span>
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">i</th>
                <th className="py-3 px-4 font-bold">Nodo {variableName}_i {unitVar ? `(${unitVar})` : ''}</th>
                <th className="py-3 px-4 font-bold">f({variableName}_i) {unitRate ? `(${unitRate})` : ''}</th>
                <th className="py-3 px-4 font-bold">Coeficiente</th>
                <th className="py-3 px-4 font-bold">Peso (w_i)</th>
                <th className="py-3 px-4 font-bold text-right">Contribución w_i · f({variableName}_i)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {nodes.map((node: TrapezoidNode) => {
                const isEndpoint = node.i === 0 || node.i === n;
                return (
                  <tr
                    key={node.i}
                    className={`hover:bg-surface-secondary/50 transition-colors ${
                      isEndpoint ? 'bg-primary/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 text-foreground font-bold">{node.i}</td>
                    <td className="py-2.5 px-4 text-accent">{node.t.toFixed(4)}</td>
                    <td className="py-2.5 px-4 text-foreground">{node.ft.toFixed(selectedDecimals)}</td>
                    <td className="py-2.5 px-4 text-foreground-muted">{node.coefficient}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isEndpoint
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        {node.weight === 0.5 ? '1/2' : '1'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-foreground font-bold">
                      {node.termContribution.toFixed(selectedDecimals)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-secondary/60 text-foreground font-bold">
                <td colSpan={5} className="py-3 px-4 text-right">
                  Suma ponderada Σ [w_i · f({variableName}_i)]:
                </td>
                <td className="py-3 px-4 text-right text-primary">
                  {(Tn / h).toFixed(selectedDecimals)}
                </td>
              </tr>
              <tr className="border-t border-border bg-primary/10 text-primary font-bold text-sm">
                <td colSpan={5} className="py-3 px-4 text-right">
                  T_{n} = h · (Suma ponderada) = {h.toFixed(4)} · {(Tn / h).toFixed(selectedDecimals)}:
                </td>
                <td className="py-3 px-4 text-right text-primary">
                  {Tn.toFixed(selectedDecimals)} {unitIntegral}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. Resolución Manual Paso a Paso (KaTeX) */}
      {manualProcedure && manualProcedure.length > 0 && (
        <ManualSolutionView steps={manualProcedure} />
      )}

      {/* 6. Tabla de Análisis de Convergencia */}
      {convergenceTable && convergenceTable.length > 0 && (
        <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
          <div className="border-b border-border/50 pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="p-1.5 bg-accent/10 rounded-lg text-accent text-sm">📊</span>
              <span>Análisis de Convergencia (n = 4, 10, 50, 100, 1000)</span>
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Demostración de la reducción del error proporcional a O(h²) al aumentar el número de subdivisiones
            </p>
          </div>

          {hasExact && (
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl text-xs text-accent space-y-1">
              <p className="font-semibold">Valor exacto de referencia utilizado:</p>
              <p className="font-mono text-[11px] text-foreground">
                {exactReference?.expressionDescription || `D ≈ ${exactD.toFixed(12)} ${unitIntegral}`}
              </p>
            </div>
          )}

          {!hasExact && (
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-xs text-yellow-600 dark:text-yellow-400">
              Para funciones generales sin integral analítica provista, no se presenta una estimación como «error real». Se requiere un valor de referencia explícito para calcular el error absoluto y porcentual exacto.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">n</th>
                  <th className="py-3 px-4 font-bold">h ({unitVar || 'paso'})</th>
                  <th className="py-3 px-4 font-bold">T_n ({unitIntegral || 'Integral'})</th>
                  <th className="py-3 px-4 font-bold">Error Absoluto Real ({unitIntegral || 'unid.'})</th>
                  <th className="py-3 px-4 font-bold text-right">Error Porcentual (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {convergenceTable.map((row: ConvergenceAnalysisRow) => {
                  const isCurrentCase = row.n === n;
                  return (
                    <tr
                      key={row.n}
                      className={`hover:bg-surface-secondary/50 transition-colors ${
                        isCurrentCase ? 'bg-primary/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5">
                          <span>{row.n}</span>
                          {isCurrentCase && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary text-white font-sans uppercase">
                              Actual
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-accent">{row.h.toFixed(6).replace(/\.?0+$/, '')}</td>
                      <td className="py-3 px-4 text-foreground font-semibold">
                        {row.Tn.toFixed(selectedDecimals)}
                      </td>
                      <td className="py-3 px-4 text-foreground-muted">
                        {row.absoluteError !== undefined
                          ? row.absoluteError.toFixed(selectedDecimals)
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.relativeErrorPercent !== undefined ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              row.relativeErrorPercent < 0.05
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : row.relativeErrorPercent < 1
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {row.relativeErrorPercent.toFixed(selectedDecimals > 6 ? 6 : selectedDecimals)}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
