'use client';

import React from 'react';
import { ENGINEERING_PRESETS } from '../core/domain/presetsData';
import { EngineeringPreset } from '../core/domain/history';

interface EngineeringPresetsSelectorProps {
  onSelectPreset: (preset: EngineeringPreset) => void;
  activePresetId?: string;
}

/**
 * Componente para seleccionar Presets de Ingeniería de 1-Clic.
 */
export const EngineeringPresetsSelector: React.FC<EngineeringPresetsSelectorProps> = ({
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>🚀</span> Presets de Ingeniería (1-Clic)
        </label>
        <span className="text-[10px] text-zinc-400">Casos reales de aplicación</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ENGINEERING_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const isIIRMain = preset.id === 'iir-stability-main';

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/40 shadow-sm font-semibold'
                  : isIIRMain
                  ? 'border-cyan-300 dark:border-cyan-800/80 bg-cyan-50/40 dark:bg-cyan-950/20 text-zinc-900 dark:text-zinc-100 hover:border-cyan-500'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold flex items-center gap-1">
                    {isIIRMain && <span>⭐</span>}
                    {preset.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  {preset.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>{preset.expression}</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Cargar →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
