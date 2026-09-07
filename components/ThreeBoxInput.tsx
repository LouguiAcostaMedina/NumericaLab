'use client';

import React from 'react';

interface ThreeBoxInputProps {
  x0: string;
  x1: string;
  x2: string;
  onChangeX0: (val: string) => void;
  onChangeX1: (val: string) => void;
  onChangeX2: (val: string) => void;
  onResetDefaults: () => void;
  labels?: { x0Label?: string; x1Label?: string; x2Label?: string };
}

/**
 * Componente "Las 3 Cajitas" para la entrada optimizada de 3 semillas iniciales (e.g. Método de Müller).
 * Incluye validación en tiempo real y reinicio a "Defaults Inteligentes".
 */
export const ThreeBoxInput: React.FC<ThreeBoxInputProps> = ({
  x0,
  x1,
  x2,
  onChangeX0,
  onChangeX1,
  onChangeX2,
  onResetDefaults,
  labels = { x0Label: 'Semilla x₀', x1Label: 'Semilla x₁', x2Label: 'Semilla x₂' },
}) => {
  const isX0Valid = x0.trim() !== '' && !isNaN(Number(x0));
  const isX1Valid = x1.trim() !== '' && !isNaN(Number(x1));
  const isX2Valid = x2.trim() !== '' && !isNaN(Number(x2));

  return (
    <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>📦</span> Las 3 Cajitas (Semillas Iniciales)
        </label>
        <button
          type="button"
          onClick={onResetDefaults}
          className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold flex items-center gap-1 hover:underline cursor-pointer transition-colors"
          title="Restablece valores por defecto seguros (0, 0.5, 1.0) para evitar estancamiento iterativo"
        >
          <span>🔄</span> Reset to Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Cajita 1: x0 */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 font-mono">
            {labels.x0Label || 'x₀'}
          </span>
          <input
            type="number"
            step="any"
            value={x0}
            onChange={(e) => onChangeX0(e.target.value)}
            placeholder="0"
            className={`w-full px-3 py-2 text-xs rounded-lg font-mono bg-white dark:bg-zinc-900 border ${
              !isX0Valid
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-zinc-300 dark:border-zinc-700 focus:ring-cyan-500'
            } text-zinc-900 dark:text-white outline-none focus:ring-2 transition-all`}
          />
        </div>

        {/* Cajita 2: x1 */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 font-mono">
            {labels.x1Label || 'x₁'}
          </span>
          <input
            type="number"
            step="any"
            value={x1}
            onChange={(e) => onChangeX1(e.target.value)}
            placeholder="0.5"
            className={`w-full px-3 py-2 text-xs rounded-lg font-mono bg-white dark:bg-zinc-900 border ${
              !isX1Valid
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-zinc-300 dark:border-zinc-700 focus:ring-cyan-500'
            } text-zinc-900 dark:text-white outline-none focus:ring-2 transition-all`}
          />
        </div>

        {/* Cajita 3: x2 */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 font-mono">
            {labels.x2Label || 'x₂'}
          </span>
          <input
            type="number"
            step="any"
            value={x2}
            onChange={(e) => onChangeX2(e.target.value)}
            placeholder="1.0"
            className={`w-full px-3 py-2 text-xs rounded-lg font-mono bg-white dark:bg-zinc-900 border ${
              !isX2Valid
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-zinc-300 dark:border-zinc-700 focus:ring-cyan-500'
            } text-zinc-900 dark:text-white outline-none focus:ring-2 transition-all`}
          />
        </div>
      </div>

      {(!isX0Valid || !isX1Valid || !isX2Valid) && (
        <p className="text-[10px] text-rose-500 font-medium">
          ⚠️ Por favor asegúrate de ingresar números válidos en las tres cajitas.
        </p>
      )}
    </div>
  );
};
