'use client';

import React from 'react';

interface ThreeBoxInputProps {
  useCustomSeeds: boolean;
  onToggleUseCustomSeeds: (val: boolean) => void;
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
 * Componente "Las 3 Cajitas" para la entrada de semillas de Müller
 * con selector de modo "Semillas Personalizadas" vs "Autogenerar con Cotas de Lagrange".
 */
export const ThreeBoxInput: React.FC<ThreeBoxInputProps> = ({
  useCustomSeeds,
  onToggleUseCustomSeeds,
  x0,
  x1,
  x2,
  onChangeX0,
  onChangeX1,
  onChangeX2,
  onResetDefaults,
  labels = { x0Label: 'Semilla z₀', x1Label: 'Semilla z₁', x2Label: 'Semilla z₂' },
}) => {
  const isX0Valid = x0.trim() !== '' && !isNaN(Number(x0));
  const isX1Valid = x1.trim() !== '' && !isNaN(Number(x1));
  const isX2Valid = x2.trim() !== '' && !isNaN(Number(x2));

  return (
    <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
      {/* Selector de Modo y Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
            <span>📦</span> Semillas de Müller:
          </label>
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => onToggleUseCustomSeeds(!useCustomSeeds)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              useCustomSeeds ? 'bg-cyan-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
            role="switch"
            aria-checked={useCustomSeeds}
            aria-label="Alternar entre semillas personalizadas y autogeneración"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                useCustomSeeds ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {useCustomSeeds ? (
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Semillas Personalizadas (z₀, z₁, z₂)</span>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400">Autogenerar (Cotas de Lagrange)</span>
            )}
          </span>
        </div>

        {useCustomSeeds && (
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold flex items-center gap-1 hover:underline cursor-pointer transition-colors self-end sm:self-auto"
            title="Restablece valores seguros (0, 0.5, 1.0) para asegurar convergencia estricta"
          >
            <span>🔄</span> Defaults (0, 0.5, 1.0)
          </button>
        )}
      </div>

      {useCustomSeeds ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cajita 1: x0 */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 font-mono">
                {labels.x0Label || 'z₀'}
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
                {labels.x1Label || 'z₁'}
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
                {labels.x2Label || 'z₂'}
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
      ) : (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-xs text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
          <span>🎯</span>
          <span>
            <strong>Modo Autogeneración:</strong> Las semillas se distribuyen geométricamente sobre el radio espectral de Lagrange para aislar raíces complejas y conjugadas.
          </span>
        </div>
      )}
    </div>
  );
};
