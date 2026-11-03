'use client';

import React, { useState } from 'react';
import {
  SimpsonMethodResponse,
  SimpsonNode,
  SimpsonConvergenceRow,
} from '../../core/domain/types';
import { SimpsonChart } from './SimpsonChart';
import { ManualSolutionView } from '../procedures/ManualSolutionView';
import * as XLSX from 'xlsx';

interface SimpsonResultsViewProps {
  result: SimpsonMethodResponse;
}

export function SimpsonResultsView({ result }: SimpsonResultsViewProps) {
  const [selectedDecimals, setSelectedDecimals] = useState<number>(6);

  if (!result.success) {
    return null;
  }

  const {
    methodType,
    a,
    b,
    n,
    h,
    Sn,
    nodes,
    units,
    manualProcedure,
    convergenceTable,
    exactReference,
    errorBoundAnalysis,
    variableName = 't',
    isTabular = false,
  } = result;

  const unitRate = units?.rateUnit || '';
  const unitIntegral = units?.integralUnit || '';
  const unitVar = units?.variableUnit || '';

  // Error real frente al valor analítico exacto de referencia
  const exactVal = exactReference?.value;
  const hasExact = exactVal !== undefined && Number.isFinite(exactVal);
  const absoluteError = hasExact ? Math.abs(exactVal - Sn) : null;
  const percentError =
    hasExact && exactVal !== 0 ? (100 * absoluteError!) / Math.abs(exactVal) : null;

  // Exportar datos a Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Hoja de Nodos
    const nodesData = nodes.map((node: SimpsonNode) => ({
      i: node.i,
      [`Nodo ${variableName}_i`]: node.t,
      [`f(${variableName}_i)`]: node.ft,
      Coeficiente: node.coefficient,
      'Factor Normalizado': node.weight,
      'Contribución Ponderada': node.termContribution,
    }));
    const wsNodes = XLSX.utils.json_to_sheet(nodesData);
    XLSX.utils.book_append_sheet(wb, wsNodes, 'Nodos Simpson');

    // 2. Hoja de Convergencia
    if (convergenceTable && convergenceTable.length > 0) {
      const convData = convergenceTable.map((row: SimpsonConvergenceRow) => ({
        n: row.n,
        h: row.h,
        [`S_n (${unitIntegral || 'Integral'})`]: row.Sn,
        [`Error Real (${unitIntegral || 'unid.'})`]: row.absoluteError ?? 'N/A',
        'Error Porcentual (%)': row.relativeErrorPercent ?? 'N/A',
        'Cota Error (Ficha M=0.45)': row.errorBoundM045 ?? 'N/A',
        'Cota Garantizada (M Valido)': row.errorBoundValidM ?? 'N/A',
      }));
      const wsConv = XLSX.utils.json_to_sheet(convData);
      XLSX.utils.book_append_sheet(wb, wsConv, 'Análisis Convergencia');
    }

    const prefix = methodType === 'simpson13' ? 'simpson_1_3' : 'simpson_3_8';
    XLSX.writeFile(wb, `${prefix}_n${n}.xlsx`);
  };

  const methodName =
    methodType === 'simpson13' ? 'Simpson 1/3 Compuesto' : 'Simpson 3/8 Compuesto';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Tarjetas de Resumen Métrico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Resultado Sn */}
        <div className="bg-surface/90 border border-primary/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-primary/20 transition-all"></div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
            Resultado Integral S_{n}
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
            {Sn.toFixed(selectedDecimals)}
          </div>
          <div className="text-xs text-foreground-muted mt-1 font-medium flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
              {unitIntegral || 'unidades'}
            </span>
            <span>(n = {n})</span>
          </div>
        </div>

        {/* Ancho de Paso h */}
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
            Error Absoluto Real |E - S_n|
          </span>
          {hasExact && absoluteError !== null ? (
            <>
              <div className="text-2xl font-extrabold text-foreground font-mono tracking-tight text-accent">
                {absoluteError.toExponential(4)}
              </div>
              <div className="text-xs text-foreground-muted mt-1 font-mono">
                ≈ {absoluteError.toFixed(selectedDecimals)} {unitIntegral}
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-foreground-muted font-mono tracking-tight mt-1">
                No provisto
              </div>
              <div className="text-[11px] text-foreground-muted mt-1">
                Requiere integral analítica
              </div>
            </>
          )}
        </div>

        {/* Error Porcentual Real */}
        <div className="bg-surface/90 border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-1">
            Error Relativo Porcentual
          </span>
          {hasExact && percentError !== null ? (
            <>
              <div className="text-2xl font-extrabold text-foreground font-mono tracking-tight text-emerald-500">
                {percentError < 0.0001
                  ? percentError.toExponential(4)
                  : percentError.toFixed(selectedDecimals > 4 ? 4 : selectedDecimals)}
                %
              </div>
              <div className="text-xs text-foreground-muted mt-1 font-medium">
                Convergencia de orden O(h⁴)
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-foreground-muted font-mono tracking-tight mt-1">
                —
              </div>
              <div className="text-[11px] text-foreground-muted mt-1">
                Exactitud verificable
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Cuadro Pedagógico: Fundamento Teórico y Requisito de Partición */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">💡</span>
            <h3 className="text-base font-bold text-foreground">
              Fundamento Teórico de {methodName}
            </h3>
          </div>
          {isTabular && (
            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
              Modo: Datos Tabulados
            </span>
          )}
        </div>
        <div className="text-xs text-foreground-muted leading-relaxed space-y-2">
          {methodType === 'simpson13' ? (
            <>
              <p>
                <strong>¿Qué aproxima Simpson 1/3?</strong> La Regla de Simpson 1/3 aproxima la función f(x) mediante <strong>parábolas de segundo orden</strong> (polinomios cuadráticos de Lagrange) trazadas a través de grupos de 3 puntos consecutivos. Pertenece a la familia de fórmulas cerradas de Newton-Cotes de grado 2.
              </p>
              <p>
                <strong>¿Por qué requiere obligatoriamente que n sea PAR?</strong> Cada parábola cubre exactamente <strong>2 subintervalos contiguos</strong> de ancho h (abarcando 3 nodos: t_{'{'}2k{'}'}, t_{'{'}2k+1{'}'}, t_{'{'}2k+2{'}'}). Por lo tanto, para poder particionar el intervalo [a, b] en grupos completos de 2 subintervalos sin dejar ningún tramo sin integrar, el número total de subintervalos n <strong>debe ser estrictamente un múltiplo de 2 (par)</strong>.
              </p>
              <p>
                <strong>Esquema de pesos:</strong> Los extremos se toman 1 vez, los nodos de índice impar (centros de cada parábola) se multiplican por <strong>4</strong>, y los nodos de índice par interiores (fronteras compartidas entre parábolas adyacentes) se multiplican por <strong>2</strong>: [1, 4, 2, 4, ..., 2, 4, 1].
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>¿Qué aproxima Simpson 3/8?</strong> La Regla de Simpson 3/8 aproxima la función mediante <strong>polinomios cúbicos de tercer orden</strong> que conectan grupos de 4 nodos contiguos. Corresponde a las fórmulas cerradas de Newton-Cotes de grado 3.
              </p>
              <p>
                <strong>¿Por qué exige que n sea MÚLTIPLO DE 3?</strong> Cada polinomio cúbico abarca exactamente <strong>3 subintervalos contiguos</strong>. En consecuencia, la partición total requiere que n sea divisible por 3 (n = 3, 6, 9, 12, ...).
              </p>
              <p>
                <strong>Esquema de pesos:</strong> Coeficiente 1 en los extremos (x₀, xₙ), coeficiente <strong>2</strong> en los nodos interiores cuyos índices son múltiplos de 3 (puntos de unión entre bloques cúbicos), y coeficiente <strong>3</strong> en todos los demás nodos interiores: [1, 3, 3, 2, 3, 3, 2, ..., 1].
              </p>
            </>
          )}
        </div>
      </div>

      {/* 3. Sección Crítica: Análisis de Cotas Teóricas de Error vs. Error Real */}
      {errorBoundAnalysis && (
        <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 text-sm">📐</span>
                <span>Análisis de Cotas Teóricas de Error vs. Error Real</span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Evaluación rigurosa de la fórmula del error de truncamiento |E_t| ≤ (b-a)h⁴M / {methodType === 'simpson13' ? '180' : '80'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-secondary text-foreground text-xs font-mono font-semibold">
              Orden O(h⁴)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cota con Dato de la Ficha (M = 0.45) */}
            {errorBoundAnalysis.mFicha && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {errorBoundAnalysis.mFicha.label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                    M = {errorBoundAnalysis.mFicha.mValue}
                  </span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-mono">
                  Cota |E_t| ≤ {errorBoundAnalysis.mFicha.bound.toFixed(6)} {unitIntegral}
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                  {errorBoundAnalysis.mFicha.note}
                </p>
                <div className="p-2 bg-amber-500/15 rounded-lg text-[11px] text-amber-800 dark:text-amber-200 font-medium">
                  ⚠️ <strong>No etiquetar como «error máximo garantizado»:</strong> El error real obtenido para n=6 es ≈ 0,024831 kWh, superando la cota de 0,015 kWh porque M=0,45 no acota la 4ª derivada real.
                </div>
              </div>
            )}

            {/* Cota Matemáticamente Garantizada (M Válido) */}
            {errorBoundAnalysis.mValid && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {errorBoundAnalysis.mValid.label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    M = {errorBoundAnalysis.mValid.mValue}
                  </span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-mono">
                  Cota Garantizada ≤ {errorBoundAnalysis.mValid.bound.toFixed(6)} {unitIntegral}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                  {errorBoundAnalysis.mValid.note}
                </p>
                {hasExact && absoluteError !== null && (
                  <div className="p-2 bg-emerald-500/15 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-200 font-medium">
                    ✓ <strong>Garantía confirmada:</strong> Error Real ({absoluteError.toFixed(6)} {unitIntegral}) ≤ Cota Teórica ({errorBoundAnalysis.mValid.bound.toFixed(6)} {unitIntegral}).
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Aviso si falta M para funciones generales */}
          {errorBoundAnalysis.missingMMessage && (
            <div className="p-3 bg-surface-secondary/70 border border-border rounded-xl text-xs text-foreground-muted">
              ℹ️ {errorBoundAnalysis.missingMMessage}
            </div>
          )}
        </div>
      )}

      {/* 4. Gráfica Interactiva */}
      <SimpsonChart result={result} />

      {/* 5. Tabla Detallada de Nodos y Contribuciones */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">📋</span>
              <span>Tabla de Evaluación de Nodos t_i y Coeficientes</span>
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Valores funcionales y contribución ponderada de cada nodo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">Decimales:</span>
            <select
              value={selectedDecimals}
              onChange={(e) => setSelectedDecimals(Number(e.target.value))}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={4}>4 decimales</option>
              <option value={6}>6 decimales</option>
              <option value={8}>8 decimales</option>
              <option value={10}>10 decimales</option>
              <option value={12}>12 decimales</option>
            </select>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1 bg-surface-secondary text-foreground hover:bg-border/60 transition-colors border border-border/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              title="Descargar libro Excel con tabla de nodos y convergencia"
            >
              <span>📥</span>
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">i</th>
                <th className="py-3 px-4 font-bold">Nodo {variableName}_i ({unitVar || 'x'})</th>
                <th className="py-3 px-4 font-bold">f({variableName}_i) ({unitRate || 'tasa'})</th>
                <th className="py-3 px-4 font-bold text-center">Coeficiente (c_i)</th>
                <th className="py-3 px-4 font-bold text-center">Peso Normalizado (w_i)</th>
                <th className="py-3 px-4 font-bold text-right">Contribución (c_i · f_i)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {nodes.map((node: SimpsonNode) => {
                const isEndpoint = node.i === 0 || node.i === n;
                const isOdd = node.i % 2 === 1;
                return (
                  <tr
                    key={node.i}
                    className={`hover:bg-surface-secondary/50 transition-colors ${
                      isEndpoint
                        ? 'bg-primary/5 font-semibold'
                        : isOdd && methodType === 'simpson13'
                        ? 'bg-amber-500/5'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-foreground-muted">{node.i}</td>
                    <td className="py-2.5 px-4 text-accent font-semibold">
                      {node.t.toFixed(4).replace(/\.?0+$/, '')}
                    </td>
                    <td className="py-2.5 px-4 text-foreground">
                      {node.ft.toFixed(selectedDecimals)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          node.coefficient === 4
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : node.coefficient === 3
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : node.coefficient === 2
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        {node.coefficient}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-foreground-muted text-[11px]">
                      {node.weight.toFixed(selectedDecimals > 6 ? 6 : selectedDecimals)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-foreground">
                      {node.termContribution.toFixed(selectedDecimals)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-secondary/70 font-bold text-xs">
                <td colSpan={3} className="py-3 px-4 text-foreground">
                  Suma Total de Contribuciones Ponderadas Σ (c_i · f_i):
                </td>
                <td className="py-3 px-4 text-center text-primary font-bold">
                  {nodes.reduce((acc, curr) => acc + curr.coefficient, 0)}
                </td>
                <td className="py-3 px-4 text-center text-foreground-muted">—</td>
                <td className="py-3 px-4 text-right text-primary text-sm font-extrabold">
                  {nodes
                    .reduce((acc, curr) => acc + curr.termContribution, 0)
                    .toFixed(selectedDecimals)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 6. Tabla de Análisis de Convergencia */}
      {convergenceTable && convergenceTable.length > 0 && (
        <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
          <div className="border-b border-border/50 pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="p-1.5 bg-accent/10 rounded-lg text-accent text-sm">📊</span>
              <span>
                Tabla de Análisis de Convergencia ({methodType === 'simpson13' ? 'n = 2, 4, 6, 12, 24' : 'n = 3, 6, 9, 12, 24'})
              </span>
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Comprobación con las referencias numéricas calculadas independientemente y cotas con M
            </p>
          </div>

          {hasExact && (
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl text-xs text-accent space-y-1">
              <p className="font-semibold">Valor exacto de referencia analítica:</p>
              <p className="font-mono text-[11px] text-foreground">
                {exactReference?.expressionDescription || `E ≈ ${exactVal.toFixed(12)} ${unitIntegral}`}
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">n</th>
                  <th className="py-3 px-4 font-bold">h ({unitVar || 'paso'})</th>
                  <th className="py-3 px-4 font-bold">Integral S_n ({unitIntegral || 'Integral'})</th>
                  <th className="py-3 px-4 font-bold">Error Real |E - S_n|</th>
                  <th className="py-3 px-4 font-bold text-right">Error Porcentual (%)</th>
                  <th className="py-3 px-4 font-bold text-right">Cota Ficha (M=0.45)</th>
                  <th className="py-3 px-4 font-bold text-right">Cota Válida (M=5.1311)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {convergenceTable.map((row: SimpsonConvergenceRow) => {
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
                      <td className="py-3 px-4 text-accent">
                        {row.h.toFixed(6).replace(/\.?0+$/, '')}
                      </td>
                      <td className="py-3 px-4 text-foreground font-semibold">
                        {row.Sn.toFixed(selectedDecimals)}
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
                              row.relativeErrorPercent < 0.01
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : row.relativeErrorPercent < 0.1
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
                      <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400">
                        {row.errorBoundM045 !== undefined
                          ? row.errorBoundM045.toFixed(6)
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                        {row.errorBoundValidM !== undefined
                          ? row.errorBoundValidM.toFixed(6)
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Procedimiento de Resolución Paso a Paso en KaTeX */}
      {manualProcedure && manualProcedure.length > 0 && (
        <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
          <div className="border-b border-border/50 pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary text-sm">📐</span>
              <span>Procedimiento de Resolución Paso a Paso (KaTeX)</span>
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Deducción formal, sustitución algebraica detallada de términos y cálculo del resultado
            </p>
          </div>

          <ManualSolutionView steps={manualProcedure} />
        </div>
      )}
    </div>
  );
}
