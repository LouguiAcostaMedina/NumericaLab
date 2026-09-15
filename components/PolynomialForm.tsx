'use client';

import React, { useState } from 'react';
import { ThreeBoxInput } from './ThreeBoxInput';
import { EngineeringPresetsSelector } from './EngineeringPresetsSelector';
import { HistoryDrawer } from './HistoryDrawer';
import { EngineeringPreset, CalculationHistoryItem } from '../core/domain/history';
import { IIRFilterAnalyzer } from '../core/math/iirFilter';

interface PolynomialFormProps {
  onSolveString: (
    polyStr: string,
    tolerance: number,
    maxIter: number,
    decimals: number,
    seeds?: { useCustomSeeds: boolean; x0: number; x1: number; x2: number }
  ) => void;
  onSolvePreset?: (presetId: string, tolerance: number, maxIter: number, decimals: number) => void;
  isLoading?: boolean;
}

export const PolynomialForm: React.FC<PolynomialFormProps> = ({
  onSolveString,
  isLoading = false,
}) => {
  const [polyString, setPolyString] = useState<string>('x^4 + x^3 - 3*x^2 - x + 2');
  const [tolerance, setTolerance] = useState<number>(0.001);
  const [maxIterations, setMaxIterations] = useState<number>(100);
  const [decimals, setDecimals] = useState<number>(6);
  const [activePresetId, setActivePresetId] = useState<string>('iir-stability-main');

  // Toggle "Usar semillas personalizadas" vs "Autogenerar con Lagrange"
  const [useCustomSeeds, setUseCustomSeeds] = useState<boolean>(true);

  // "Las 3 cajitas" para semillas de Müller
  const [x0, setX0] = useState<string>('0');
  const [x1, setX1] = useState<string>('0.5');
  const [x2, setX2] = useState<string>('1.0');

  // Restablecer "Defaults Inteligentes" para las 3 cajitas
  const handleResetDefaults = () => {
    setX0('0');
    setX1('0.5');
    setX2('1.0');
    setUseCustomSeeds(true);
  };

  // Cargar un Preset de Ingeniería de 1 Clic
  const handleSelectEngineeringPreset = (preset: EngineeringPreset) => {
    setActivePresetId(preset.id);
    setPolyString(preset.expression);
    setTolerance(preset.params.tolerance);
    setMaxIterations(preset.params.maxIterations);
    setDecimals(preset.params.decimals || 6);

    const hasSeeds = preset.params.x0 !== undefined && preset.params.x1 !== undefined && preset.params.x2 !== undefined;
    setUseCustomSeeds(hasSeeds);

    if (preset.params.x0 !== undefined) setX0(preset.params.x0.toString());
    if (preset.params.x1 !== undefined) setX1(preset.params.x1.toString());
    if (preset.params.x2 !== undefined) setX2(preset.params.x2.toString());

    // Disparar cálculo automático con el preset cargado
    const pX0 = preset.params.x0 ?? 0;
    const pX1 = preset.params.x1 ?? 0.5;
    const pX2 = preset.params.x2 ?? 1.0;

    onSolveString(
      preset.expression,
      preset.params.tolerance,
      preset.params.maxIterations,
      preset.params.decimals || 6,
      { useCustomSeeds: hasSeeds, x0: pX0, x1: pX1, x2: pX2 }
    );
  };

  // Cargar ítem desde el Historial
  const handleSelectHistoryItem = (item: CalculationHistoryItem) => {
    setActivePresetId('');
    setPolyString(item.expression);
    setTolerance(item.params.tolerance);
    setMaxIterations(item.params.maxIterations);
    setDecimals(item.params.decimals || 6);

    const hasSeeds = item.params.x0 !== undefined;
    setUseCustomSeeds(hasSeeds);

    if (item.params.x0 !== undefined) setX0(item.params.x0.toString());
    if (item.params.x1 !== undefined) setX1(item.params.x1.toString());
    if (item.params.x2 !== undefined) setX2(item.params.x2.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!polyString.trim()) return;

    const pX0 = parseFloat(x0);
    const pX1 = parseFloat(x1);
    const pX2 = parseFloat(x2);

    onSolveString(
      polyString,
      tolerance,
      maxIterations,
      decimals,
      {
        useCustomSeeds,
        x0: !isNaN(pX0) ? pX0 : 0,
        x1: !isNaN(pX1) ? pX1 : 0.5,
        x2: !isNaN(pX2) ? pX2 : 1.0,
      }
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Header con Historial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>⚙️</span> Configuración del Polinomio & Filtro IIR
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Módulo asíncrono con evaluación de semillas de Müller, presets de ingeniería e historial persistente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <HistoryDrawer onSelectHistoryItem={handleSelectHistoryItem} />

          {/* Selector de Precisión */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Precisión:</span>
            <select
              value={decimals}
              onChange={(e) => setDecimals(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value={6}>6 decimals</option>
              <option value={8}>8 decimals</option>
              <option value={10}>10 decimals</option>
              <option value={12}>12 decimals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Presets de Ingeniería (1-Clic) */}
      <EngineeringPresetsSelector
        onSelectPreset={handleSelectEngineeringPreset}
        activePresetId={activePresetId}
      />

      {/* Formulario Libre */}
      <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
            Expresión del Polinomio Característico P(z) = 0:
          </label>
          <div className="relative">
            <input
              type="text"
              value={polyString}
              onChange={(e) => {
                setPolyString(e.target.value);
                setActivePresetId('');
              }}
              placeholder="Ej: x^4 + x^3 - 3*x^2 - x + 2"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              required
            />
            <span className="absolute right-3 top-2.5 text-xs font-mono text-zinc-400">P(z) = 0</span>
          </div>
        </div>

        {/* Las 3 Cajitas (Semillas Iniciales) */}
        <ThreeBoxInput
          useCustomSeeds={useCustomSeeds}
          onToggleUseCustomSeeds={(val) => {
            setUseCustomSeeds(val);
            setActivePresetId('');
          }}
          x0={x0}
          x1={x1}
          x2={x2}
          onChangeX0={(v) => {
            setX0(v);
            setActivePresetId('');
          }}
          onChangeX1={(v) => {
            setX1(v);
            setActivePresetId('');
          }}
          onChangeX2={(v) => {
            setX2(v);
            setActivePresetId('');
          }}
          onResetDefaults={handleResetDefaults}
        />

        {/* Parámetros Numéricos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
              Tolerancia del Error ε (%):
            </label>
            <input
              type="number"
              step="any"
              min="1e-12"
              max="10"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.001)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
              Límite de Iteraciones:
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value) || 100)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Botón de Cálculo */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span>Calculando con Método de Müller...</span>
          ) : (
            <>
              <span>⚡</span>
              <span>Ejecutar Müller & Análisis de Estabilidad IIR</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
