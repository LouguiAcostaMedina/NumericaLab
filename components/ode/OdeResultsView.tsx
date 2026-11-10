'use client';

import React, { useState } from 'react';
import {
  OdeCalculationResponse,
  OdeMethodType,
  OdeStepDetail,
} from '../../core/domain/types';
import { OdeChart } from './OdeChart';
import { ManualSolutionView } from '../procedures/ManualSolutionView';
import * as XLSX from 'xlsx';

interface OdeResultsViewProps {
  result: OdeCalculationResponse;
}

export function OdeResultsView({ result }: OdeResultsViewProps) {
  const [selectedMethodTab, setSelectedMethodTab] = useState<OdeMethodType>('euler');
  const [selectedDecimals, setSelectedDecimals] = useState<number>(6);

  if (!result.success || !result.results) {
    return null;
  }

  const {
    expressionF,
    expressionM,
    expressionN,
    equationMode,
    x0,
    y0,
    xTarget,
    nominalH,
    totalSteps,
    stepAdjustmentMode,
    exactExpression,
    exactDerivationExplanation,
    comparisonTable = [],
    results,
  } = result;

  const availableMethods = (Object.keys(results) as OdeMethodType[]).filter(
    (m) => results[m] !== undefined
  );

  const activeMethodKey = availableMethods.includes(selectedMethodTab)
    ? selectedMethodTab
    : availableMethods[0] || 'euler';

  const activeMethodResult = results[activeMethodKey];

  // Exportar reporte integral a Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Hoja Comparativa
    const compData = comparisonTable.map((row) => ({
      Método: row.methodName,
      'Orden Teórico': `O(h^${row.order})`,
      'Valor y(x_obj)': row.approxValue,
      'Error Absoluto': row.absoluteError !== undefined ? row.absoluteError : 'N/A',
      'Error Relativo (%)': row.relativeErrorPercent !== undefined ? row.relativeErrorPercent : 'N/A',
      'Evaluaciones / Paso': row.evaluationsPerStep,
      'Total Evaluaciones': row.totalEvaluations,
    }));
    const wsComp = XLSX.utils.json_to_sheet(compData);
    XLSX.utils.book_append_sheet(wb, wsComp, 'Comparativa General');

    // 2. Hojas individuales por cada método
    availableMethods.forEach((m) => {
      const mRes = results[m];
      if (!mRes) return;

      const stepsData = mRes.steps.map((st: OdeStepDetail) => {
        const baseRow: Record<string, string | number> = {
          Paso: st.step,
          x_i: st.x,
          y_i: st.y,
          h: st.h,
          'Pendiente Efectiva': st.slope,
          y_siguiente: st.yNext,
        };

        if (st.exactValue !== undefined) {
          baseRow['y_exacto'] = st.exactValue;
          baseRow['Error Abs'] = st.absoluteError ?? 'N/A';
          baseRow['Error Rel (%)'] = st.relativeErrorPercent ?? 'N/A';
        }

        if (st.heunDetail) {
          baseRow['Predictor y^(0)'] = st.heunDetail.yPredictor;
          baseRow['Pendiente f(x_i, y_i)'] = st.heunDetail.slopeInitial;
          baseRow['Pendiente Predictora'] = st.heunDetail.slopePredictor;
          baseRow['Pendiente Promedio'] = st.heunDetail.slopeAverage;
        }

        if (st.rk3Detail) {
          baseRow['k1'] = st.rk3Detail.k1;
          baseRow['k2'] = st.rk3Detail.k2;
          baseRow['k3'] = st.rk3Detail.k3;
          baseRow['Pendiente Ponderada'] = st.rk3Detail.weightedSlope;
        }

        if (st.rk4Detail) {
          baseRow['k1'] = st.rk4Detail.k1;
          baseRow['k2'] = st.rk4Detail.k2;
          baseRow['k3'] = st.rk4Detail.k3;
          baseRow['k4'] = st.rk4Detail.k4;
          baseRow['Pendiente Ponderada'] = st.rk4Detail.weightedSlope;
        }

        return baseRow;
      });

      const wsMethod = XLSX.utils.json_to_sheet(stepsData);
      XLSX.utils.book_append_sheet(wb, wsMethod, mRes.methodName.substring(0, 31));
    });

    XLSX.writeFile(wb, `EDO_PVI_x${xTarget}_h${nominalH}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Tarjetas de Resumen Métrico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Parámetros de Dominio */}
        <div className="bg-surface/90 border border-primary/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
            Intervalo y Paso
          </span>
          <div className="text-xl font-extrabold text-foreground font-mono">
            [{x0}, {xTarget}]
          </div>
          <span className="text-xs text-foreground-muted mt-1 block">
            h = {nominalH} ({totalSteps} pasos {stepAdjustmentMode === 'partial_last_step' ? 'con tramo parcial' : 'uniformes'})
          </span>
        </div>

        {/* Solución Exacta de Referencia si existe */}
        <div className="bg-surface/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Valor Verdadero y({xTarget})
          </span>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {activeMethodResult?.finalExact !== undefined
              ? activeMethodResult.finalExact.toFixed(selectedDecimals)
              : 'No provisto'}
          </div>
          <span className="text-xs text-foreground-muted mt-1 block truncate">
            {exactExpression ? `y(x) = ${exactExpression}` : 'Solución numérica pura'}
          </span>
        </div>

        {/* Mejor Aproximación (RK4 o el orden más alto) */}
        {results.rk4 ? (
          <div className="bg-surface/90 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
              Runge-Kutta 4 (Orden 4)
            </span>
            <div className="text-xl font-extrabold text-foreground font-mono">
              {results.rk4.finalY.toFixed(selectedDecimals)}
            </div>
            <span className="text-xs text-foreground-muted mt-1 block">
              {results.rk4.finalRelErrorPercent !== undefined
                ? `Error rel: ${results.rk4.finalRelErrorPercent.toFixed(7)}%`
                : '4 evals / paso'}
            </span>
          </div>
        ) : (
          <div className="bg-surface/90 border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block mb-1">
              Método Seleccionado
            </span>
            <div className="text-xl font-extrabold text-foreground font-mono">
              {activeMethodResult ? activeMethodResult.finalY.toFixed(selectedDecimals) : 'N/A'}
            </div>
            <span className="text-xs text-foreground-muted mt-1 block">
              {activeMethodResult?.methodName}
            </span>
          </div>
        )}

        {/* Método de Heun o Euler de la Actividad */}
        {results.heun ? (
          <div className="bg-surface/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
              Heun (Orden 2 - Predictor)
            </span>
            <div className="text-xl font-extrabold text-foreground font-mono">
              {results.heun.finalY.toFixed(selectedDecimals)}
            </div>
            <span className="text-xs text-foreground-muted mt-1 block">
              {results.heun.finalRelErrorPercent !== undefined
                ? `Error rel: ${results.heun.finalRelErrorPercent.toFixed(6)}%`
                : '2 evals / paso'}
            </span>
          </div>
        ) : (
          <div className="bg-surface/90 border border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
              Euler (Orden 1)
            </span>
            <div className="text-xl font-extrabold text-foreground font-mono">
              {results.euler ? results.euler.finalY.toFixed(selectedDecimals) : 'N/A'}
            </div>
            <span className="text-xs text-foreground-muted mt-1 block">
              {results.euler?.finalRelErrorPercent !== undefined
                ? `Error rel: ${results.euler.finalRelErrorPercent.toFixed(4)}%`
                : '1 eval / paso'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Barra de Herramientas y Exportación */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface/80 border border-border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">Precisión decimal mostrada:</span>
          <div className="inline-flex rounded-lg bg-surface-secondary p-1 border border-border text-xs">
            {[4, 6, 8, 10, 15].map((dec) => (
              <button
                key={dec}
                onClick={() => setSelectedDecimals(dec)}
                className={`px-2.5 py-1 rounded font-mono font-bold transition-all ${
                  selectedDecimals === dec
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {dec}d
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold shadow-md shadow-emerald-900/20 active:scale-95"
        >
          <span>📥</span>
          <span>Descargar Reporte en Excel (.xlsx)</span>
        </button>
      </div>

      {/* 3. Tabla Comparativa de Métodos */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div>
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>📊</span>
              <span>Cuadro Comparativo de Métodos Numéricos en x = {xTarget}</span>
            </h4>
            <p className="text-xs text-foreground-muted mt-0.5">
              Comparación de precisión, orden de convergencia local y esfuerzo computacional
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50 text-foreground-muted text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Método</th>
                <th className="py-3 px-4 font-bold">Orden Teórico</th>
                <th className="py-3 px-4 font-bold">Aproximación y({xTarget})</th>
                <th className="py-3 px-4 font-bold">Error Absoluto |y_ex - y|</th>
                <th className="py-3 px-4 font-bold">Error Relativo (%)</th>
                <th className="py-3 px-4 font-bold text-center">Evals / Paso</th>
                <th className="py-3 px-4 font-bold text-center">Total Evaluaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground">
              {comparisonTable.map((row) => {
                let badgeColor = 'text-foreground';
                let rowBg = '';
                if (row.methodType === 'euler') {
                  badgeColor = 'text-blue-600 dark:text-blue-400';
                  rowBg = 'hover:bg-blue-500/5';
                } else if (row.methodType === 'heun') {
                  badgeColor = 'text-amber-600 dark:text-amber-400';
                  rowBg = 'hover:bg-amber-500/5';
                } else if (row.methodType === 'rk3') {
                  badgeColor = 'text-purple-600 dark:text-purple-400';
                  rowBg = 'hover:bg-purple-500/5';
                } else if (row.methodType === 'rk4') {
                  badgeColor = 'text-rose-600 dark:text-rose-400';
                  rowBg = 'hover:bg-rose-500/5';
                }

                return (
                  <tr key={row.methodType} className={`transition-colors ${rowBg}`}>
                    <td className={`py-3 px-4 font-bold ${badgeColor} flex items-center gap-1.5`}>
                      <span>{row.methodName}</span>
                    </td>
                    <td className="py-3 px-4 text-foreground-muted">O(h^{row.order})</td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {row.approxValue.toFixed(selectedDecimals)}
                    </td>
                    <td className="py-3 px-4 text-foreground-muted">
                      {row.absoluteError !== undefined
                        ? row.absoluteError.toExponential(4)
                        : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {row.relativeErrorPercent !== undefined ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            row.relativeErrorPercent < 0.05
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : row.relativeErrorPercent < 1
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {row.relativeErrorPercent.toFixed(6)}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{row.evaluationsPerStep}</td>
                    <td className="py-3 px-4 text-center font-bold">{row.totalEvaluations}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Gráfica Multi-método */}
      <OdeChart result={result} />

      {/* 5. Tablas Detalladas Paso a Paso por Método */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div>
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>📋</span>
              <span>Tabla de Iteraciones Detallada</span>
            </h4>
            <p className="text-xs text-foreground-muted mt-0.5">
              Inspecciona los valores intermedios, predictores, correctores y constantes Runge-Kutta
            </p>
          </div>

          {/* Selector de Pestañas de Método */}
          <div className="inline-flex rounded-xl bg-surface-secondary p-1 border border-border text-xs">
            {availableMethods.map((m) => {
              const mRes = results[m];
              if (!mRes) return null;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMethodTab(m)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeMethodKey === m
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {mRes.methodName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla específica del método activo */}
        {activeMethodResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-foreground-muted">
              <span>
                Mostrando tabla de <strong className="text-foreground">{activeMethodResult.methodName}</strong> (
                {activeMethodResult.steps.length} iteraciones)
              </span>
              <span>Orden de convergencia local: O(h^{activeMethodResult.order})</span>
            </div>

            <div className="overflow-x-auto">
              {activeMethodKey === 'euler' && (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-bold">Paso i</th>
                      <th className="py-2.5 px-3 font-bold">x_i</th>
                      <th className="py-2.5 px-3 font-bold">y_i</th>
                      <th className="py-2.5 px-3 font-bold">h</th>
                      <th className="py-2.5 px-3 font-bold">Pendiente f(x_i, y_i)</th>
                      <th className="py-2.5 px-3 font-bold">y_{'{i+1}'} = y_i + h·f</th>
                      {activeMethodResult.finalExact !== undefined && (
                        <>
                          <th className="py-2.5 px-3 font-bold">y_exacto</th>
                          <th className="py-2.5 px-3 font-bold">Error Rel (%)</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-foreground">
                    {activeMethodResult.steps.map((st) => (
                      <tr key={st.step} className="hover:bg-surface-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-primary">i = {st.step}</td>
                        <td className="py-2.5 px-3 font-bold">{st.x.toFixed(4)}</td>
                        <td className="py-2.5 px-3">{st.y.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-foreground-muted">
                          {st.h.toFixed(4)}
                          {st.isPartialStep && <span className="ml-1 text-[10px] text-amber-500">(parcial)</span>}
                        </td>
                        <td className="py-2.5 px-3 text-blue-500 font-semibold">{st.slope.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{st.yNext.toFixed(selectedDecimals)}</td>
                        {activeMethodResult.finalExact !== undefined && (
                          <>
                            <td className="py-2.5 px-3 text-emerald-500">
                              {st.exactValue !== undefined ? st.exactValue.toFixed(selectedDecimals) : '—'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                              {st.relativeErrorPercent !== undefined ? `${st.relativeErrorPercent.toFixed(4)}%` : '—'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeMethodKey === 'heun' && (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-bold">Paso i</th>
                      <th className="py-2.5 px-3 font-bold">x_i</th>
                      <th className="py-2.5 px-3 font-bold">y_i</th>
                      <th className="py-2.5 px-3 font-bold">f(x_i, y_i)</th>
                      <th className="py-2.5 px-3 font-bold text-amber-500">Predictor y_{'{i+1}'}^{(0)}</th>
                      <th className="py-2.5 px-3 font-bold text-amber-600">f(x_{'{i+1}'}, y^{(0)})</th>
                      <th className="py-2.5 px-3 font-bold">Pendiente Promedio</th>
                      <th className="py-2.5 px-3 font-bold">Corrector y_{'{i+1}'}</th>
                      {activeMethodResult.finalExact !== undefined && (
                        <th className="py-2.5 px-3 font-bold">Error Rel (%)</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-foreground">
                    {activeMethodResult.steps.map((st) => (
                      <tr key={st.step} className="hover:bg-surface-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-primary">i = {st.step}</td>
                        <td className="py-2.5 px-3 font-bold">{st.x.toFixed(4)}</td>
                        <td className="py-2.5 px-3">{st.y.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-foreground-muted">
                          {st.heunDetail?.slopeInitial.toFixed(selectedDecimals)}
                        </td>
                        <td className="py-2.5 px-3 text-amber-500 font-semibold">
                          {st.heunDetail?.yPredictor.toFixed(selectedDecimals)}
                        </td>
                        <td className="py-2.5 px-3 text-amber-600 font-semibold">
                          {st.heunDetail?.slopePredictor.toFixed(selectedDecimals)}
                        </td>
                        <td className="py-2.5 px-3 text-foreground-muted">
                          {st.heunDetail?.slopeAverage.toFixed(selectedDecimals)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{st.yNext.toFixed(selectedDecimals)}</td>
                        {activeMethodResult.finalExact !== undefined && (
                          <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                            {st.relativeErrorPercent !== undefined ? `${st.relativeErrorPercent.toFixed(4)}%` : '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeMethodKey === 'rk3' && (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-bold">Paso i</th>
                      <th className="py-2.5 px-3 font-bold">x_i</th>
                      <th className="py-2.5 px-3 font-bold">y_i</th>
                      <th className="py-2.5 px-3 font-bold text-purple-500">k₁</th>
                      <th className="py-2.5 px-3 font-bold text-purple-600">k₂</th>
                      <th className="py-2.5 px-3 font-bold text-purple-700">k₃</th>
                      <th className="py-2.5 px-3 font-bold">Pendiente (k₁+4k₂+k₃)/6</th>
                      <th className="py-2.5 px-3 font-bold">y_{'{i+1}'}</th>
                      {activeMethodResult.finalExact !== undefined && (
                        <th className="py-2.5 px-3 font-bold">Error Rel (%)</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-foreground">
                    {activeMethodResult.steps.map((st) => (
                      <tr key={st.step} className="hover:bg-surface-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-primary">i = {st.step}</td>
                        <td className="py-2.5 px-3 font-bold">{st.x.toFixed(4)}</td>
                        <td className="py-2.5 px-3">{st.y.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-purple-500">{st.rk3Detail?.k1.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-purple-600">{st.rk3Detail?.k2.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-purple-700">{st.rk3Detail?.k3.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-foreground-muted">
                          {st.rk3Detail?.weightedSlope.toFixed(selectedDecimals)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{st.yNext.toFixed(selectedDecimals)}</td>
                        {activeMethodResult.finalExact !== undefined && (
                          <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">
                            {st.relativeErrorPercent !== undefined ? `${st.relativeErrorPercent.toFixed(6)}%` : '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeMethodKey === 'rk4' && (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary/40 text-foreground-muted text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-bold">Paso i</th>
                      <th className="py-2.5 px-3 font-bold">x_i</th>
                      <th className="py-2.5 px-3 font-bold">y_i</th>
                      <th className="py-2.5 px-3 font-bold text-rose-500">k₁</th>
                      <th className="py-2.5 px-3 font-bold text-rose-500">k₂</th>
                      <th className="py-2.5 px-3 font-bold text-rose-600">k₃</th>
                      <th className="py-2.5 px-3 font-bold text-rose-700">k₄</th>
                      <th className="py-2.5 px-3 font-bold">Pendiente (k₁+2k₂+2k₃+k₄)/6</th>
                      <th className="py-2.5 px-3 font-bold">y_{'{i+1}'}</th>
                      {activeMethodResult.finalExact !== undefined && (
                        <th className="py-2.5 px-3 font-bold">Error Rel (%)</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-foreground">
                    {activeMethodResult.steps.map((st) => (
                      <tr key={st.step} className="hover:bg-surface-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-primary">i = {st.step}</td>
                        <td className="py-2.5 px-3 font-bold">{st.x.toFixed(4)}</td>
                        <td className="py-2.5 px-3">{st.y.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-rose-500">{st.rk4Detail?.k1.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-rose-500">{st.rk4Detail?.k2.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-rose-600">{st.rk4Detail?.k3.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-rose-700">{st.rk4Detail?.k4.toFixed(selectedDecimals)}</td>
                        <td className="py-2.5 px-3 text-foreground-muted">
                          {st.rk4Detail?.weightedSlope.toFixed(selectedDecimals)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{st.yNext.toFixed(selectedDecimals)}</td>
                        {activeMethodResult.finalExact !== undefined && (
                          <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                            {st.relativeErrorPercent !== undefined ? `${st.relativeErrorPercent.toFixed(7)}%` : '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. Solución Manual Paso a Paso (KaTeX) */}
      {activeMethodResult?.manualProcedure && activeMethodResult.manualProcedure.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div>
              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>📝</span>
                <span>Procedimiento Manual Matemático Paso a Paso ({activeMethodResult.methodName})</span>
              </h4>
              <p className="text-xs text-foreground-muted mt-0.5">
                Desarrollo analítico con sustitución de fórmulas, coeficientes numéricos e iteraciones
              </p>
            </div>
          </div>
          <ManualSolutionView steps={activeMethodResult.manualProcedure} />
        </div>
      )}

      {/* 7. Módulo Pedagógico y Fundamento Teórico */}
      <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-4">
        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
          <span>📚</span>
          <span>Guía Teórica de EDO - PVI (Sesión 14)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-foreground-muted leading-relaxed">
          <div className="p-4 rounded-xl border border-border bg-surface-secondary/20 space-y-2">
            <h5 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <span>🎯</span>
              <span>¿Qué es un Problema de Valor Inicial (PVI)?</span>
            </h5>
            <p>
              Un PVI de primer orden consiste en una ecuación diferencial <code className="font-mono text-primary">y&apos; = f(x, y)</code>{' '}
              junto con una condición inicial fija <code className="font-mono text-primary">y(x₀) = y₀</code>.
              El objetivo es aproximar el valor de la función solución <code className="font-mono">y(x_objetivo)</code> avanzando
              a través del intervalo en pasos discretos <code className="font-mono">h</code>.
            </p>
            <p>
              {equationMode === 'differential' ? (
                <>
                  En la forma diferencial <code className="font-mono">M(x,y)dx + N(x,y)dy = 0</code>, se despeja la derivada como{' '}
                  <code className="font-mono text-primary">dy/dx = -M(x,y) / N(x,y)</code>. Los puntos donde{' '}
                  <code className="font-mono">N(x, y) = 0</code> corresponden a indeterminaciones o tangentes verticales donde el método
                  se detiene para evitar divisiones entre cero.
                </>
              ) : (
                <>
                  La función <code className="font-mono">f(x, y)</code> determina la pendiente geométrica de la recta tangente a la curva
                  integral en cualquier punto del plano <code className="font-mono">(x, y)</code>.
                </>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-secondary/20 space-y-2">
            <h5 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <span>🔍</span>
              <span>Comparación de Órdenes y Error Truncamiento</span>
            </h5>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong className="text-foreground">Euler (Orden 1):</strong> Error local <code className="font-mono">O(h²)</code>, error global{' '}
                <code className="font-mono">O(h)</code>. 1 evaluación por paso. Útil pedagógicamente pero poco preciso para pasos grandes.
              </li>
              <li>
                <strong className="text-foreground">Heun / Euler Mejorado (Orden 2):</strong> Error local <code className="font-mono">O(h³)</code>,
                global <code className="font-mono">O(h²)</code>. Método predictor-corrector que promedia pendientes inicial y final.
              </li>
              <li>
                <strong className="text-foreground">Runge-Kutta 3 (Orden 3):</strong> Error global <code className="font-mono">O(h³)</code>.
                Fórmula de la Diapositiva 31 con 3 evaluaciones ponderadas con pesos 1/6, 4/6, 1/6.
              </li>
              <li>
                <strong className="text-foreground">Runge-Kutta 4 (Orden 4):</strong> Error global <code className="font-mono">O(h⁴)</code>.
                El estándar de la industria numérica por su balance óptimo de precisión y costo computacional (4 evaluaciones).
              </li>
            </ul>
          </div>
        </div>

        {/* Explicación de la derivación analítica si existe */}
        {exactDerivationExplanation && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <h5 className="font-bold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>📐</span>
              <span>Derivación de la Solución Exacta de Referencia</span>
            </h5>
            <p className="text-xs text-foreground font-mono whitespace-pre-line leading-relaxed">
              {exactDerivationExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
