'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  BisectionIteration, 
  NewtonIteration,
  FalsePositionIteration,
  FixedPointIteration,
  SecantIteration
} from '../core/domain/types';
import { exportToCSV, exportToExcel, exportToPDF } from '../core/utils/export';

type ResultsTableProps =
  | { type: 'bisection'; data: BisectionIteration[] }
  | { type: 'newton'; data: NewtonIteration[] }
  | { type: 'false-position'; data: FalsePositionIteration[] }
  | { type: 'fixed-point'; data: FixedPointIteration[] }
  | { type: 'secant'; data: SecantIteration[] };

export function ResultsTable(props: ResultsTableProps) {
  const { type, data } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getMethodName = (t: string): string => {
    switch (t) {
      case 'bisection': return 'Método de Bisección';
      case 'false-position': return 'Método de Falsa Posición';
      case 'newton': return 'Método de Newton-Raphson';
      case 'fixed-point': return 'Método de Punto Fijo';
      case 'secant': return 'Método de la Secante';
      default: return 'Método Numérico';
    }
  };

  const formatNum = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return 'N/A';
    if (val === 0) return '0.000000';
    
    const absVal = Math.abs(val);
    if (absVal < 1e-4) {
      return val.toExponential(6);
    }
    return val.toFixed(6);
  };

  const formatError = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return 'N/A';
    if (val === 0) return '0.000000%';
    
    const absVal = Math.abs(val);
    if (absVal < 1e-4) {
      return `${val.toExponential(6)}%`;
    }
    return `${val.toFixed(6)}%`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
        No hay datos para mostrar. Realiza un cálculo para rellenar la tabla.
      </div>
    );
  }

  // Configuración de estilos condicionales por método
  const getStyleConfig = () => {
    switch (type) {
      case 'bisection':
        return {
          borderColor: 'border-cyan-200/40 dark:border-cyan-900/20',
          headerBg: 'bg-cyan-50/20 dark:bg-cyan-950/10',
          accentText: 'text-cyan-600 dark:text-cyan-450',
        };
      case 'false-position':
        return {
          borderColor: 'border-teal-200/40 dark:border-teal-900/20',
          headerBg: 'bg-teal-50/20 dark:bg-teal-950/10',
          accentText: 'text-teal-600 dark:text-teal-450',
        };
      case 'newton':
        return {
          borderColor: 'border-blue-200/40 dark:border-blue-900/20',
          headerBg: 'bg-blue-50/20 dark:bg-blue-950/10',
          accentText: 'text-blue-600 dark:text-blue-455',
        };
      case 'fixed-point':
        return {
          borderColor: 'border-purple-200/40 dark:border-purple-900/20',
          headerBg: 'bg-purple-50/20 dark:bg-purple-950/10',
          accentText: 'text-purple-600 dark:text-purple-450',
        };
      case 'secant':
        return {
          borderColor: 'border-indigo-200/40 dark:border-indigo-900/20',
          headerBg: 'bg-indigo-50/20 dark:bg-indigo-950/10',
          accentText: 'text-indigo-600 dark:text-indigo-450',
        };
    }
  };

  const { borderColor, headerBg, accentText } = getStyleConfig();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h4 className="text-md font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span>📋</span> Tabla de Iteraciones
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-mono">
            {data.length} iteraciones
          </span>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs hover:scale-102"
            >
              📥 Exportar Resultados <span className="text-[10px] text-zinc-400 dark:text-zinc-500">▼</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 py-1 font-sans animate-fade-in">
                <button
                  onClick={() => {
                    exportToCSV(data, type);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <span className="text-zinc-400">📄</span> Descargar CSV (.csv)
                </button>
                <button
                  onClick={() => {
                    exportToExcel(data, type);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <span className="text-zinc-400">📊</span> Descargar Excel (.xlsx)
                </button>
                <button
                  onClick={() => {
                    exportToPDF(data, type, getMethodName(type));
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <span className="text-zinc-400">📕</span> Descargar Reporte PDF (.pdf)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`overflow-x-auto border ${borderColor} rounded-xl shadow-sm bg-white dark:bg-zinc-900`}>
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className={`${headerBg} text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800`}>
              <th className="py-3.5 px-4 text-center w-16">N</th>
              
              {type === 'bisection' && (
                <>
                  <th className="py-3.5 px-4 text-right">Lím. Inferior ($a$)</th>
                  <th className="py-3.5 px-4 text-right">Lím. Superior ($b$)</th>
                  <th className="py-3.5 px-4 text-right">Aprox. Raíz ($xr$)</th>
                  <th className="py-3.5 px-4 text-right">f(a)</th>
                  <th className="py-3.5 px-4 text-right">f(b)</th>
                  <th className="py-3.5 px-4 text-right">f(xr)</th>
                </>
              )}

              {type === 'false-position' && (
                <>
                  <th className="py-3.5 px-4 text-right">Lím. Inferior ($x_l$)</th>
                  <th className="py-3.5 px-4 text-right">Lím. Superior ($x_u$)</th>
                  <th className="py-3.5 px-4 text-right">Aprox. Raíz ($xr$)</th>
                  <th className="py-3.5 px-4 text-right">f($x_l$)</th>
                  <th className="py-3.5 px-4 text-right">f($x_u$)</th>
                  <th className="py-3.5 px-4 text-right">f($xr$)</th>
                </>
              )}

              {type === 'newton' && (
                <>
                  <th className="py-3.5 px-4 text-right">Valor Actual ($x_i$)</th>
                  <th className="py-3.5 px-4 text-right">f($x_i$)</th>
                  <th className="py-3.5 px-4 text-right">f&apos;($x_i$)</th>
                  <th className="py-3.5 px-4 text-right">{"Siguiente ($x_{i+1}$)"}</th>
                </>
              )}

              {type === 'fixed-point' && (
                <>
                  <th className="py-3.5 px-4 text-right">Valor Actual ($x_i$)</th>
                  <th className="py-3.5 px-4 text-right">g($x_i$)</th>
                </>
              )}

              {type === 'secant' && (
                <>
                  <th className="py-3.5 px-4 text-right">{"Semilla ($x_{i-1}$)"}</th>
                  <th className="py-3.5 px-4 text-right">Semilla ($x_i$)</th>
                  <th className="py-3.5 px-4 text-right">{"f($x_{i-1}$)"}</th>
                  <th className="py-3.5 px-4 text-right">f($x_i$)</th>
                  <th className="py-3.5 px-4 text-right">{"Siguiente ($x_{i+1}$)"}</th>
                </>
              )}

              <th className="py-3.5 px-4 text-right pr-6">Error relativo ($\varepsilon_a$)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 font-mono">
            {type === 'bisection' && 
              (data as BisectionIteration[]).map((row) => (
                <tr key={row.iteration} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                  <td className="py-3 px-4 text-center font-semibold text-zinc-500 dark:text-zinc-400">{row.iteration}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.a)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.b)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${accentText}`}>{formatNum(row.xr)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fa)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fb)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fxr)}</td>
                  <td className="py-3 px-4 text-right pr-6 font-semibold text-zinc-650 dark:text-zinc-350">{formatError(row.error)}</td>
                </tr>
              ))
            }

            {type === 'false-position' && 
              (data as FalsePositionIteration[]).map((row) => (
                <tr key={row.iteration} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                  <td className="py-3 px-4 text-center font-semibold text-zinc-500 dark:text-zinc-400">{row.iteration}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.xl)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.xu)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${accentText}`}>{formatNum(row.xr)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fxl)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fxu)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fxr)}</td>
                  <td className="py-3 px-4 text-right pr-6 font-semibold text-zinc-650 dark:text-zinc-350">{formatError(row.error)}</td>
                </tr>
              ))
            }

            {type === 'newton' && 
              (data as NewtonIteration[]).map((row) => (
                <tr key={row.iteration} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                  <td className="py-3 px-4 text-center font-semibold text-zinc-500 dark:text-zinc-400">{row.iteration}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.xi)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fxi)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.dfxi)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${accentText}`}>{formatNum(row.xiNext)}</td>
                  <td className="py-3 px-4 text-right pr-6 font-semibold text-zinc-650 dark:text-zinc-350">{formatError(row.error)}</td>
                </tr>
              ))
            }

            {type === 'fixed-point' && 
              (data as FixedPointIteration[]).map((row) => (
                <tr key={row.iteration} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                  <td className="py-3 px-4 text-center font-semibold text-zinc-500 dark:text-zinc-400">{row.iteration}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.xi)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${accentText}`}>{formatNum(row.gxi)}</td>
                  <td className="py-3 px-4 text-right pr-6 font-semibold text-zinc-650 dark:text-zinc-350">{formatError(row.error)}</td>
                </tr>
              ))
            }

            {type === 'secant' && 
              (data as SecantIteration[]).map((row) => (
                <tr key={row.iteration} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/25 transition-colors">
                  <td className="py-3 px-4 text-center font-semibold text-zinc-500 dark:text-zinc-400">{row.iteration}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.xiMinus1)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.xi)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fxiMinus1)}</td>
                  <td className="py-3 px-4 text-right">{formatNum(row.fxi)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${accentText}`}>{formatNum(row.xiNext)}</td>
                  <td className="py-3 px-4 text-right pr-6 font-semibold text-zinc-650 dark:text-zinc-350">{formatError(row.error)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
